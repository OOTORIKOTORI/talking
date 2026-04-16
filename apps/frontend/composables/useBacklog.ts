import type { BacklogEntry } from '@talking/types'

/**
 * バックログの状態管理。
 * useState で管理してページ内コンポーネント間で共有する。
 * play.vue がロード/リスタートするタイミングで reset() を呼ぶこと。
 */
export const useBacklog = () => {
  const entries = useState<BacklogEntry[]>('backlog:entries', () => [])
  const isOpen = useState<boolean>('backlog:isOpen', () => false)

  const push = (entry: BacklogEntry) => {
    entries.value = [...entries.value, entry]
  }

  const reset = () => {
    entries.value = []
    isOpen.value = false
  }

  const open = () => { isOpen.value = true }
  const close = () => { isOpen.value = false }

  return { entries, isOpen, push, reset, open, close }
}
