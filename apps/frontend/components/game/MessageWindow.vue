<template>
  <div class="mw pointer-events-auto">
    <div
      v-if="speaker && (theme.name?.show ?? true)"
      class="name"
      :style="{
        background: theme.name?.bg ?? 'rgba(0,0,0,0.55)',
        color: theme.name?.color ?? '#fff',
        borderRadius: `calc(${theme.name?.radius ?? 12}px * var(--stage-scale, 1))`,
        padding: `calc(${theme.name?.padding ?? 8}px * var(--stage-scale, 1))`
      }"
    >
      <span class="font-semibold">{{ speaker }}</span>
    </div>

    <p
      class="text"
      :style="{
        color: theme.text?.color ?? '#fff',
        fontSize: `calc(${theme.text?.size ?? 18}px * var(--stage-scale, 1))`,
        lineHeight: (theme.text?.lineHeight ?? 1.8)
      }"
    >
      {{ shown }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  speaker?: string | null
  text: string | null
  animate?: boolean
  theme?: any
}>()

const theme = computed(() => props.theme ?? {})
const shown = ref('')

let timer: any = null
function typeTo(target: string) {
  clearInterval(timer)
  if (!props.animate) { shown.value = target; return }
  shown.value = ''
  const ms = theme.value?.typewriter?.msPerChar ?? 25
  let i = 0
  timer = setInterval(() => {
    i++
    shown.value = target.slice(0, i)
    if (i >= target.length) clearInterval(timer)
  }, ms)
}

watch(() => props.text ?? '', (t) => typeTo(t), { immediate: true })
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.mw {
  position: absolute;
  left: calc(var(--mw-left, 0.07) * 100%);
  bottom: calc(var(--mw-bottom, 0.05) * 100%);
  width: calc(var(--mw-w, 0.86) * 100%);
  background: var(--mw-bg, rgba(20, 24, 36, 0.72));
  color: var(--mw-fg, #fff);
  border: var(--mw-border, 2px solid rgba(255, 255, 255, 0.2));
  border-radius: calc(16px * var(--stage-scale, 1));
  padding: calc(20px * var(--stage-scale, 1));
  box-sizing: border-box;
  line-height: var(--mw-lh, 1.8);
  backdrop-filter: blur(calc(2px * var(--stage-scale, 1)));
}

.name {
  font-weight: 700;
  display: inline-block;
  margin-bottom: calc(8px * var(--stage-scale, 1));
  padding: 0.3em 0.8em;
  border-radius: calc(12px * var(--stage-scale, 1));
  background: var(--name-bg, rgba(0, 0, 0, 0.55));
}

.text {
  white-space: pre-wrap;
}
</style>

