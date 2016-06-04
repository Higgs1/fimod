import Fimod from '../Fimod';

import { clamp } from '../lib/common';

const FACTORY_MOUSE_DOWN = 'FACTORY_MOUSE_DOWN';
const FACTORY_MOUSE_MOVE = 'FACTORY_MOUSE_MOVE';
const FACTORY_MOUSE_UP = 'FACTORY_MOUSE_UP';
const FACTORY_MOUSE_OUT = 'FACTORY_MOUSE_OUT';

Fimod.define({
  name: "fixmouse",
  label: "Fix Mouse",
  description: "Fixes mouse interaction for Firefox",
},
['ui/factory/mapLayers/MouseLayer'],
(MouseLayer) => {
  MouseLayer.prototype._setupNativeMouseEvents = function() {
    let last;

    this.element.get(0).addEventListener("mouseout", () => {
      this.factory.getEventManager().invokeEvent(FACTORY_MOUSE_OUT, last);
      last = null;
    }, false);

    this.element.get(0).addEventListener("mousemove", (event) => {
      let size = {
        width: 1,
        height: 1,
      };

      if (this.selectedComponentMetaId) {
        size = this.game.getMeta().componentsById[this.selectedComponentMetaId];
      }

      const rect = this.element.get(0).getBoundingClientRect();
      const x = event.clientX - rect.left - this.tileSize * size.width / 2;
      const y = event.clientY - rect.top - this.tileSize * size.height / 2;
      const data = {
        x: clamp(Math.round(x / this.tileSize), 0, this.tilesX - size.width),
        y: clamp(Math.round(y / this.tileSize), 0, this.tilesY - size.height),
        leftMouseDown: event.buttons & 1,
        rightMouseDown: event.buttons & 2,
        shiftKeyDown: event.shiftKey,
        altKeyDown: event.altKey,
      };

      if (!last || last.x != data.x || last.y != data.y) {
        this.factory.getEventManager().invokeEvent(FACTORY_MOUSE_MOVE, data);
      }

      last = data;
    }, false);

    this.element.get(0).addEventListener("mousedown", (event) => {
      const data = {
        x: last.x,
        y: last.y,
        leftMouseDown: event.buttons & 1,
        rightMouseDown: event.buttons & 2,
        shiftKeyDown: event.shiftKey,
        altKeyDown: event.altKey,
      };

      this.factory.getEventManager().invokeEvent(FACTORY_MOUSE_DOWN, data);
    });

    this.element.get(0).addEventListener("mouseup", () => {
      this.factory.getEventManager().invokeEvent(FACTORY_MOUSE_UP, last);
    });
  };
});