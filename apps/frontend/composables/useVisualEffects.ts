import { ref, onBeforeUnmount, type Ref } from 'vue'
import type { VisualEffect } from '@talking/types'

// エフェクトのプリセット設定
const EFFECT_PRESETS = {
  shake: {
    small: { intensity: 5, duration: 300, frequency: 30 },
    medium: { intensity: 12, duration: 500, frequency: 30 },
    large: { intensity: 25, duration: 700, frequency: 30 },
  },
  flash: {
    small: { intensity: 0.4, duration: 200, color: '#ffffff' },
    medium: { intensity: 0.7, duration: 300, color: '#ffffff' },
    large: { intensity: 1.0, duration: 400, color: '#ffffff' },
  },
}

export interface EffectState {
  shake?: {
    translateX: number
    translateY: number
  }
  flash?: {
    opacity: number
    color: string
  }
}

export function useVisualEffects() {
  const isPlaying = ref(false)
  const effectState = ref<EffectState>({})
  
  let animId: number | null = null

  function playEffect(effect: VisualEffect | null | undefined) {
    if (!effect) return
    
    stopEffect()
    isPlaying.value = true
    
    if (effect.type === 'shake') {
      playShake(effect)
    } else if (effect.type === 'flash') {
      playFlash(effect)
    }
  }

  function playShake(effect: VisualEffect) {
    const preset = EFFECT_PRESETS.shake[effect.intensity]
    const { intensity, duration, frequency } = preset
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = elapsed / duration

      if (progress < 1) {
        // 減衰する振動を生成
        const decay = 1 - progress
        const angle = (elapsed * frequency / 1000) * Math.PI * 2
        const offsetX = Math.sin(angle) * intensity * decay
        const offsetY = Math.cos(angle * 1.3) * intensity * decay * 0.5 // Y軸は少し弱め

        effectState.value = {
          shake: {
            translateX: offsetX,
            translateY: offsetY,
          },
        }

        animId = requestAnimationFrame(animate)
      } else {
        // 終了時は元の位置に戻す
        effectState.value = {
          shake: {
            translateX: 0,
            translateY: 0,
          },
        }
        stopEffect()
      }
    }

    animId = requestAnimationFrame(animate)
  }

  function playFlash(effect: VisualEffect) {
    const preset = EFFECT_PRESETS.flash[effect.intensity]
    const { intensity, duration, color } = preset
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = elapsed / duration

      if (progress < 1) {
        // フラッシュはフェードアウト
        const opacity = (1 - progress) * intensity

        effectState.value = {
          flash: {
            opacity,
            color,
          },
        }

        animId = requestAnimationFrame(animate)
      } else {
        // 終了
        effectState.value = {}
        stopEffect()
      }
    }

    animId = requestAnimationFrame(animate)
  }

  function stopEffect() {
    if (animId !== null) {
      cancelAnimationFrame(animId)
      animId = null
    }
    isPlaying.value = false
  }

  onBeforeUnmount(() => {
    stopEffect()
  })

  return {
    isPlaying,
    effectState,
    playEffect,
    stopEffect,
  }
}
