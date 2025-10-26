import type { Asset } from '@talking/types';

export const useAssets = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;

  const listAssets = async (params?: { limit?: number; cursor?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.cursor) query.append('cursor', params.cursor);

    const url = `${apiBase}/assets${query.toString() ? '?' + query.toString() : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch assets: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      items: data.items as Asset[],
      nextCursor: data.nextCursor as string | null,
    };
  };

  const getAsset = async (id: string): Promise<Asset> => {
    const url = `${apiBase}/assets/${id}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.statusText}`);
    }

    return await response.json();
  };

  return {
    listAssets,
    getAsset,
  };
};
