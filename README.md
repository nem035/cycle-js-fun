# CycleJSFun

Messing around with [CycleJS](https://cycle.js.org/).

Notes:

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
