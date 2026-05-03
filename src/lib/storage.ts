import { createClient } from './supabase/client';

/**
 * Uploads a base64 encoded selfie image to Supabase Storage.
 */
export async function uploadCheckInSelfie(bookingId: string, base64Data: string): Promise<string | null> {
  const supabase = createClient();
  
  // Convert base64 to Blob
  const res = await fetch(base64Data);
  const blob = await res.blob();
  
  const fileName = `${bookingId}/${Date.now()}.jpg`;
  
  const { data, error } = await supabase.storage
    .from('check-ins')
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Storage upload error:', error);
    return null;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('check-ins')
    .getPublicUrl(data.path);

  return publicUrl;
}
