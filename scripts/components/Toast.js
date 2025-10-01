const root = document.getElementById('toast-root');
root.className = 'toast-stack';

/**
 * Display a toast message.
 * @param {string} message
 * @param {'info'|'success'|'warning'|'danger'} variant
 */
export function showToast(message, variant = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${variant}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  root.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

export default { showToast };
