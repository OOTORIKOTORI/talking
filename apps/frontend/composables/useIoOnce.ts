// IntersectionObserver for lazy loading optimization
import { useIntersectionObserver } from '@vueuse/core'

export function useIoOnce(el: Ref<HTMLElement | undefined>, callback: () => void) {
  const { stop } = useIntersectionObserver(
    el,
    ([entry]) => {
      if (entry.isIntersecting) {
        callback()
        stop()
      }
    },
    {
      threshold: 0.1,
    }
  )

  return stop
}
