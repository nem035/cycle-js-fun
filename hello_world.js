/*
1. Principle: Separate Logic from Drivers (effects).

Logic is functional
Drivers are imperative

Developer writes the logic, framework drives the effects.

2. Source : input (read) effects
   Sink   : output (write) effects

3. CycleJS -> Proxies

    How to do?

      a = f(b)
      b = g(a)

    With proxies:

      bProxy = ...
      a = f(bProxy)
      b = g(a)
      bProxy.imitate(b)

CycleJS is really a loop of read/write effects
*/
function script (appContainerSelector, {Cycle, CycleDOM, Rx}) {
  const { label, input, h1, hr, div, makeDOMDriver } = CycleDOM

  function main (sources) {
    // main receives instructions for read events as sources

    const inputEv$ = sources.DOM.select('.field').events('input')
    const name$ = inputEv$.map(e => e.target.value).startWith('')

    // main returns instructions for write effects as sinks

    // convert the read stream of input events
    // into a write stream of dom elements
    return {
      DOM: name$.map(name =>
        div([
          label('Name:'),
          input('.field', { type: 'text' }),
          hr(),
          h1(`Hello ${name}!`)
        ]))
    }
  }

  const drivers = {
    DOM: makeDOMDriver(appContainerSelector)
  }

  Cycle.run(main, drivers)
}
