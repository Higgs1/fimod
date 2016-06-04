import Fimod from '../Fimod';

import { insertStyle } from '../lib/utility';

const START_BACKGROUND_MODE = 'START_BACKGROUND_MODE';
const BACKGROUND_MODE_STARTED = 'BACKGROUND_MODE_STARTED';
const BACKGROUND_MODE_STOPPED = 'BACKGROUND_MODE_STOPPED';
const FOCUS = 'FOCUS';

const style = `
#togglebgButton {
  float: right;
}
`;

const buttonTemplate = `
<a id="togglebgButton" href="javascript:void(0);">Background Mode</a>
`;

Fimod.define({
  name: "togglebackground",
  label: "Toggle Background Mode",
  description: "Disables automatic background mode and adds a manual toggle",
},
['ui/MainUi', 'ui/factory/MenuUi', 'ui/RunningInBackgroundInfoUi', 'game/Ticker'],
(MainUi, MenuUi, RunningInBackgroundInfoUi, Ticker) => {
  insertStyle(style);

  Fimod.wrap(MainUi, 'display', function(supr, ...args) {
    supr(...args);

    this.runningInBackgroundInfoUi.play = this.play;
  });

  Fimod.wrap(MenuUi, 'display', function(supr, ...args) {
    supr(...args);

    const $box = $('.menuBox', this.container);
    const $button = $(buttonTemplate);

    $button.click(() => {
      this.globalUiEm.invokeEvent(START_BACKGROUND_MODE);
    });
    $box.append($button);
  });

  const runningNamespace = 'RunningInBackgroundInfoUi';

  RunningInBackgroundInfoUi.prototype.delayedDisplay = () => {};

  Fimod.wrap(RunningInBackgroundInfoUi, 'init', function() {
    this.globalUiEm.addListener(runningNamespace, START_BACKGROUND_MODE, () => {
      console.log(this);
      this.play.game.getEventManager().invokeEvent(BACKGROUND_MODE_STARTED);
      this.display();
    });

    this.globalUiEm.addListener(runningNamespace, FOCUS, () => {
      this.play.game.getEventManager().invokeEvent(BACKGROUND_MODE_STOPPED);
      this.hide();
    });
  });

  Fimod.wrap(RunningInBackgroundInfoUi, 'display', function(supr, ...args) {
    supr(...args);

    const blur = () => {
      this.globalUiEm.invokeEvent(FOCUS);
    };

    this.backgroundElement.click(blur);
    this.containerElement.click(blur);
  });

  const tickerNamespace = 'Ticker';

  Fimod.wrap(Ticker, 'init', function(supr) {
    supr();

    this.game.getEventManager().addListener(tickerNamespace, BACKGROUND_MODE_STARTED, () => {
      this.startBackgroundMode();
    });
    this.game.getEventManager().addListener(tickerNamespace, BACKGROUND_MODE_STOPPED, () => {
      this.stopBackgroundMode();
    });
  });
  Ticker.prototype.startBackgroundModeTimer = () => {};
  Ticker.prototype.startBackgroundMode = function() {
    this.focused = false;
    this.updateInterval();
  };
  Ticker.prototype.disableBackgroundMode = () => {};
  Ticker.prototype.stopBackgroundMode = function() {
    this.focused = true;
    this.updateInterval();
  };
});