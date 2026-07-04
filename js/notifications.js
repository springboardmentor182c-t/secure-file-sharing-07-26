// ===== TrustShare Notification System =====

const Notifications = {
  toastCount: 0,

  show(title, message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };

    const id = `toast-${++this.toastCount}`;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.id = id;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
      <button class="toast-close" onclick="Notifications.dismiss('${id}')">&times;</button>
    `;

    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  },

  dismiss(id) {
    const toast = document.getElementById(id);
    if (!toast) return;
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  },

  success(title, message, duration) { return this.show(title, message, 'success', duration); },
  error(title, message, duration) { return this.show(title, message, 'error', duration); },
  warning(title, message, duration) { return this.show(title, message, 'warning', duration); },
  info(title, message, duration) { return this.show(title, message, 'info', duration); },
};

window.Notifications = Notifications;
