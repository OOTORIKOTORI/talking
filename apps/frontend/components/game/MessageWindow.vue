<template>
  <div
    class="w-full select-none"
    :style="{
      '--bg': theme.frame?.bg ?? 'rgba(0,0,0,0.6)',
      '--bd': theme.frame?.borderColor ?? 'rgba(255,255,255,0.25)',
      '--bw': (theme.frame?.borderWidth ?? 2) + 'px',
      '--br': (theme.frame?.radius ?? 16) + 'px',
      '--pd': (theme.frame?.padding ?? 16) + 'px'
    }"
  >
    <div
      class="w-full border"
      :class="theme.frame?.shadow === false ? '' : 'shadow-lg'"
      :style="{ background: 'var(--bg)', borderColor: 'var(--bd)', borderWidth: 'var(--bw)', borderRadius: 'var(--br)', padding: 'var(--pd)' }"
      @click="$emit('click')"
    >
      <div
        v-if="speaker && (theme.name?.show ?? true)"
        class="inline-block mb-2"
        :style="{
          background: theme.name?.bg ?? 'rgba(0,0,0,0.55)',
          color: theme.name?.color ?? '#fff',
          borderRadius: (theme.name?.radius ?? 10) + 'px',
          padding: (theme.name?.padding ?? 8) + 'px'
        }"
      >
        <span class="font-semibold">{{ speaker }}</span>
      </div>

      <p
        class="whitespace-pre-wrap"
        :style="{
          color: theme.text?.color ?? '#fff',
          fontSize: (theme.text?.size ?? 16) + 'px',
          lineHeight: (theme.text?.lineHeight ?? 1.8)
        }"
      >
        {{ shown }}
      </p>
    </div>
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
