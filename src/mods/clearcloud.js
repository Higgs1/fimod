import Fimod from '../fimod';

Fimod.define({
  name: "clearcloud",
  label: "Clear Cloud Saves",
  description: "Allows the deletion of cloud save slots",
},
['play/api/Web', 'play/api/api/PlayFabApi', 'play/SaveManager', 'ui/SettingsUi', 'ui/helper/ConfirmUi'],
(Web, PlayFabApi, SaveManager, SettingsUi, ConfirmUi) => {
  Web.prototype.clear = function(slot, done) {
    this.playFabApi.clear(slot, done);
  };

  const name = "PlayFab";

  PlayFabApi.prototype.clear = function(slot, done) {
    var request = {
      KeysToRemove: [slot, this._getMetaVarName(slot)],
    };

    window.PlayFab.ClientApi.UpdateUserData(request, function(response) {
      if (response && response.code == 200) {
        window.logger.info(name, "Cleared " + slot);
        done(true);
      }
      else {
        window.logger.error(name, "Clear failed!");
        done(false);
      }
    }.bind(this));
  };

  SaveManager.prototype._clearCloud = function(slot, done) {
    if (this.useCloud) {
      this.api.clear(slot, done);
    }
    else {
      window.logger.info(name, "Cloud save skipped!");
      done();
    }
  };

  Fimod.wrap(SettingsUi, '_display', function(supr, ...args) {
    supr(...args);

    const $panel = $("#settings");
    $panel.find(".loadSlot").each((i, node) => {
      const slot = $(node).attr('data-id');
      $(node).after(`<input type="button" class="clearSlot" data-id="${slot}" value="Clear">`);
    });

    $panel.find(".clearSlot").click((event) => {
      const slot = $(event.target).attr('data-id');
      const confirm = new ConfirmUi("Clear slot", "Are you sure you want to clear this slot?");
      confirm
        .setOkTitle("Cancel")
        .setCancelTitle("Yes, clear slot")
        .setCancelCallback(() => {
          this.saveManager._clearCloud(slot, () => {
            this.hide();
          });
        })
        .display();
    });
  });
});
