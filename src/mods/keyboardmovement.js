import Fimod from '../fimod';

import { clamp } from '../lib/common'; 

Fimod.define({
  name: "keyboardmovement",
  label: "Keyboard Movement",
  description: "Enables use of WASD/arrow keys to navigate the map",
},
['ui/factory/mapLayers/MouseLayer'],
(MouseLayer) => {
  Fimod.wrap(MouseLayer, 'display', function(supr, ...args) {
    supr(...args);

    this.setupKeyboardListener();
  });

  MouseLayer.prototype.setupKeyboardListener = function() {
    let moveTimer;
    let resizeTimer;
    const delay = 5;
    const speed = 5;
    const moving = [];
    const movements = {
      UP:    { top:  1, left:  0 },
      LEFT:  { top:  0, left:  1 },
      DOWN:  { top: -1, left:  0 },
      RIGHT: { top:  0, left: -1 },
    };
    const directions = {
      87: "UP",
      65: "LEFT",
      83: "DOWN",
      68: "RIGHT",
      38: "UP",
      37: "LEFT",
      40: "DOWN",
      39: "RIGHT",
    };

    const applyMovement = () => {
      const add = (a, b) => { return { top: a.top + b.top, left: a.left + b.left }; };
      let movement = { top: 0, left: 0 };
      moving.map((direction) => movement = add(movement, movements[direction]));

      const element = this.element.parent();
      const container = this.container.parent();

      const offset = element.offset();
      const containerOffset = container.offset();

      element.offset({
        top: clamp(
          offset.top + (movement.top * speed),
          containerOffset.top - element.height() + container.height(),
          containerOffset.top
        ),
        left: clamp(
          offset.left + (movement.left * speed),
          containerOffset.left - element.width() + container.width(),
          containerOffset.left
        ),
      });
    };

    this._handleKeyboard = (event) => {
      if (!(event.keyCode in directions)) return;
      const direction = directions[event.keyCode];
      if (moving.indexOf(direction) != -1) return;
      moving.push(direction);
      if (moveTimer === undefined) moveTimer = setInterval(applyMovement, delay);

      const stopMovement = (event) => {
        if (!(event.keyCode in directions)) return;
        if (directions[event.keyCode] != direction) return;
        const index = moving.indexOf(direction);
        if (index == -1) return;

        moving.splice(index, 1);
        if (moving.length === 0) moveTimer = clearInterval(moveTimer);
      };

      document.body.addEventListener("keyup", stopMovement);
    };

    this._handleResize = () => {
      if (resizeTimer !== undefined) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => applyMovement(), 100);
    };

    document.body.addEventListener("keydown", this._handleKeyboard);
    window.addEventListener("resize", this._handleResize);
  };

  Fimod.wrap(MouseLayer, 'destroy', function(supr) {
    supr();
    document.body.removeEventListener("keydown", this._handleKeyboard);
    window.removeEventListener("resize", this._handleResize);
  });
});