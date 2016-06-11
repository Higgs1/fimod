import Fimod from '../Fimod';

import { insertStyle } from '../lib/utility';

const style = `
html {
  overflow-y: auto;
}

html, body, #main, #gameArea {
  height: 100%;
  width: 100%;
}

#main {
  display: table;
}

#adArea {
  display: table-row;
  height: 100px;
}

#gameArea {
  display: table-row;
  border: none;
  float: none;
}

#gameArea:before {
  content: '';
  display: block;
  width: 100%;
  height: 1px;
  background gray;
  margin-top: -1px;
}

#factoryLayout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

#menuArea {
  flex: 0 0 30px;
}

#topArea {
  display: flex;
  flex: 0 0 110px;
}

#bottomArea {
  flex: 1;
  display: flex;
}

#leftArea {
  flex: 0 0 210px;
}

#rightArea {
  flex: 1;
  overflow:hidden;
}

.overviewContainer {
  flex: 0 0 210px;
}

.infoContainer {
  flex: 1;
}

.controlsContainer {
  flex: 0 0 210px;
}

.overviewContainer,
.infoContainer,
.controlsContainer {
  padding: 10px 0;
}

.infoContainer {
  position: relative;
}

.componentControls {
  position: absolute;
  right: 0;
}

#toggleFullscreenButton {
  float: right;
}

.controlsBox .button {
  margin: 0 5px 5px 0;
}

#bonusTicks {
  padding-top: 5px;
}
`;

const factoryTemplate = `
<div id="factoryLayout">
  <div id="menuArea">
    <div class="menuContainer"></div>
  </div>
  <div id="topArea">
    <div class="overviewContainer"></div>
    <div class="infoContainer"></div>
    <div class="controlsContainer"></div>
  </div>
  <div id="bottomArea">
    <div id="leftArea">
      <div class="componentsContainer"></div>
    </div>
    <div id="rightArea">
      <div class="mapContainer"></div>
    </div>
  </div>
  <div id="hidden" style="display: none;">
    <div class="incentivizedAdButtonContainer"></div>
    <div class="mapToolsContainer"></div>
  </div>
</div>
`;

const buttonTemplate = `
<a id="toggleFullscreenButton" href="javascript:void(0);">Fullscreen</a>
`;

Fimod.define({
  name: "fullscreenmode",
  label: "Fullscreen Mode",
  description: "Rearranges layout and enabled full-screen toggle",
},
['game/Game', 'ui/MainUi', 'ui/FactoryUi', 'ui/factory/MapUi', 'ui/factory/MenuUi'],
(Game, MainUi, FactoryUi, MapUi, MenuUi) => {
  insertStyle(style);

  Fimod.wrap(MainUi, 'display', function(supr, ...args) {
    supr(...args);

    const $main = $('#main');
    const $adArea = $('<div id="adArea" class="ad_box"></div>');
    const $ads = $('.adsbygoogle').parent();
    if ($ads.length) {
      $adArea.append($ads);
      $ads.last().remove();
      $main.prepend($adArea);
    }
    $('> br', $main).remove();
    $main.removeClass('main mainWithAdd');
  });

  Fimod.wrap(MapUi, 'display', function(supr, ...args) {
    supr(...args);

    this._resize = () => {
      const reset = {
        width: 1,
        height: 1,
      };

      this.container.css(reset);
      this.overlay.css(reset);

      const size = {
        width: this.container.parent().width(),
        height: this.container.parent().height(),
      };

      this.container.css(size);
      this.overlay.css(size);
    };

    this._resize();
    window.addEventListener("resize", this._resize);
    setTimeout(() => this._resize(), 1); // Firefox needs this for some reason
  });

  Fimod.wrap(MapUi, 'destroy', function(supr) {
    supr();
    window.removeEventListener("resize", this._resize);
  });

  FactoryUi.prototype.display = function(container) {
    this.container = container;
    this.container.html(factoryTemplate);

    const uis = ['menu', 'map', 'components', 'info', 'controls', 'overview', 'incentivizedAdButton', 'mapTools'];
    uis.map(ui => this[`${ui}Ui`].display(this.container.find(`.${ui}Container`)));
  };

  Fimod.wrap(MenuUi, 'display', function(supr, ...args) {
    supr(...args);

    const $box = $('.menuBox', this.container);
    const $button = $(buttonTemplate);

    $button.click(() => {
      document.toggleFullScreen();
    });
    $box.append($button);
  });
});