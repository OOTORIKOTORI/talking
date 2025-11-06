import { onMounted, onBeforeUnmount, ref, type Ref } from 'vue'

export function useStageScale(elRef: Ref<HTMLElement | null>, baseW = 1280, baseH = 720) {
  const scale = ref(1)
  let ro: ResizeObserver | null = null

  const update = () => {
    const el = elRef.value
    if (!el) return
    const w = el.clientWidth
    const h = el.clientHeight
    const s = Math.min(w / baseW, h / baseH)
    scale.value = s
    el.style.setProperty('--stage-scale', String(s))
    el.style.setProperty('--stage-base-w', `${baseW}px`)
    el.style.setProperty('--stage-base-h', `${baseH}px`)
  }

  onMounted(() => { 
    update()
    ro = new ResizeObserver(update)
    if (elRef.value) ro.observe(elRef.value)
  })
  
  onBeforeUnmount(() => { 
    if (ro && elRef.value) ro.unobserve(elRef.value)
  })

  return { scale }
}
