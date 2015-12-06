import test from 'tape'
import Cachish from '../cachish'

test('Simple cachich test', (t) => {
  t.plan(9)

  const $ = new Cachish(600000)
  let adds = 0,
    changes = 0,
    deletes = 0,
    empties = 0

  $.on('add', (item) => adds += 1)
  $.on('change', (item) => changes += 1)
  $.on('delete', (item) => deletes += 1)
  $.on('empty', (item) => empties += 1)

  $.add('test', 'hello')
    .then(() => {
      t.is(adds, 1, 'add event count should be 1')
      return $.get('test')
    })
    .then((val) => {
      t.is(val.value, 'hello', 'value should be `hello`')
      return $.update('test', 'world')
    })
    .then(() => {
      t.is(changes, 1, 'change event count should be 1')
      return $.get('test')
    })
    .then((val) => {
      t.is(val.value, 'world', 'value should be `world`')
      return $.add('test2', {
        value: 'bye'
      })
    })
    .then(() => {
      t.is(adds, 2, 'add event count should be 2')
      t.is($.size(), 2, 'size should be 2')
      return $.delete('test')
    })
    .then(() => {
      t.is(deletes, 1, 'delete event count should be 1')
      t.is($.size(), 1, 'size should be 1')
      return $.clear()
    })
    .then(() => {
      t.is(empties, 1, 'empty event count should be 1')
    })

})

test('Staleness test', (t) => {
  t.plan(3)

  const $ = new Cachish(1)
  let stales = 0, adds = 0

  $.on('stale', () => stales += 1)
  $.on('add', () => adds += 1)

  const promises = Promise.all([
    $.add('test', 'hello'),
    $.add('test2', 'world'),
    $.add('test3', '!!1!')
  ])

  setTimeout(() => {
    let checks = [
      $.check('test'),
      $.check('test2'),
      $.check('test3')
    ]
    t.same(
      checks,
      [false, false, false],
      'checks should all be false'
    )
    t.is(adds, 3, 'add event count should be 3')
    t.is(stales, 3, 'stale event count should be 3')
  }, 200)

})
