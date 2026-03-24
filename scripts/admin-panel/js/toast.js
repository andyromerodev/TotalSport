const DEFAULT_DURATION = 3200;

export function createToast(root) {
  function show(message, type = 'info', duration = DEFAULT_DURATION) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

    const text = document.createElement('span');
    text.className = 'toast-text';
    text.textContent = message;

    const close = document.createElement('button');
    close.className = 'toast-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Cerrar notificacion');
    close.textContent = '×';

    close.addEventListener('click', () => dismiss(toast));
    toast.append(text, close);
    root.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    if (duration > 0) {
      setTimeout(() => dismiss(toast), duration);
    }
  }

  function dismiss(toast) {
    if (!toast || !toast.parentElement) return;
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 180);
  }

  return {
    info(message, duration) {
      show(message, 'info', duration);
    },
    success(message, duration) {
      show(message, 'success', duration);
    },
    error(message, duration) {
      show(message, 'error', duration);
    }
  };
}
