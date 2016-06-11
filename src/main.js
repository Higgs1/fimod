import Fimod from './fimod';
import { preventScript, getScript, insertScript } from './lib/utility';
import './lib/beforescriptexecute-polyfill.js';
import './lib/requestFullscreen-polyfill.js';
import './mods';

const SCRIPT_SRC = 'http://factoryidle.com/app.js';
let loadingMessage;

preventScript(SCRIPT_SRC);

getScript(SCRIPT_SRC)
  .then(source => {
    if (window.top !== window.self) document.body.classList.add('iframe');
    loadingMessage = document.querySelector('#loadingMessage');
    loadingMessage.innerText = "Loading Fimod...";

    const variables = [
      'require', 'define', 'BinaryTest', 'isBrowserSupported', 'PlayFab', 'logger', 
      'GameUiEvent', 'GameEvent', 'FactoryEvent', 'GlobalUiEvent', 'ApiEvent',
    ];
    const object = '{' + variables.map(v => `"${v}": ${v}`).join(', ') + '}';

    const start = source.indexOf('var MainInstance');
    return new Promise(resolve => {
      window.__FIMOD_RESOLVE__ = resolve;
      insertScript(`${source.substring(0, start)}; __FIMOD_RESOLVE__(${object}); }()`);
    });
  })
  .then(variables => {
    Object.keys(variables).map(key => {
      window[key] = variables[key];
    });

    return Fimod.require(['text!template/settings.html']).then(([ template ]) => {
      let version;
      try {
        version = template.match(/Version ([\d\.]+)/)[1];
      }
      finally {
        if (version == Fimod.version.substring(0, version.length)) return;

        loadingMessage.innerText = "Version mismatch. Possible incompatibility.";
        return new Promise(resolve => setTimeout(resolve, 2000));
      }
    });
  })
  .then(() => {
    return Fimod.load();
  })
  .then(() => {
    loadingMessage.innerText = "Loading Factory Idle...";
    const paths = ['Main', 'lib/jquery', 'base/Logger', 'base/NumberFormat', 'lib/handlebars', 'text', 'lib/bin/Binary'];

    return Fimod.require(paths).then(([ Main ]) => {
      window.GAME_LOADED = true;
      window.onerror = window.oldErrorHandler;
      window.BinaryTest.test();
      if (window.isBrowserSupported()) {
        Fimod.MainInstance = new Main;
        Fimod.MainInstance.init(false, () => {});
        window.Fidmod = Fimod
      }
    });
  });
