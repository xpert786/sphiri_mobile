import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiConstants } from '@/api/endpoints';
import { AppState, AppStateStatus } from 'react-native';
import { StringConstants } from '@/constants/StringConstants';

type WSMessageCallback = (data: any) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string = '';
  private token: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 4;
  private backoffIntervals: number[] = [1000, 2000, 4000, 8000]; // 1s, 2s, 4s, 8s
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  
  private onMessageCallbacks: Set<WSMessageCallback> = new Set();
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  // Track app state to manage background/foreground sockets
  private appStateSubscription: any = null;
  private currentAppState: AppStateStatus = AppState.currentState;

  constructor(endpointPath: string) {
    // 1) Replace http/https with ws/wss
    // 2) The documentation states that WS use the root domain (e.g 168.231.121.7), ignoring path segments like /sphiri/api/
    const urlObj = new URL(ApiConstants.BASE_URL);
    let wsProtocol = urlObj.protocol.replace('http', 'ws');
    
    // Explicitly construct purely from domain Host without api subpaths
    let baseUrl = `${wsProtocol}//${urlObj.host}`;

    // Ensure there is no double slash before the endpoint
    if (!endpointPath.startsWith('/')) {
        this.url = `${baseUrl}/${endpointPath}`;
    } else {
        this.url = `${baseUrl}${endpointPath}`;
    }

    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        this.currentAppState.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground, reconnect
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
          this.reconnectAttempts = 0;
          this.connect();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background, disconnect to save battery
        this.disconnect();
      }
      this.currentAppState = nextAppState;
    });
  }

  public async connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return; // Already connecting or connected
    }

    try {
      this.token = await AsyncStorage.getItem(StringConstants.ACCESS_TOKEN);
      if (!this.token) {
        console.warn('WebSocket connection aborted: No JWT token found.');
        return;
      }

      const separator = this.url.includes('?') ? '&' : '?';
      const wsUrl = `${this.url}${separator}token=${this.token}`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket successfully opened for:', this.url);
        this.reconnectAttempts = 0; // Reset
        this.startPing();
        if (this.onConnectCallback) this.onConnectCallback();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessageCallbacks.forEach(cb => cb(data));
        } catch (error) {
          console.error('WebSocket parse error:', error, event.data);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`WebSocket closed: ${this.url}`, event.code, event.reason);
        this.stopPing();
        this.ws = null;
        if (this.onDisconnectCallback) this.onDisconnectCallback();
        
        // Code 1006 indicates abnormal closure (e.g. network drop) or server disconnect
        if (event.code !== 1000 && this.currentAppState === 'active') { // 1000 = normal closure
             this.handleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Error is usually followed by close, which handles reconnection logic
      };

    } catch (e) {
      console.error('Error in connect()', e);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.backoffIntervals[this.reconnectAttempts] || 8000;
      console.log(`WebSocket reconnecting in ${delay}ms (Attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    } else {
      console.warn('WebSocket max reconnect attempts reached.');
    }
  }

  // Regular heartbeat
  private startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 25000); // Send ping every 25 seconds
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public send(data: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    }
    console.warn('WebSocket not open, cannot send:', data);
    return false;
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.stopPing();
    
    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
    }
  }

  public cleanup() {
    this.disconnect();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.onMessageCallbacks.clear();
    this.onConnectCallback = null;
    this.onDisconnectCallback = null;
  }

  // --- Subscriptions ---
  
  public onMessage(callback: WSMessageCallback) {
    this.onMessageCallbacks.add(callback);
    return () => this.onMessageCallbacks.delete(callback);
  }

  public onConnect(callback: () => void) {
    this.onConnectCallback = callback;
  }

  public onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback;
  }
}

export default function WebSocketServiceDummy() {
  return null;
}
