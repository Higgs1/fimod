export function preventScript(src) {
  return new Promise(resolve => {
    const handleScript = (event) => {
      if (event.target.src == src) {
        event.preventDefault();
        document.removeEventListener('beforescriptexecute', handleScript);
        if (window._disconnectBeforeScriptExecute) window._disconnectBeforeScriptExecute();
        resolve();
      }
    };

    document.addEventListener('beforescriptexecute', handleScript, true);
  });
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