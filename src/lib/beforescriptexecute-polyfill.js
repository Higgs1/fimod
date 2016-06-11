if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
  const observer = new MutationObserver((mutations) => {
    mutations.map((mutation) => {
      if (mutation.addedNodes.length === 0) return;
      const node = mutation.addedNodes[0];
      if (node.tagName == 'SCRIPT') {
        const event = new Event('beforescriptexecute', {
          bubbles: true,
          cancelable: true,
        });
        const canceled = !node.dispatchEvent(event);
        if (canceled) node.src = '';
      }
    });
  });
  observer.observe(document.documentElement, {childList: true, subtree: true});

  window._disconnectBeforeScriptExecute = function() {
    observer.disconnect();
  };
}
