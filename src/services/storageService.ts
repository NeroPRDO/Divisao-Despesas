import { supabase } from '../lib/supabase';

function getExtensionFromUri(uri: string) {
  const match = /\.([a-zA-Z0-9]+)(\?|$)/.exec(uri);
  return match?.[1]?.toLowerCase() ?? 'jpg';
}

function getContentType(extension: string) {
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return 'image/jpeg';
}

export async function uploadReceiptImage(uri: string, groupId: string, userId: string): Promise<string> {
  const extension = getExtensionFromUri(uri);
  const filePath = `${groupId}/${userId}/${Date.now()}.${extension}`;
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from('receipts')
    .upload(filePath, arrayBuffer, {
      contentType: getContentType(extension),
      upsert: false
    });

  if (error) throw error;

  const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
  return data.publicUrl;
}
