import type { GameCreditsResult } from '@talking/types'
import type { Ref } from 'vue'

type LoadStaffRollCreditsOptions = {
  force?: boolean
}

type UseStaffRollCreditsOptions = {
  getGameId: () => string
  credits: Ref<GameCreditsResult | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchCredits: (gameId: string) => Promise<GameCreditsResult>
  errorMessage: string
}

export function useStaffRollCredits(options: UseStaffRollCreditsOptions) {
  async function loadStaffRollCredits(opts?: LoadStaffRollCreditsOptions) {
    const gameId = String(options.getGameId() || '')
    if (!gameId) return
    if (!opts?.force && options.credits.value) {
      options.error.value = null
      return
    }

    options.loading.value = true
    options.error.value = null
    try {
      options.credits.value = await options.fetchCredits(gameId)
    } catch (e: any) {
      options.error.value = e?.data?.message || e?.message || options.errorMessage
    } finally {
      options.loading.value = false
    }
  }

  return {
    loadStaffRollCredits,
  }
}