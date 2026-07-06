/**
 * Toast global mínimo (singleton de módulo).
 *
 * Um estado reativo compartilhado por toda a app; qualquer componente
 * chama `toast(...)` e o <RgToast /> montado uma vez (no ConsultaShell)
 * exibe. Auto-fecha depois de alguns segundos.
 */
import { ref } from 'vue';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastState {
  show: boolean;
  message: string;
  detail: string;
  tone: ToastTone;
}

const state = ref<ToastState>({ show: false, message: '', detail: '', tone: 'success' });
let timer: ReturnType<typeof setTimeout> | undefined;

export function useToast() {
  function toast(message: string, detail = '', tone: ToastTone = 'success', duration = 4000) {
    if (timer) clearTimeout(timer);
    state.value = { show: true, message, detail, tone };
    timer = setTimeout(() => {
      state.value = { ...state.value, show: false };
    }, duration);
  }

  function dismiss() {
    if (timer) clearTimeout(timer);
    state.value = { ...state.value, show: false };
  }

  return { state, toast, dismiss };
}
