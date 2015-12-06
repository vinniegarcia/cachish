'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

require('babel-runtime/core-js');

var _events = require('events');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultTimeout = 600000;

var later = function later(f) {
  return setTimeout(f, 0);
};

var coolName = function coolName(name) {
  return typeof name === 'string';
};

var Cachish = (function (_EventEmitter) {
  _inherits(Cachish, _EventEmitter);

  function Cachish() {
    var timeout = arguments.length <= 0 || arguments[0] === undefined ? defaultTimeout : arguments[0];

    _classCallCheck(this, Cachish);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Cachish).call(this));

    _this.data = {};
    _this.emit('init', {});
    _this.timeout = timeout;
    return _this;
  }

  _createClass(Cachish, [{
    key: 'check',
    value: function check(id) {
      var exists = id in this.data;
      var isStale = exists && this.stale(id);
      if (isStale) {
        this.emit('stale', {
          id: id });
      }
      return exists && !isStale;
    }
  }, {
    key: 'fresh',
    value: function fresh(id) {
      return id in this.data && this.data[id].expires > Date.now();
    }
  }, {
    key: 'stale',
    value: function stale(id) {
      return !this.fresh(id);
    }
  }, {
    key: 'set',
    value: function set(id, value) {
      var _this2 = this;

      var eventType = 'add',
          previousValue = undefined;
      if (id in this.data) {
        previousValue = this.data[id];
        eventType = 'change';
      }
      var payload = {
        id: id,
        previousValue: previousValue,
        value: value };
      return new Promise(function (resolve, reject) {
        later(function () {
          _this2.data[id] = {
            value: value,
            expires: Date.now() + _this2.timeout
          };
          _this2.emit(eventType, payload);
          resolve();
        });
      });
    }
  }, {
    key: 'add',
    value: function add(id, value) {
      return this.set(id, value);
    }
  }, {
    key: 'update',
    value: function update(id, value) {
      return this.set(id, value);
    }
  }, {
    key: 'get',
    value: function get(id) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        if (coolName(id) && _this3.check(id)) {
          _this3.emit('found', {
            id: id,
            value: _this3.data[id]
          });
          return resolve(_this3.data[id]);
        } else {
          _this3.emit('missing', {
            id: id });
          return reject(new Error('Cache key ' + id + ' not found'));
        }
      });
    }
  }, {
    key: 'delete',
    value: function _delete(id) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        later(function () {
          if (coolName(id)) {
            delete _this4.data[id];
            _this4.emit('delete', {
              id: id });
          }
          resolve();
        });
      });
    }
  }, {
    key: 'size',
    value: function size() {
      return Object.keys(this.data).length;
    }
  }, {
    key: 'clear',
    value: function clear() {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        later(function () {
          _this5.data = {};
          _this5.emit('empty', {});
          resolve();
        });
      });
    }
  }]);

  return Cachish;
})(_events.EventEmitter);

exports.default = Cachish;