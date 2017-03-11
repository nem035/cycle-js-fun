function script (appContainerSelector, {Cycle, CycleDOM, Rx}) {
  const { label, input, div, makeDOMDriver } = CycleDOM

  const defaults = {
    label: 'Slider',
    unit: '%',
    min: 0,
    max: 100,
    init: 50
  }

  function intent (DOMSource) {
    return DOMSource
      .select('.slider')
      .events('input')
      .map(e => e.target.value)
  }

  function model (newValues$, prop$) {
    const propValues$ = prop$.map((props = {}) =>
      Object
        .keys(defaults)
        .reduce((propValues, propName) =>
          Object.assign(propValues, {
            [propName]: props[propName] === undefined
              ? defaults[propName]
              : props[propName]
          })
        , {})
    ).first()
    const initialValue$ = propValues$.map(props => props.init)
    const value$ = initialValue$.concat(newValues$)

    return Rx.Observable.combineLatest(value$, propValues$, (value, props) => {
      // state object
      return {
        label: props.label,
        unit: props.unit,
        min: props.min,
        max: props.max,
        value
      }
    })
  }

  function view (state$) {
    return state$.map(state =>
        div('.labeled-slider', [
          label(`${state.label}: ${state.value}${state.unit}`),
          input('.slider', {
            type: 'range',
            min: state.min,
            max: state.max,
            value: state.value
          })
        ])
      )
  }

  function LabeledSlider (sources) {
    // Sequence of events:
    // 1. DOM ead effect: detect slider change
    // 2. recalculate BMI
    // 4. DOM write effect: display BMI

    const change$ = intent(sources.DOM)
    const value$ = model(change$, sources.props)
    const vtree$ = view(value$)

    return {
      DOM: vtree$
    }
  }

  function main (sources) {
    const prop$ = Rx.Observable.of({
      label: 'Height',
      unit: 'cm',
      min: 140,
      max: 220,
      init: 170
    })
    return LabeledSlider({
      DOM: sources.DOM,
      props: prop$
    })
  }

  const drivers = {
    DOM: makeDOMDriver(appContainerSelector)
  }

  Cycle.run(main, drivers)
}
