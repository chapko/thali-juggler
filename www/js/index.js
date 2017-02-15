/* globals EventEmitter */

function UI (app) {
  EventEmitter.call(this);
  bindAll(this, 'onReady', 'onSubmit');

  this.app = app;

  this.form = document.querySelector('#start_form');
  this.urlInput = document.querySelector('#url');
  this.btn = document.querySelector('#start');
  this.urlInput.disabled = true;
  this.btn.disabled = true;

  this.app.on('ready', this.onReady);
}

UI.prototype = Object.create(EventEmitter.prototype);
Object.assign(UI.prototype, {
  onReady: function () {
    this.urlInput.disabled = false;
    this.btn.disabled = false;

    this.form.addEventListener('submit', this.onSubmit);
  },

  onSubmit: function (event) {
    event.preventDefault();
    var remoteUrl = this.urlInput.value;
    app.downloadSource(remoteUrl);
  },
});

var app = new EventEmitter();
Object.assign(app, {
  sources: [],

  initialize: function () {
    console.log('jxcore - init');

    document.addEventListener('deviceready', function () {
      console.log('jxcore - cordova:deviceready');
      jxcore.isReady(function () {
        console.log('jxcore - jxcore:isReady');
        jxcore('index.js').loadMainFile(function (ret, err) {
          console.log('jxocre - jxcore:loadMainFile callback:', err, ret);
          if (err) {
            alert(err.message || String(err));
            return;
          }
          this.emit('ready');
          this.start();
        }.bind(this));
      }.bind(this));
    }.bind(this), false);

  },

  start: function () {
    console.log('jxcore STARTED');
    // this.loadRemotes();
  },

  getRecentRemotes: function () {
    var remotes = localStorage.getItem('recentRemotes');
    try {
      return JSON.parse(remotes);
    } catch (e) {
      return [];
    }
  },

  downloadSource: function (remoteUrl) {
    var address = 'http://' + remoteUrl + '/?download=1';
    window.jxcore('run').call(address, function (err) {
      if (err) {
        window.alert(err.message);
        return;
      }
      document.body.innerHTML = 'ok';
    });
  },
});

var ui = new UI(app);
app.initialize();












function bindAll() {
  var methods = Array.prototype.slice.call(arguments);
  var target = methods.shift();
  methods.forEach(function (methodName) {
    var method = target[methodName];
    if (typeof method === 'function') {
      target[methodName] = method.bind(target);
    }
  });
}
