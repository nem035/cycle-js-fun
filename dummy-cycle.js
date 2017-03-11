// definition examples

function run (mainFn, drivers) {
  const proxySources = Object.keys(drivers).reduce(
    (sources, key) => {
      return Object.assign(sources, {
        [key]: new Rx.Subject()
      })
    },
    {}
  )

  const sinks = mainFn(proxySources)
  for (const key of Object.keys(drivers)) {
    const driver = drivers[key]
    const sink = sinks[key]
    const source = driver(sink)
    if (source) {
      const proxySource = proxySources[key]
      source.subscribe(click => {
        proxySource.onNext(click)
      })
    }
  }
}

function h (tagName, children) {
  return {
    tagName,
    children
  }
}

function h1 (children) {
  return h('h1', children)
}

function span (children) {
  return h('span', children)
}

function makeDOMDriver (mountSelector) {
  return function DOMDriver (obj$) {
    function createElement (obj) {
      const element = document.createElement(obj.tagName)
      obj.children.forEach(child => {
        element.appendChild(
          typeof child === 'string'
            ? document.createTextNode(child)
            : createElement(child)
        )
      })
      return element
    }

    obj$.subscribe(obj => {
      const element = createElement(obj)
      const container = document.querySelector(mountSelector)
      container.innerHTML = ''
      container.appendChild(element)
    })
    const DOMSource = {
      selectEvents (tagName, eventType) {
        return Rx.Observable
          .fromEvent(document, eventType)
          .filter(e => e.target.tagName === tagName.toUpperCase())
      }
    }
    return DOMSource
  }
}

// usage examples

function main (sources) {
  const mouseover$ = sources.DOM.select('span').events('mouseover')

  const sinks = {
    DOM: mouseover$.startWith(null).flatMapLatest(() => {
      return Rx.Observable.timer(0, 1000).map(i => {
        return h1({ style: { color: 'teal' } }, [
          span([`Seconds elapsed ${i}`])
        ])
      })
    }),
    Log: Rx.Observable.timer(0, 2000).map(i => i * 2)
  }

  return sinks
}
