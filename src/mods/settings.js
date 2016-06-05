import Fimod from '../fimod';

import { insertStyle } from '../lib/utility';

const style = `
.iframe .topArea {
  font-size: 0.8em;
}

.iframe #fimod-settings {
  font-size: 0.8em;
}

#fimodButton {
  background: rgba(255, 128, 255, 0.2);
}

#fimodButton:hover {
  background: rgba(255, 128, 255, 0.5);
}

.fullscreen-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.fullscreen-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: black;
  opacity: 0.7;
}

.fullscreen-window {
  width: 500px;
  top: 10px;
  padding: 15px;
  border: 1px solid rgb(225, 225, 232);
  border-radius: 8px;
  background-color: black;
  font-size: 0.9em;
  position: relative;
  margin: 0 auto;
}

.fullscreen-window__close {
  color: white;
  font-weight: bold;
  float: right;
}

.fullscreen-window__title {
  font-size: 1.2em;
  color: lightblue;
}

.toggle {
  border-top: 2px solid rgba(255, 255, 255, 0.7);
  padding: 1em 0;
  clear: both;
}

.toggle__name {
  font-size: 1.3em;
  font-weight: bold;
  padding: 0 0 0.4em;
}

.toggle__description {
  opacity: 0.9;
  font-size: 0.9em;
}

.toggle__control {
  float: right;
  padding: 0.5em 0 0;
}

.toggle__label {
  position: relative;
  display: block;
  width: 100px;
  height: 2em;
  border-radius: 3px;
}

.toggle__label:before {
  content: "";
  display: block;
  width: 40%;
  position: absolute;
  top: 0;
  bottom: 0;
  background: lightgray;
  border-radius: 3px;
  border: 3px solid red;
}

.toggle__input {
  display: none;
}

.toggle__input + .toggle__label {
  background: gray;
}

.toggle__input:checked + .toggle__label {
  background: lightgray;
}

.toggle__input:checked + .toggle__label:before {
  right: 0;
  border-color: green;
  background-color: greenyellow;
}
`;

const containerTemplate = version => `
<div class="fullscreen-container">
  <div class="fullscreen-background"></div>
  <div id="fimod-settings" class="fullscreen-window">
    <a class="fullscreen-window__close" href="javascript:void(0);" style="float:right; display: block;">Close</a>
    <b class="fullscreen-window__title">fimod <em>${version}</em></b>
    <p>Toggle modules below. Refresh to load changes.</p>
    <div class="options"></div>
  </div>
</div>
`;

const inputTemplate = module => `
<div class="toggle">
  <div class="toggle__control">
    <input type="checkbox" class="toggle__input" id="fimod-${module.name}">
    <label for="fimod-${module.name}" class="toggle__label"></label>
  </div>
  <div class="toggle__info">
    <div class="toggle__name">${module.label}</div>
    <div class="toggle__description">${module.description}</div>
  </div>
</div>
`;

const buttonTemplate = `
<a id="fimodButton" href="javascript:void(0);">fimod</a>
`;

Fimod.define({
  name: "settings",
  system: true,
  weight: -1,
},
['ui/factory/MenuUi'],
(MenuUi) => {
  insertStyle(style);

  function showFimodMenu() {
    const $container = $(containerTemplate(Fimod.version));
    const $window = $('.fullscreen-window', $container);
    const $close = $('.fullscreen-window__close', $window);
    const $options = $('.options', $window);

    Fimod.mods.filter(m => !m.system).map(module => {
      const $element = $(inputTemplate(module));
      const $input = $('input', $element);
      $input.attr('checked', module.enabled);
      $input.change(event => {
        module.toggle(event.target.checked);
      });

      $options.append($element);
    });

    function closeFimodMenu() {
      $container.remove();
    }

    $window.click(e => e.stopPropagation());
    $container.click(closeFimodMenu);
    $close.click(closeFimodMenu);
    $('body').append($container);
  }

  Fimod.wrap(MenuUi, 'display', function(supr, ...args) {
    supr(...args);

    const $settings = $('#settingsButton');
    const $button = $(buttonTemplate);

    $button.click(showFimodMenu);
    $settings.after($button);
  });
});