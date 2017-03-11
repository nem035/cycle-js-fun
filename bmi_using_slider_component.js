function script (appContainerSelector, {Cycle, CycleDOM, Rx, CycleIsolate}) {
  const { label, input, h2, div, makeDOMDriver } = CycleDOM

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
    const state$ = model(change$, sources.props)
    const vtree$ = view(state$)

    return {
      DOM: vtree$,
      value: state$.map(state => state.value)
    }
  }

  function IsolatedLabeledSlider (sources) {
    return CycleIsolate(LabeledSlider)(sources)
  }

  function main (sources) {
    // weight slider component
    const weightProps$ = Rx.Observable.of({
      label: 'Weight',
      unit: 'kg',
      min: 40,
      max: 120,
      init: 70
    })
    const weightSinks = IsolatedLabeledSlider({
      DOM: sources.DOM,
      props: weightProps$
    })
    const weightVTree$ = weightSinks.DOM
    const weightValue$ = weightSinks.value

    // height slider component
    const heightProps$ = Rx.Observable.of({
      label: 'Height',
      unit: 'cm',
      min: 140,
      max: 220,
      init: 170
    })
    const heightSinks = IsolatedLabeledSlider({
      DOM: sources.DOM,
      props: heightProps$
    })
    const heightVTree$ = heightSinks.DOM
    const heightValue$ = heightSinks.value

    const bmi$ = Rx.Observable.combineLatest(weightValue$, heightValue$, (weight, height) => {
      const heightMeters = height * 0.01
      return Math.round(weight / (heightMeters ** 2))
    })

    const vtree$ = Rx.Observable.combineLatest(
      bmi$,
      weightVTree$,
      heightVTree$,
      (bmi, weightVTree, heightVTree) =>
        div([
          weightVTree,
          heightVTree,
          h2(`BMI is ${bmi}`)
        ])
    )

    return {
      DOM: vtree$
    }
  }

  const drivers = {
    DOM: makeDOMDriver(appContainerSelector)
  }

  Cycle.run(main, drivers)
}
