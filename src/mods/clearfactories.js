import Fimod from '../Fimod';

import { insertStyle } from '../lib/utility';

const style = `
.controlsBox {
  width: 17em;
  float: right;
}

.controlsBox .clearPackagesButton {
  width: 7em;
}

.controlsBox .clearFactoryButton {
  width: 7em;
  border: 1px solid darkred;
}
`;

const buttonTemplate = `
<a id="clearFactory" class="button clearFactoryButton" href="javascript:void(0);">Clear factory</a>
`;

Fimod.define({
  name: "clearfactories",
  label: "Clear Factories",
  description: "Provides a button to remove all buildings from a factory floor",
},
['game/Factory', 'game/action/SellComponentAction', 'ui/factory/ControlsUi', 'ui/helper/ConfirmUi'],
(Factory, SellComponentAction, ControlsUi, ConfirmUi) => {
  insertStyle(style);

  Fimod.wrap(ControlsUi, 'display', function(supr, ...args) {
    supr(...args);

    const $container = this.container;
    const $tracksButton = $('#clearPackages', $container);
    const $factoryButton = $(buttonTemplate);
    $tracksButton.after($factoryButton);

    const sellComponents = () => {
      this.factory.getTiles()
        .filter(tile => tile.isMainComponentContainer())
        .map(tile => {
          const meta = tile.getComponent().meta;
          return new SellComponentAction(tile, meta.width, meta.height);
        })
        .map(action => {
          if (action.canSell()) action.sell();
        });
    };

    $factoryButton.click((_event) => {
      const confirm = new ConfirmUi("Clear slot", "Are you sure you want to clear this factory?");
      confirm
        .setOkTitle("Cancel")
        .setCancelTitle("Yes, clear factory")
        .setCancelCallback(sellComponents)
        .display();
    });
  });
});