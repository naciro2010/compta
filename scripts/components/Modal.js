import { sanitize, t } from '../utils/format.js';

let currentModal = null;

function trapFocus(container) {
  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const elements = Array.from(container.querySelectorAll(focusableSelectors));
  if (elements.length === 0) return;
  const first = elements[0];
  const last = elements[elements.length - 1];
  container.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  first.focus();
}

export function closeModal() {
  if (currentModal) {
    currentModal.remove();
    currentModal = null;
    document.body.classList.remove('modal-open');
  }
}

/**
 * Open a modal container with custom content.
 * @param {string} title
 * @param {HTMLElement|string} content
 */
export function openModal(title, content) {
  closeModal();
  const root = document.getElementById('modal-root');
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.role = 'dialog';
  backdrop.setAttribute('aria-modal', 'true');

  const modal = document.createElement('div');
  modal.className = 'modal';

  const header = document.createElement('header');
  const h2 = document.createElement('h2');
  h2.innerHTML = sanitize(title);
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', t('modal.close'));
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', closeModal);
  header.append(h2, closeBtn);

  const body = document.createElement('div');
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else {
    body.appendChild(content);
  }

  modal.append(header, body);
  backdrop.appendChild(modal);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });
  root.appendChild(backdrop);
  currentModal = backdrop;
  document.body.classList.add('modal-open');
  trapFocus(modal);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});
