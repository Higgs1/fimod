import Fimod from '../fimod';

import { insertStyle } from '../lib/utility';

const css = `
#gameArea .exportButton {
  background-color: lavender;
  border-color: darkslateblue;
}

#gameArea .exportBox {
  width: 120px;
  height: 60px;
  margin: 18px auto 0 auto;
  font-family: monospace;
}
`;

const components = {
  "wall": "#",
  "floor": ".",
  "semi": ",",
  "none": " ",
  "transportLine": "□╴╷┐╶─┌┬╵┘│┤└┴├┼",
  "garbageCollector": "%",
  "researchCenter": "@",
  "researchCenter2": "@",
  "researchCenter3": "@",
  "metalsLab": "&",
  "gasAndOilLab": "&",
  "ironSeller": "$",
  "steelSeller": "$",
  "plasticSeller": "$",
  "coalBuyer": "c",
  "gasBuyer": "g",
  "ironBuyer": "i",
  "oilBuyer": "o",
  "ironFoundry": "I",
  "plasticMaker": "P",
  "steelFoundry": "S",
};

Fimod.define({
  name: "exportfactories",
  label: "Export Factories",
  description: "Allows exporting factory data to text notation",
},
['game/Factory', 'ui/FactoriesUi'],
(Factory, FactoriesUi) => {
  insertStyle(css, 'style');

  Factory.prototype.exportToString = function() {
    const tiles = this.tiles.map((tile) => {
      let id;

      if (tile.component) {
        id = tile.component.meta.id;

        if (id == "transportLine") {
          const i = tile.getInputOutputManager().getInputsByDirection();
          const o = tile.getInputOutputManager().getOutputsByDirection();
          const rep = [(i.top || o.top), (i.right || o.right), (i.bottom || o.bottom), (i.left || o.left)].map((v) => v ? '1' : '0').join('');
          const s = parseInt(rep, 2);
          return components[id][s];
        }
      }
      else {
        id = tile.terrain;

        if (id == 'grass' || id == 'road') {
          id = tile.buildableType == '-' ? 'semi' : 'none';
        }
      }

      if (id in components) return components[id];
      return '?';
    }).join('');

    let rows = [];

    for (let n = 0; n < this.meta.tilesY; n++) {
      rows.push(tiles.substr(n * this.meta.tilesX, this.meta.tilesX));
    }

    return rows.join("\n");
  };

  Fimod.wrap(FactoriesUi, 'display', function(supr, $container) {
    supr($container);

    $('.factoryButton', $container).each((i, node) => {
      const level = $(node).attr('data-id');
      if (this.game.getFactory(level).getIsBought() === false) return;
      const $export = $(`<div class="button exportButton" data-id="${level}">EXPORT TEXT</div>`);
      $(node).after($export);

      $export.click(() => {
        const string = this.game.getFactory(level).exportToString();
        const $textarea = $(`<textarea class="exportBox">${string}</textarea>`);
        $export.after($textarea);
        $export.remove();
        $textarea.select();
      });
      $(node).append($export);
    });
  });
});
