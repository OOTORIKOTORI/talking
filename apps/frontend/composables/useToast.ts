// シンプルなtoast実装（vue-sonnerの代わり）
interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastOptions {
  duration?: number
  action?: ToastAction
}

class ToastManager {
  private toasts: Array<{ id: string; message: string; type: string; action?: ToastAction }> = []
  private listeners: Array<() => void> = []

  show(message: string, type: string, options: ToastOptions = {}) {
    const id = Math.random().toString(36)
    const toast = { id, message, type, action: options.action }
    this.toasts.push(toast)
    this.notify()

    const duration = options.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id)
      }, duration)
    }

    return () => this.dismiss(id)
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.notify()
  }

  subscribe(callback: () => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  private notify() {
    this.listeners.forEach(l => l())
  }

  getAll() {
    return [...this.toasts]
  }
}

const manager = new ToastManager()

export const useToast = () => {
  return {
    info: (message: string, options?: ToastOptions) => manager.show(message, 'info', options),
    success: (message: string, options?: ToastOptions) => manager.show(message, 'success', options),
    error: (message: string, options?: ToastOptions) => manager.show(message, 'error', options),
    warning: (message: string, options?: ToastOptions) => manager.show(message, 'warning', options),
    dismiss: (id: string) => manager.dismiss(id),
    getAll: () => manager.getAll(),
    subscribe: (callback: () => void) => manager.subscribe(callback),
  }
}
