import type { ImagePickerAsset } from "expo-image-picker";

export const LOW_QUALITY_IMAGE_PICKER_OPTIONS = {
  base64: true,
  quality: 0.1,
} as const;

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