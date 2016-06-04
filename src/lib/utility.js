export function preventScript(src) {
  document.addEventListener('beforescriptexecute', (event) => {
    if (event.target.src == src) {
      event.preventDefault();
    }
  }, true);
}

export function getScript(src) {
  return fetch(src).then(response => response.text());
}

export function insertElement(data, tag) {
  const element = document.createElement(tag);
  element.textContent = data.toString();
  document.head.appendChild(element);
}

export function insertScript(data) {
  insertElement(data, 'script');
}

export function insertStyle(data) {
  insertElement(data, 'style');
}