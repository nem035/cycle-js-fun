function script (appContainerSelector, {Cycle, CycleDOM, Rx}) {
  const { button, p, label, div, makeDOMDriver } = CycleDOM

  function main (sources) {
    const decrementClicks$ = sources.DOM.select('#dec').events('click')
    const incrementClicks$ = sources.DOM.select('#inc').events('click')

    // the meaning of decrement and increment
    const decrementAction$ = decrementClicks$.map(ev => -1)
    const incrementAction$ = incrementClicks$.map(ev => +1)

    // a stream of our result
    const number$ = Rx.Observable
      .of(0)
      .merge(decrementAction$)
      .merge(incrementAction$)
      .scan((prev, curr) => prev + curr) // scan remembers previous values

    return {
      DOM: number$.map(number =>
        div([
          button('#dec', 'Decrement'),
          button('#inc', 'Increment'),
          p([label(String(number))])
        ]))
    }
  }

  const drivers = {
    DOM: makeDOMDriver(appContainerSelector)
  }

  Cycle.run(main, drivers)
}
