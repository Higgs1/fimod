import Fimod from '../Fimod';

import { insertStyle } from '../lib/utility';

const style = `
html {
  overflow-y: auto;
}

#main {
  display: table;
  height: 100%;
  width: 100%;
}

#adArea {
  display: table-row;
  height: 100px;
}

#gameArea {
  display: table-row;
  width: auto;
  float: none;
}

#gameArea:before {
  content: '';
  display: block;
  width: 100%;
  height: 1px;
  background: gray;
  margin-top: -1px;
}

.factoryBox {
  height: 100%;
}

.mapArea {
  height: 100%;
  width: 100%;
}

#gameArea .mapContainer {
  height: 100%;
}
`;

Fimod.define({
  name: "fullscreenmode",
  label: "Fullscreen Mode",
  description: "Enables full-screen map",
},
['game/Game', 'ui/MainUi', 'ui/factory/MapUi'],
(Game, MainUi, MapUi) => {
  insertStyle(style);

  Fimod.wrap(MainUi, 'display', function(supr, ...args) {
    supr(...args);

    const $main = $('#main');
    const $adArea = $('<div id="adArea" class="ad_box"></div>');
    const $ads = $('.adsbygoogle').parent();
    $adArea.append($ads);
    $ads.last().remove();
    $('> br', $main).remove();
    $main.prepend($adArea).removeClass('main mainWithAdd');
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
  });

  Fimod.wrap(MapUi, 'destroy', function(supr) {
    supr();
    window.removeEventListener("resize", this._resize);
  });
});