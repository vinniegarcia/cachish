import { EventEmitter } from 'events'

const defaultTimeout = 600000

const later = (f) => setTimeout(f, 0)

const coolName = (name) => typeof name === 'string'

class Cachish extends EventEmitter {
  constructor (timeout = defaultTimeout) {
    super()
    this.data = {}
    this.emit('init', {})
    this.timeout = timeout
  }

  check (id) {
    const exists = id in this.data
    const isStale = exists && this.stale(id)
    if (isStale) {
      this.emit('stale', {
        id
      })
    }
    return exists && !isStale
  }

  fresh (id) {
    return id in this.data && this.data[id].expires > Date.now()
  }

  stale (id) {
    return !this.fresh(id)
  }

  set (id, value) {
    let eventType = 'add'
    let previousValue
    if (id in this.data) {
      previousValue = this.data[id]
      eventType = 'change'
    }
    let payload = {
      id,
      previousValue,
      value
    }
    return new Promise((resolve, reject) => {
      later(() => {
        this.data[id] = {
          value,
          expires: Date.now() + this.timeout
        }
        this.emit(eventType, payload)
        resolve()
      })
    })
  }

  add (id, value) {
    return this.set(id, value)
  }

  update (id, value) {
    return this.set(id, value)
  }

  get (id) {
    return new Promise((resolve, reject) => {
      if (coolName(id) && this.check(id)) {
        this.emit('found', {
          id,
          value: this.data[id]
        })
        return resolve(this.data[id])
      } else {
        this.emit('missing', {
          id
        })
        return reject(new Error(`Cache key ${id} not found`))
      }
    })
  }

  delete (id) {
    return new Promise((resolve, reject) => {
      later(() => {
        if (coolName(id)) {
          delete this.data[id]
          this.emit('delete', {
            id
          })
        }
        resolve()
      })
    })
  }

  size () {
    return Object.keys(this.data).length
  }

  clear () {
    return new Promise((resolve, reject) => {
      later(() => {
        this.data = {}
        this.emit('empty', {})
        resolve()
      })
    })
  }

}

export default Cachish
