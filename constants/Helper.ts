import * as DocumentPicker from 'expo-document-picker';
import { StorageAccessFramework, cacheDirectory, documentDirectory, downloadAsync as legacyDownloadAsync, readAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

interface SharedDocument {
  id: number;
  title: string;
  file?: string;
  file_url?: string;
  url?: string;
  document?: string;
  attachment?: string;
  file_type: string;
  file_size: number;
  file_size_display: string;
  category: number;
  category_name: string;
  issue_date: string;
  expiration_date: string;
  expiration_status: string;
  status: string;
  is_shared: boolean;
  uploaded_by: string;
  linked_contacts: any[];
  tags_list: string[];
  created_at: string;
  updated_at: string;
}


export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const capitalizeFirstLetter = (text?: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr || typeof dateStr !== 'string') {
    return '';
  }

  const monthMap: Record<string, string> = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
  };

  const parts = dateStr.split(' '); // ["13", "Feb", "2026"]

  if (parts.length !== 3) {
    return '';
  }

  const [day, monthStr, year] = parts;
  const month = monthMap[monthStr];

  if (!month) {
    return '';
  }

  const formattedDay = day.padStart(2, '0');

  return `${month}/${formattedDay}/${year}`;
};



type UploadedFile = {
  uri: string;
  name: string;
  type: string;
  size: number;
} | null;

export const pickDocument = async (): Promise<UploadedFile> => {
  try {
    const result: any = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',                                  // PDF
        'application/msword',                               // DOC
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
        'image/jpeg',                                       // JPG/JPEG
        'image/png',                                        // PNG
      ],
      copyToCacheDirectory: true,
      multiple: false,
    });
    console.log("DocumentPicker result:", result);

    if (result.type === 'cancel') return null;

    // For newer versions, result has uri, name, mimeType directly
    return {
      uri: result.assets[0].uri || "",
      name: result.assets[0].name || "document",
      type: result.assets[0].mimeType ?? 'application/octet-stream',
      size: result.assets[0].size,
    };
  } catch (error) {
    console.log('Document pick error:', error);
    return null;
  }
};


export const handleDownload = async (item: SharedDocument | string) => {
  try {
    let url: string | undefined;
    let fileName: string;

    if (typeof item === 'string') {
      url = item;
      fileName = url.split('/').pop() || `document_${Date.now()}.pdf`;
    } else {
      url = item.file_url || item.url || item.file || item.document || item.attachment;
      fileName = url
        ? (url.split('/').pop() || `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`)
        : `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${item.id}.pdf`;
    }

    // Determine mime type from extension
    const ext = fileName.split('.').pop()?.toLowerCase();
    let mimeType = 'application/octet-stream';
    if (ext === 'pdf') mimeType = 'application/pdf';
    else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
    else if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'doc') mimeType = 'application/msword';
    else if (ext === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (url) {
      if (Platform.OS === 'android') {
        // Step 1: Download to cache
        const cacheUri = cacheDirectory + fileName;
        const downloadResult = await legacyDownloadAsync(url, cacheUri);

        if (downloadResult.status !== 200) {
          Alert.alert('Error', 'Failed to download file from server.');
          return;
        }

        // Step 2: Ask user to confirm/select the Downloads folder
        const downloadsUri = StorageAccessFramework.getUriForDirectoryInRoot('Download');
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(downloadsUri);

        if (!permissions.granted) {
          Alert.alert('Permission Denied', 'Storage access is required to save files to Downloads.');
          return;
        }

        // Step 3: Create the file in the selected directory
        const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
        const destUri = await StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileNameWithoutExt,
          mimeType
        );

        // Step 4: Read from cache and write to destination
        const base64Data = await readAsStringAsync(downloadResult.uri, { encoding: 'base64' as any });
        await StorageAccessFramework.writeAsStringAsync(destUri, base64Data, { encoding: 'base64' as any });

        Alert.alert('Downloaded!', `"${fileName}" has been saved to your device.`);

      } else {
        // iOS: Download to documents directory, then show Save to Files sheet
        const docUri = documentDirectory + fileName;
        const downloadResult = await legacyDownloadAsync(url, docUri);

        if (downloadResult.status !== 200) {
          Alert.alert('Error', 'Failed to download file from server.');
          return;
        }

        await Sharing.shareAsync(downloadResult.uri, {
          mimeType,
          dialogTitle: 'Save to Files',
          UTI: ext === 'pdf' ? 'com.adobe.pdf' : undefined,
        });
      }
    }

  } catch (error: any) {
    console.log('Download Error:', error);
    // If user cancelled the directory picker, don't show error
    if (error?.message?.includes('cancelled') || error?.message?.includes('canceled')) return;
    Alert.alert('Error', 'Failed to download document. Please try again.');
  }
};


export const RecentActivities = [
  { action: 'Added new contact', detail: 'John\'s Plumbing Services', time: '2 hours ago' },
  { action: 'Uploaded document', detail: 'Home Insurance Policy 2025', time: '5 hours ago' },
  { action: 'Completed task', detail: 'Pool Cleaning Service', time: 'Yesterday' },
];




