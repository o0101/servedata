
export function haveNotReloaded() {
  return !sessionStorage.getItem('reload');
}

export function tryReload() {
  sessionStorage.setItem('reload', true);
  location.reload();
}
