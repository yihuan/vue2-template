export function localSave(key, value) {
  localStorage.setItem(key, value)
}

export function localRead(key) {
  return localStorage.getItem(key)
}

export function localRemove(key) {
  localStorage.removeItem(key)
}

export function debounce(fn, delay) {
  delay = delay || 200
  var timer
  return function () {
    var _this = this
    var args = arguments
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(function () {
      timer = null
      fn.apply(_this, args)
    }, delay)
  }
}

export function throttle(fn, interval) {
  var last
  var timer
  interval = interval || 200
  return function () {
    var _this = this
    var args = arguments
    var now = +new Date()
    if (last && now - last < interval) {
      clearTimeout(timer)
      timer = setTimeout(function () {
        last = now
        fn.apply(_this, args)
      }, interval)
    } else {
      last = now
      fn.apply(_this, args)
    }
  }
}
