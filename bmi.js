function script (appContainerSelector, {Cycle, CycleDOM, Rx}) {
  const { label, input, h2, div, makeDOMDriver } = CycleDOM

  const defaults = {
    WEIGHT_DEFAULT: 70,
    WEIGHT_MIN: 40,
    WEIGHT_MAX: 120,

    HEIGHT_MIN: 140,
    HEIGHT_MAX: 220,
    HEIGHT_DEFAULT: 170
  }

  function intent (sources) {
    const changeWeight$ = sources
      .DOM
      .select('.weight')
      .events('input')
      .map(e => e.target.value)

    const changeHeight$ = sources
      .DOM
      .select('.height')
      .events('input')
      .map(e => e.target.value)

    return {
      changeWeight$,
      changeHeight$
    }
  }

  function model ({ changeWeight$, changeHeight$ }) {
    const state$ = Rx.Observable.combineLatest(
      changeWeight$.startWith(defaults.WEIGHT_DEFAULT),
      changeHeight$.startWith(defaults.HEIGHT_DEFAULT),
      (weight, height) => {
        const heightMeters = height * 0.01
        const bmi = Math.round(weight / (heightMeters ** 2))
        return {bmi, weight, height}
      }
    )

    return state$
  }

  function view (state$) {
    return state$.map(state =>
      div([
        div([
          label(`Weight: ${state.weight}kg`),
          input('.weight', {
            type: 'range',
            min: defaults.WEIGHT_MIN,
            max: defaults.WEIGHT_MAX,
            value: state.weight
          })
        ]),
        div([
          label(`Height: ${state.height}cm`),
          input('.height', {
            type: 'range',
            min: defaults.HEIGHT_MIN,
            max: defaults.HEIGHT_MAX,
            value: state.height
          })
        ]),
        h2({style: { color: 'orange' }}, `BMI is ${state.bmi}`)
      ])
    )
  }

  function main (sources) {
    // Sequence of events:
    // 1. DOM ead effect: detect slider change
    // 2. recalculate BMI
    // 4. DOM write effect: display BMI

    const changeStreams = intent(sources)
    const state$ = model(changeStreams)
    const vtree$ = view(state$)

    return {
      DOM: vtree$
    }
  }

  const drivers = {
    DOM: makeDOMDriver(appContainerSelector)
  }

  Cycle.run(main, drivers)
}
