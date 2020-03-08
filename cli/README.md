# Ferp CLI Examples

These are examples meant to run in a terminal.
All examples have `main.js`, which contains the app, `index.js` which executes it, and `main.test.js` that tests it.
Most applications should follow the structure of separate files for the app and execution code, since it makes testing a lot easier.

## Examples

### file-reader

Basic file reading ability, and how it should work with effects.
Demonstrates working with deferred messages.

### timer-with-effects

One second interval incrementor using effects.
Demonstrates the delay effect.

### timer-with-subscription

One second interval incrementor using a subscription.
Demonstrates working with subscriptions.

### xhr-request

Hit a demo todo list api using effects.
Demonstrates batching effects, and out of order messages.

## Running

```bash
yarn
yarn start ./{file-reader,timer-with-effects,timer-with-subscription,xhr-request}
```
