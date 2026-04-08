declare module 'expo-image-picker' {
  export type MediaType = 'images' | 'videos' | 'livePhotos';

  export type PermissionResponse = {
    granted: boolean;
    canAskAgain?: boolean;
    expires?: string;
    status?: string;
  };

  export type ImagePickerAsset = {
    uri: string;
    type?: string;
    fileName?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
    width?: number;
    height?: number;
    duration?: number | null;
  };

  export type ImagePickerSuccessResult = {
    canceled: false;
    assets: ImagePickerAsset[];
  };

  export type ImagePickerCanceledResult = {
    canceled: true;
    assets: null;
  };

  export type ImagePickerResult = ImagePickerSuccessResult | ImagePickerCanceledResult;

  export function requestMediaLibraryPermissionsAsync(): Promise<PermissionResponse>;
  export function launchImageLibraryAsync(options?: {
    mediaTypes?: MediaType[];
    allowsEditing?: boolean;
    quality?: number;
    videoMaxDuration?: number;
  }): Promise<ImagePickerResult>;
}
