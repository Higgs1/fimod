import Fimod from '../Fimod';

import { insertStyle } from '../lib/utility';

const style = `
html {
  overflow-y: auto;
}

.main {
  min-height: auto;
}

#gameArea {
  width: auto;
  float: none;
}

.componentsArea {
  width: 220px;
}

#gameArea .overviewContainer,
#gameArea .topContainer {
  height: 98px;
  overflow-y: hidden;
}

.mapContainer,
.mapContainer > div {
  width: calc(100vw - 220px);
  height: calc(100vh - 100px);
  margin: 0
}
`;

Fimod.define({
  name: "fullscreenmode",
  label: "Fullscreen Mode",
  description: "Hides ads and enables full-screen map",
},
['game/Game', 'ui/factory/MapUi'],
(Game, MapUi) => {
  insertStyle(style);

  Game.prototype.getIsPremium = () => true;

  Fimod.wrap(MapUi, 'display', function(supr, ...args) {
    supr(...args);

    var dimensions = {
      width: 'calc(100vw - 220px)',
      height: 'calc(100vh - 100px)',
      margin: 0,
    };

    this.overlay.css(dimensions);
    this.overlay.parent().css(dimensions);
    this.element.css({top: 0, left: 0});
  });
});