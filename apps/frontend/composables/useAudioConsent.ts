import { ref } from 'vue'

const KEY = 'talking_audio_consent_v1'
export const audioConsent = ref(false)

export function initAudioConsent() {
  audioConsent.value = localStorage.getItem(KEY) === '1'
}

export async function grantAudioConsent(audioEls: HTMLMediaElement[]) {
  audioConsent.value = true
  localStorage.setItem(KEY, '1')
  
  for (const el of audioEls) {
    try {
      el.muted = false
      el.pause()
      void el.load()
      await el.play()
    } catch {
      // 失敗したらUI側で「クリックで再試行」案内
    }
  }
}
