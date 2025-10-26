import { ref } from 'vue';
import { getSignedGetUrl } from './useSignedUrl';

/**
 * Composable for handling image/media URLs with automatic refresh on 403 errors
 */
export const useAutoRefreshUrl = (initialKey: string) => {
  const url = ref<string>('');
  const loading = ref(false);
  const error = ref<string | null>(null);
  const retryCount = ref(0);
  const MAX_RETRIES = 2;

  const fetchUrl = async (key: string) => {
    try {
      loading.value = true;
      error.value = null;
      url.value = await getSignedGetUrl(key);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to get signed URL';
      console.error('Failed to fetch signed URL:', e);
    } finally {
      loading.value = false;
    }
  };

  const refreshUrl = async (key: string) => {
    if (retryCount.value >= MAX_RETRIES) {
      console.warn('Max retries reached for signed URL refresh');
      return;
    }
    retryCount.value++;
    await fetchUrl(key);
  };

  const handleError = async (event: Event, key: string) => {
    const target = event.target as HTMLImageElement | HTMLAudioElement | HTMLVideoElement;
    
    // Check if it's a 403 error by attempting to fetch the URL
    try {
      const response = await fetch(target.src, { method: 'HEAD' });
      if (response.status === 403) {
        console.log('Detected 403 error, refreshing signed URL');
        await refreshUrl(key);
      }
    } catch (e) {
      console.error('Error checking response status:', e);
      // Attempt refresh anyway
      await refreshUrl(key);
    }
  };

  // Initialize
  fetchUrl(initialKey);

  return {
    url,
    loading,
    error,
    refreshUrl,
    handleError,
  };
};
