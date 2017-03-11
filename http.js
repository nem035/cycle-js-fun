function script (appContainerSelector, {Cycle, CycleDOM, Rx, CycleHTTPDriver}) {
  const { button, h1, h4, a, div, makeDOMDriver } = CycleDOM

  const { makeHTTPDriver } = CycleHTTPDriver

  function main (sources) {
    // Sequence of events:
    // 1. DOM read effect: button clicked
    // 2. HTTP write effect:request sent
    // 3. HTTP read effect: response received
    // 4. DOM write effect: data displayed

    const click$ = sources.DOM.select('.get-first').events('click')
    const request$ = click$.map(() => {
      return {
        url: 'http://jsonplaceholder.typicode.com/users/1',
        method: 'GET'
      }
    })

    const response$$ = sources.HTTP.filter(
      response$ =>
        response$.request.url === 'http://jsonplaceholder.typicode.com/users/1'
    )

    const response$ = response$$.switchLatest()
    const firstUser$ = response$.map(response => response.body).startWith(null)

    return {
      DOM: firstUser$.map(firstUser =>
        div([
          button('.get-first', 'Get first user'),
          firstUser === null
            ? null
            : div('.user-details', [
              h1('.user-name', firstUser.name),
              h4('.user-email', firstUser.email),
              a('.user-website', { href: firstUser.website }, firstUser.website)
            ])
        ])),
      HTTP: request$
    }
  }

  const drivers = {
    DOM: makeDOMDriver(appContainerSelector),
    HTTP: makeHTTPDriver()
  }

  Cycle.run(main, drivers)
}
