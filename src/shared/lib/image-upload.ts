import * as FileSystem from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import type { ImagePickerAsset } from "expo-image-picker";

export const LOW_QUALITY_IMAGE_PICKER_OPTIONS = {
  base64: true,
  quality: 0.1,
} as const;

export const CHAT_IMAGE_PICKER_OPTIONS = {
  base64: false,
  quality: 0.8,
} as const;

const CHAT_IMAGE_MAX_SIDE = 1280;
const CHAT_IMAGE_COMPRESS = 0.55;

export function imageAssetToDataUri(asset: ImagePickerAsset): string | null {
  if (!asset.base64) return null;

  const mimeType = asset.mimeType ?? "image/jpeg";
  return `data:${mimeType};base64,${asset.base64}`;
}

export function imageAssetsToDataUris(assets: ImagePickerAsset[]): string[] {
  return assets
    .map(imageAssetToDataUri)
    .filter((uri): uri is string => Boolean(uri));
}

export async function chatImageAssetToDataUri(
  asset: ImagePickerAsset,
): Promise<string | null> {
  if (!asset.uri) return imageAssetToDataUri(asset);

  const resize =
    asset.width && asset.height
      ? asset.width >= asset.height
        ? { width: Math.min(asset.width, CHAT_IMAGE_MAX_SIDE) }
        : { height: Math.min(asset.height, CHAT_IMAGE_MAX_SIDE) }
      : { width: CHAT_IMAGE_MAX_SIDE };

  const result = await manipulateAsync(
    asset.uri,
    [{ resize }],
    {
      base64: true,
      compress: CHAT_IMAGE_COMPRESS,
      format: SaveFormat.JPEG,
    },
  );

  const base64 =
    result.base64 ||
    (await FileSystem.readAsStringAsync(result.uri, {
      encoding: FileSystem.EncodingType.Base64,
    }));

  return base64 ? `data:image/jpeg;base64,${base64}` : null;
}

export async function chatImageAssetsToDataUris(
  assets: ImagePickerAsset[],
): Promise<string[]> {
  const images = await Promise.all(assets.map(chatImageAssetToDataUri));

  return images.filter((uri): uri is string => Boolean(uri));
}
