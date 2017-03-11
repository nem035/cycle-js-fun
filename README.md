# CycleJSFun

Messing around with [CycleJS](https://cycle.js.org/).

[Live Page](https://nem035.github.io/cycle-js-fun/)

## Notes:

Principle: Separate Logic from Drivers (effects).

Logic is functional
Drivers are imperative

Developer writes the logic, framework drives the effects.

Sources : input (read) effects
Sinks   : output (write) effects

CycleJS -> Proxies

  How to do?

  ```js
    a = f(b)
    b = g(a)

  // With proxies:

    bProxy = ...
    a = f(bProxy)
    b = g(a)
    bProxy.imitate(b)
  ```

CycleJS is essentially a loop of read/write effects

[Model/View/Intent](https://cycle.js.org/model-view-intent.html)
