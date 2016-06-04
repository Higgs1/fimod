import Storage from './lib/storage';

export default class Fimod {
  static get mods() {
    if (this._mods === undefined) this._mods = [];
    return this._mods;
  }

  static get storage() {
    if (this._storage === undefined) this._storage = new Storage('Fimod');
    return this._storage;
  }

  static get version() {
    return GM_info.script.version.split('.').slice(0, 2).join('.');
  }

	static require(paths) {
    return new Promise(resolve => {
      window.require(paths, (...modules) => resolve(modules));
    });
  }

  static define() {
    const fimod = new Fimod(...arguments);
    Fimod.mods.push(fimod);
  }

  static load() {
    let promise = Promise.resolve();
    Fimod.mods.sort((a, b) => a.weight - b.weight).map(fimod => {
      promise = promise.then(() => {
        return Fimod.require(fimod.paths).then((modules) => fimod.load(modules));
      });
    });
    return promise;
  }

  static wrap(cls, method, fn) {
    const supr = cls.prototype[method];
    cls.prototype[method] = function(...args) {
      fn.call(this, supr.bind(this), ...args);
    };
  }

  constructor(properties, paths, install) {
    if (install === undefined) install = paths;

    Object.assign(this, {
      name: "no name",
      description: "no description",
      enabled: true,
      system: false,
      weight: 0,
      paths,
      install,
    }, properties);

    this.enabled = Fimod.storage.get(`module.${this.name}`, this.enabled);
  }

  toggle(value = null) {
    this.enabled = value !== null ? value : !this.enabled;
    Fimod.storage.set(`module.${this.name}`, this.enabled);
  }

  load(modules) {
    if (this.enabled === false && this.system === false) return;
    console.log(`Installing Fimod: ${this.name}`);
    return this.install(...modules);
  }
}