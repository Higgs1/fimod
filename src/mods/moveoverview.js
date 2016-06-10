import Fimod from '../fimod';

import { insertStyle } from '../lib/utility';

const style = `
#main #gameArea .topContainer {
  height: 115px;
}

#main #gameArea .overviewContainer {
  height: auto;
}

#main #gameArea .overviewBox {
  padding: 10px 0;
}

.menuContainer {
  padding-bottom: 10px;
}

.controlsBox .button {
  margin: 0 0 5px 5px;
}
`;

Fimod.define({
  name: "moveoverview",
  label: "Move Overview",
  description: "Moves overview into left panel to make the top less cramped",
},
['ui/FactoryUi'],
(FactoryUi) => {
  insertStyle(style);

  Fimod.wrap(FactoryUi, 'display', function(supr, ...args) {
    supr(...args);

    const $container = this.container;

    const $overviewArea = $('.overviewArea', $container);
    const $topArea = $('.topArea', $container);
    const $leftPanel = $('.componentsArea', $container);

    const $newOverviewArea = $('<div class="overviewArea"></div>');

    $newOverviewArea.append($overviewArea.children());
    $overviewArea.remove();
    $leftPanel.prepend($newOverviewArea);
    $topArea.attr({colspan: 2});
  });
});