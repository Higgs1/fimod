export default class Storage {
  constructor(key) {
    this.key = key;
    this.load();
  }

  load() {
    const json = localStorage.getItem(this.key);
    this.data = JSON.parse(json || "{}");
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.data));
  }

  get(key, d) {
    const value = this.data[key];
    if (value === undefined) return d;
    return value;
  }

  set(key, value) {
    this.data[key] = value;
    this.save();
  }
}