import Fimod from '../Fimod';

import { insertStyle } from '../lib/utility';
import { clamp } from '../lib/common'; 

const css = `
#gameArea .mapContainer > div {
  position: relative;
}

#gameArea .mapContainer > div > div {
  position: absolute !important;
  transform-origin: 0 0;
}
`;

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEPS = 25;
const ZOOM_LOG_MIN = Math.log(ZOOM_MIN);
const ZOOM_LOG_MAX = Math.log(ZOOM_MAX);
const ZOOM_LOG_STEP = (ZOOM_LOG_MAX - ZOOM_LOG_MIN) / ZOOM_STEPS;
const zoomAt = l => Math.pow(Math.E, ZOOM_LOG_MIN + ZOOM_LOG_STEP * (ZOOM_STEPS - l));

const FACTORY_MOUSE_DOWN = 'FACTORY_MOUSE_DOWN';
const FACTORY_MOUSE_UP = 'FACTORY_MOUSE_UP';
const FACTORY_MOUSE_MOVE = 'FACTORY_MOUSE_MOVE';
const FACTORY_MOUSE_OUT = 'FACTORY_MOUSE_OUT';
const FACTORY_SCROLL_END = 'FACTORY_SCROLL_END';
const FACTORY_SCROLL_START = 'FACTORY_SCROLL_START';
const COMPONENT_META_SELECTED = 'COMPONENT_META_SELECTED';

function constrainTo(point, coords) {
  return {
    top: clamp(coords.top, point.top - coords.height, point.top),
    left: clamp(coords.left, point.left - coords.width, point.left),
  };
}

Fimod.define({
  name: "mapnavigation",
  label: "Improved Map Navigation",
  description: "Keyboard movement, zooming, and more flexible map movement",
},
['ui/factory/MapUi', 'ui/factory/mapLayers/MouseLayer'],
(MapUi, MouseLayer) => {
  insertStyle(css);

  const namespace = 'FactoryMapUi';

  MapUi.prototype.setupMapDragging = function() {
    const $body = $('body');
    const $element = this.element;

    let componentBlocks = false;

    const componentSelected = componentId => {
      const meta = this.game.getMeta().componentsById[componentId];
      componentBlocks = !!meta && meta.buildByDragging;
    };

    this.factory.getEventManager().addListener(namespace, COMPONENT_META_SELECTED, componentSelected);

    const startDragging = event => {
      if (!(event.buttons & 1) || event.shiftKey || event.altKey || componentBlocks) return;

      const offset = $element.position();

      const origin = {
        top: offset.top,
        left: offset.left,
      };

      const point = {
        top: event.pageY,
        left: event.pageX,
      };

      const handleDragging = event => {
        const container = this.container.parent().get(0);
        const containerRect = container.getBoundingClientRect();
        const mapRect = $element.get(0).getBoundingClientRect();
        const coords = constrainTo({
          top: containerRect.height / 2,
          left: containerRect.width / 2,
        }, {
          top: origin.top + (event.pageY - point.top),
          left: origin.left + (event.pageX - point.left),
          width: mapRect.width,
          height: mapRect.height,
        });

        $element.get(0).style.top = coords.top + 'px';
        $element.get(0).style.left = coords.left + 'px';

        this.factory.getEventManager().invokeEvent(FACTORY_SCROLL_START);
      };

      const stopDragging = _event => {
        $body
          .off('mouseup', stopDragging)
          .off('mouseleave', stopDragging)
          .off('mousemove', handleDragging);

        this.factory.getEventManager().invokeEvent(FACTORY_SCROLL_END);
      };

      $body
        .on('mouseup', stopDragging)
        .on('mouseleave', stopDragging)
        .on('mousemove', handleDragging);
    };

    this.element.get(0).addEventListener('mousedown', startDragging);
  };

  MouseLayer.prototype._setupNativeMouseEvents = function() {
    const container = this.container.parent().parent().get(0);
    const map = this.container.get(0);
    const element = this.element.get(0);
    const em = this.factory.getEventManager();

    let scale = 1;
    let level = 15;
    let lastEvent;

    element.addEventListener('mouseout', event => {
      em.invokeEvent(FACTORY_MOUSE_OUT, event);
      lastEvent = null;
    }, false);

    element.addEventListener('mousemove', event => {
      let size = {
        width: 1,
        height: 1,
      };

      if (this.selectedComponentMetaId) {
        size = this.game.getMeta().componentsById[this.selectedComponentMetaId];
      }

      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / scale) - this.tileSize * size.width / 2;
      const y = ((event.clientY - rect.top) / scale) - this.tileSize * size.height / 2;
      const newEvent = {
        x: clamp(Math.round(x / this.tileSize), 0, this.tilesX - size.width),
        y: clamp(Math.round(y / this.tileSize), 0, this.tilesY - size.height),
        leftMouseDown: event.buttons & 1,
        rightMouseDown: event.buttons & 2,
        shiftKeyDown: event.shiftKey,
        altKeyDown: event.altKey, 
      };
      if (!lastEvent || lastEvent.x != newEvent.x || lastEvent.y != newEvent.y) {
        em.invokeEvent(FACTORY_MOUSE_MOVE, newEvent);
        lastEvent = newEvent;
      }
    }, false);

    element.addEventListener('mousedown', event => {
      em.invokeEvent(FACTORY_MOUSE_DOWN, {
        x: lastEvent.x,
        y: lastEvent.y,
        leftMouseDown: event.buttons & 1,
        rightMouseDown: event.buttons & 2,
        shiftKeyDown: event.shiftKey,
        altKeyDown: event.altKey, 
      });
    }, false);

    element.addEventListener('mouseup', _event => {
      em.invokeEvent(FACTORY_MOUSE_UP, lastEvent);
    }, false);

    const zoom = event => {
      let delta;
      if (event.detail) delta = (event.detail > 0) - (event.detail < 0);
      else delta = (event.wheelDelta < 0) - (event.wheelDelta > 0);

      level = clamp(level + delta, 0, ZOOM_STEPS - 1);
      scale = zoomAt(level).toFixed(2);
      if (level == 15) scale = 1; // ugh, hack

      const before = map.getBoundingClientRect();

      const x = event.clientX - before.left;
      const y = event.clientY - before.top;

      const px = x / before.width;
      const py = y / before.height;

      map.style.transform = `scale(${scale})`;

      const after = map.getBoundingClientRect();

      const width = before.width - after.width;
      const height = before.height - after.height;

      const dx = width * px;
      const dy = height * py;

      const containerRect = container.getBoundingClientRect();
      const coords = constrainTo({
        top: containerRect.height / 2,
        left: containerRect.width / 2,
      }, {
        top: after.top - containerRect.top + dy,
        left: after.left - containerRect.left + dx,
        width: after.width,
        height: after.height,
      });

      map.style.top = `${coords.top}px`;
      map.style.left = `${coords.left}px`;

      event.preventDefault();
    };

    container.addEventListener("mousewheel", zoom, false);
    container.addEventListener("DOMMouseScroll", zoom, false);
  };

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

      const container = this.container.parent().get(0);
      const map = this.container.get(0);

      const containerRect = container.getBoundingClientRect();
      const mapRect = map.getBoundingClientRect();

      const dy = movement.top * speed;
      const dx = movement.left * speed;

      const coords = constrainTo({
        top: containerRect.height / 2,
        left: containerRect.width / 2,
      }, {
        top: mapRect.top - containerRect.top + dy,
        left: mapRect.left - containerRect.left + dx,
        width: mapRect.width,
        height: mapRect.height,
      });

      map.style.top = coords.top + 'px';
      map.style.left = coords.left + 'px';
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