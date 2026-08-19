# SPACE GAME 5
# REVENGE OF UNICORN

A game about space, love, unicorns, death and of course space.

## HACKING

To run this, install a server (I recommend `npm install -g live-server`) and run it. It runs as-is on localhost as long as you open index.html.

## BUILD

The build does not require `npm install -g terser` but it's recommended. To make the output file small. It concatenates all files that we can find included in index.html, then compiles

## DEVIOUS TRICKS USED

To save bytes, objects are avoided. Instead, arrays are privileged. Keys are placed in variables.

_Example: vectors and matrices are arrays with 3 items. There are variables called x, y, and z._

Terser is used with `--define self.production=1`. This makes it so that `self.production` (which previously was undefined because the browser `window` object does not contain a property `production`) is true when built.

_Example: assert() is guarded by an if (!self.production), and so its code is removed in the final package_

Runtime checks: because JavaScript is so loose, you may use the wrong types sometimes. Without a type system to notice that, you won't easily find your mistake. So I added runtime type checks in math.js.

_Example: vec() is a function that accepts an array, and makes sure it's a vector with 3 elements, none of them NaN or Infinity_

Statements are avoided! Terser knows how to turn `() => { if (a) {return b()} else {return c()} }` into `() => a ? b() : c()`. But it's not very consistent. So inspection of the minified file is used to make sure it's caught up. Sometimes, we actually use the obscure JS comma syntax instead of statements, like so: `() => (expression1(), expression2())`.

