import Fimod from '../Fimod';

const FACTORY_TICK = 'FACTORY_TICK';
const FACTORY_COMPONENTS_CHANGED = 'FACTORY_COMPONENTS_CHANGED';

const REVERSE_EFFICIENCIES = [
  'sorterVertical',
  'sorterHorizontal',
  'garbageCollector',
];

Fimod.define({
  name: "showefficiency",
  label: "Show Building Efficiency",
  description: "Puts an colored icon on each building to show its efficiency",
},
['ui/factory/MapUi'],
(MapUi) => {
  const colors = [
    "#FF0000",
    "#FF8000",
    "#FFC000",
    "#FFFF00",
    "#C0FF00",
    "#00FF00",
  ];

  const namespace = "LayerEfficiency";
  class EfficiencyLayer {
    constructor(imageMap, factory, meta) {
      this.imageMap = imageMap;
      this.factory = factory;
      this.game = factory.getGame();
      this.tileSize = meta.tileSize;
      this.tilesX = factory.getMeta().tilesX;
      this.tilesY = factory.getMeta().tilesY;
      this.canvas = null;
      this.cache = [];
    }

    getCanvas() {
      return this.canvas;
    }

    display(container) {
      this.container = container;
      this.canvas = document.createElement('canvas');
      this.canvas.style.position = 'absolute';
      this.canvas.width = this.tilesX * this.tileSize;
      this.canvas.height = this.tilesY * this.tileSize;
      this.canvas.style.pointerEvents = 'none';
      container.append(this.canvas);

      this.buildCache();
      this.redraw();

      this.factory.getEventManager().addListener(namespace, FACTORY_TICK, () => {
        if (this.game.getTicker().getIsFocused()) {
          this.redraw();
        }
      });
      this.factory.getEventManager().addListener(namespace, FACTORY_COMPONENTS_CHANGED, () => {
        this.buildCache();
        this.clear();
        this.redraw();
      });
    }

    buildCache() {
      this.cache = this.factory.getTiles()
        .filter(tile => tile.isMainComponentContainer())
        .map(tile => {
          return {
            last: -1,
            component: tile.getComponent()
          };
        });
    }

    clear() {
      const context = this.canvas.getContext('2d');
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    redraw() {
      const context = this.canvas.getContext('2d');
      this.cache.map(item => {
        const { last, component } = item;
        const data = component.getDescriptionData();
        const effectiveness = data.effectivenessStr;
        if (effectiveness === undefined) return;
        const efficiency = parseInt(effectiveness);
        if (isNaN(efficiency)) return;
        if (last == efficiency) return;
        item.last = efficiency;
        this.drawEfficiency(context, component, efficiency);
      });
    }

    drawEfficiency(context, component, efficiency) {
      const tile = component.getMainTile();
      const meta = component.getMeta();

      const reverse = REVERSE_EFFICIENCIES.indexOf(meta.id) !== -1;
      if (reverse) efficiency = 100 - efficiency;

      const size = this.tileSize;
      const iconSize = (size / 6);
      const x = tile.getX() * size + (iconSize * 1.5);
      const y = (tile.getY() + meta.height) * size - (iconSize * 1.5);

      context.fillStyle = colors[((colors.length - 1) * (efficiency / 100)).toFixed()];
      context.beginPath();
      context.arc(x, y, iconSize, 0, 2 * Math.PI);
      context.fill();
    }
  }

  Fimod.wrap(MapUi, 'display', function(supr, ...args) {
    supr(...args);

    if (this.efficiencyLayer === undefined) {
      this.efficiencyLayer = new EfficiencyLayer(this.imageMap, this.factory, {
        tileSize: this.tileSize,
      });
    }

    this.efficiencyLayer.display(this.element);
  });
});