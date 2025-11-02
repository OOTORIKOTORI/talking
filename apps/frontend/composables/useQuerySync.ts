import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * URL クエリパラメータと state を双方向同期する composable
 * @param defaults デフォルト値のオブジェクト
 * @returns リアクティブな state オブジェクト
 */
export function useQuerySync<T extends Record<string, any>>(defaults: T) {
  const route = useRoute()
  const router = useRouter()
  const state = ref<T>({ ...defaults }) as any

  // 初期化: URL -> state
  for (const k of Object.keys(defaults)) {
    const v = route.query[k]
    if (typeof v === 'string' && v.length) {
      (state.value as any)[k] = v
    }
  }

  // 変更時: state -> URL（デフォルト値は省略）
  watch(
    state,
    (val) => {
      const q: Record<string, string | undefined> = {}
      for (const [k, def] of Object.entries(defaults)) {
        const cur = (val as any)[k]
        q[k] = cur === def || cur === '' || cur == null ? undefined : String(cur)
      }
      router.replace({ query: q })
    },
    { deep: true }
  )

  return state as { value: T }
}
