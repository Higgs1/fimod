import Fimod from '../fimod';

Fimod.define({
  name: "resetgame",
  system: true,
},
['ui/SettingsUi', 'ui/helper/ConfirmUi'],
(SettingsUi, ConfirmUi) => {
  Fimod.wrap(SettingsUi, '_display', function(supr, ...args) {
    supr(...args);

    const $resetButton = $('#resetGame');
    $resetButton.off('click');
    $resetButton.click(() => {
      (new ConfirmUi("Reset game", "Are you sure you want to reset the game?"))
        .setCancelTitle("Yes, RESET GAME")
        .setOkTitle("Nooooo!!!")
        .setCancelCallback(() => {
          Fimod.MainInstance.destroy();
          Fimod.MainInstance.init(false);
          this.destroy();
        }).display();
    });
  });
});