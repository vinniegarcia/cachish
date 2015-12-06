'use strict';

var _tape = require('tape');

var _tape2 = _interopRequireDefault(_tape);

var _cachish = require('../cachish');

var _cachish2 = _interopRequireDefault(_cachish);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _tape2.default)('Simple cachich test', function (t) {
  t.plan(9);

  var $ = new _cachish2.default(600000);
  var adds = 0,
      changes = 0,
      deletes = 0,
      empties = 0;

  $.on('add', function (item) {
    return adds += 1;
  });
  $.on('change', function (item) {
    return changes += 1;
  });
  $.on('delete', function (item) {
    return deletes += 1;
  });
  $.on('empty', function (item) {
    return empties += 1;
  });

  $.add('test', 'hello').then(function () {
    t.is(adds, 1, 'add event count should be 1');
    return $.get('test');
  }).then(function (val) {
    t.is(val.value, 'hello', 'value should be `hello`');
    return $.update('test', 'world');
  }).then(function () {
    t.is(changes, 1, 'change event count should be 1');
    return $.get('test');
  }).then(function (val) {
    t.is(val.value, 'world', 'value should be `world`');
    return $.add('test2', {
      value: 'bye'
    });
  }).then(function () {
    t.is(adds, 2, 'add event count should be 2');
    t.is($.size(), 2, 'size should be 2');
    return $.delete('test');
  }).then(function () {
    t.is(deletes, 1, 'delete event count should be 1');
    t.is($.size(), 1, 'size should be 1');
    return $.clear();
  }).then(function () {
    t.is(empties, 1, 'empty event count should be 1');
  });
});

(0, _tape2.default)('Staleness test', function (t) {
  t.plan(3);

  var $ = new _cachish2.default(1);
  var stales = 0,
      adds = 0;

  $.on('stale', function () {
    return stales += 1;
  });
  $.on('add', function () {
    return adds += 1;
  });

  var promises = Promise.all([$.add('test', 'hello'), $.add('test2', 'world'), $.add('test3', '!!1!')]);

  setTimeout(function () {
    var checks = [$.check('test'), $.check('test2'), $.check('test3')];
    t.same(checks, [false, false, false], 'checks should all be false');
    t.is(adds, 3, 'add event count should be 3');
    t.is(stales, 3, 'stale event count should be 3');
  }, 200);
});