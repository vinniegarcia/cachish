# cachish
A simple name/value expiring evented asynchronous cache

##Usage

```javascript
var Cachish = require('cachish')

var cache = new Cachish(300000) //feed a timeout value in msecs, default is 10 minutes

cache.set('itemName', 'hello')

cache.get('itemName').then(function (value) {
	console.log(value) //=> hello
})
```

##API
* `get(key)` - returns a `Promise` for the value of `key` in cache
* `add(key, value)` - adds to the cache asynchronously
* `update(key, value)` - updates `key` in the cache
* `delete(key)` - removes `key` and its value from the cache
* `clear()` - empties cache

##Events
* `add` - occurs when an item is added
* `update` - occurs when an item is updated
* `delete` - happens when an item is deleted
* `empty` - occurs when cache is cleared

##Questions/comments

File an [issue](https://github.com/vinniegarcia/cachish/issues)