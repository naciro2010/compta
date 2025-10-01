const listeners = [];
let routes = {};

function resolveRoute() {
  const hash = window.location.hash || '#/dashboard';
  const [, path] = hash.split('#/');
  return path ? path.split('?')[0] : 'dashboard';
}

export function initRouter(availableRoutes) {
  routes = availableRoutes;
  window.addEventListener('hashchange', notify);
  notify();
}

export function subscribe(fn) {
  listeners.push(fn);
}

function notify() {
  const path = resolveRoute();
  listeners.forEach((fn) => fn(path));
}

export function navigate(path) {
  window.location.hash = `#/${path}`;
}

export function getCurrentRoute() {
  return resolveRoute();
}
