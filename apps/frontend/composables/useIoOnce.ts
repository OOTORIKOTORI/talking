// IntersectionObserver for lazy loading optimization
import { onBeforeUnmount, watch } from 'vue'

export function useIoOnce(el: Ref<HTMLElement | undefined>, callback: () => void) {
  let observer: IntersectionObserver | null = null

  const stop = () => {
    observer?.disconnect()
    observer = null
  }

  watch(
    el,
    (target) => {
      stop()

      if (!target || typeof IntersectionObserver === 'undefined') return

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            callback()
            stop()
          }
        },
        {
          threshold: 0.1,
        }
      )

      observer.observe(target)
    },
    { immediate: true }
  )

  onBeforeUnmount(stop)

  return stop
}
