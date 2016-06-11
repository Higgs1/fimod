document.exitFullScreen = document.exitFullScreen || document.mozExitFullScreen || document.webkitExitFullscreen;

Object.defineProperty(document, 'isFullScreen', {
  get: function() {
    return this.mozIsFullScreen || this.webkitIsFullScreen;
  }
});

document.toggleFullScreen = function() {
  if (this.isFullScreen) this.exitFullScreen();
  else this.documentElement.requestFullScreen();
};

const element = document.documentElement;

element.requestFullScreen = element.requestFullScreen || element.mozRequestFullScreen || element.webkitRequestFullScreen;
