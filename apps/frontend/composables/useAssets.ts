// apps/frontend/composables/useAssets.ts
// 単一の composable に統一（公開一覧／自分の一覧／お気に入り／トグル）
export type AssetLike = { id: string; name?: string; isFavorited?: boolean; [k: string]: any }

// isFavorited の表記ゆれを吸収
export const normalizeAssetFavorite = (a: any): AssetLike => {
  const fav =
    a?.isFavorited ??
    a?.isFavorite ??
    a?.favorited ??
    a?.favoritedByMe ??
    a?.is_favorite
  return { ...a, isFavorited: !!fav }
}

export const useAssetsApi = () => {
  // Nuxt の composable （#imports で自動インポート前提）
  const $api = useApi()

  // 公開ギャラリー
  const listPublic = async (query: any = {}) => {
    const res: any = await $api('/assets', { query })
    if (Array.isArray(res?.items)) res.items = res.items.map(normalizeAssetFavorite)
    return res
  }

  // 自分の投稿一覧（検索エンドポイント経由）
  const searchMine = async (query: any = {}) => {
    const res: any = await $api('/search/assets', { query: { ...query, owner: 'me' } })
    if (Array.isArray(res?.items)) res.items = res.items.map(normalizeAssetFavorite)
    return res
  }

  // お気に入り一覧（APIは /favorites を使う）
  const listFavorites = async (): Promise<AssetLike[]> => {
    const res: any = await $api('/favorites')
    return Array.isArray(res?.items) ? res.items.map(normalizeAssetFavorite) : []
  }

  // お気に入りトグル
  const favorite   = (id: string) => $api(`/assets/${id}/favorite`, { method: 'POST' })
  const unfavorite = (id: string) => $api(`/assets/${id}/favorite`, { method: 'DELETE' })

  // 取得済み配列にお気に入りを適用（クライアント側で上書き）
  const applyFavorites = async (arr: AssetLike[] = []) => {
    const fav = await listFavorites()
    const set = new Set(fav.map((x: any) => x.id))
    return arr.map((x: any) => ({ ...x, isFavorited: set.has(x.id) }))
  }

  return {
    normalizeAssetFavorite,
    listPublic,
    searchMine,
    listFavorites,
    favorite,
    unfavorite,
    applyFavorites,
  }
}
