<template>
  <div
    class="message-window"
    :style="frameStyle"
    @click="$emit('click')"
  >
    <!-- 話者名 -->
    <div
      v-if="theme.name.show && speaker"
      class="speaker-name"
      :style="nameStyle"
    >
      {{ speaker }}
    </div>

    <!-- メッセージテキスト -->
    <div class="message-text" :style="textStyle">
      {{ animatedText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'

interface MessageTheme {
  frame: {
    bg: string
    borderColor: string
    borderWidth: number
    radius: number
    padding: number
    shadow: boolean
  }
  name: {
    show: boolean
    bg: string
    color: string
    padding: number
    radius: number
  }
  text: {
    color: string
    size: number
    lineHeight: number
  }
  typewriter: {
    msPerChar: number
  }
}

const props = defineProps<{
  speaker: string
  text: string
  theme: MessageTheme
  animate?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()

// タイプライター効果用
const animatedText = ref('')
let typewriterTimer: NodeJS.Timeout | null = null

watch(
  () => props.text,
  (newText) => {
    if (typewriterTimer) {
      clearInterval(typewriterTimer)
      typewriterTimer = null
    }

    if (!props.animate) {
      animatedText.value = newText
      return
    }

    animatedText.value = ''
    let index = 0
    
    typewriterTimer = setInterval(() => {
      if (index < newText.length) {
        animatedText.value = newText.substring(0, index + 1)
        index++
      } else {
        if (typewriterTimer) {
          clearInterval(typewriterTimer)
          typewriterTimer = null
        }
      }
    }, props.theme.typewriter.msPerChar)
  },
  { immediate: true }
)

onUnmounted(() => {
  if (typewriterTimer) {
    clearInterval(typewriterTimer)
    typewriterTimer = null
  }
})

// スタイル計算
const frameStyle = computed(() => ({
  backgroundColor: props.theme.frame.bg,
  borderColor: props.theme.frame.borderColor,
  borderWidth: `${props.theme.frame.borderWidth}px`,
  borderStyle: 'solid',
  borderRadius: `${props.theme.frame.radius}px`,
  padding: `${props.theme.frame.padding}px`,
  boxShadow: props.theme.frame.shadow ? '0 4px 20px rgba(0,0,0,0.5)' : 'none',
  cursor: 'pointer',
  position: 'relative' as const,
}))

const nameStyle = computed(() => ({
  backgroundColor: props.theme.name.bg,
  color: props.theme.name.color,
  padding: `${props.theme.name.padding}px`,
  borderRadius: `${props.theme.name.radius}px`,
  display: 'inline-block',
  marginBottom: '8px',
  fontSize: '0.9em',
  fontWeight: 'bold',
}))

const textStyle = computed(() => ({
  color: props.theme.text.color,
  fontSize: `${props.theme.text.size}px`,
  lineHeight: props.theme.text.lineHeight,
  whiteSpace: 'pre-wrap' as const,
}))
</script>

<style scoped>
.message-window {
  user-select: none;
}

.speaker-name {
  user-select: none;
}

.message-text {
  user-select: none;
}
</style>
