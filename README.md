# rollup-plugin-extensions

Allow rollup to resolve local files with any extension.


## Installation
```sh
yarn add -D rollup-plugin-extensions
```

## Usage

```js
// rollup.config.js
import extensions from 'rollup-plugin-extensions';

export default {
  input: 'main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs',
  },
  plugins: [
    extensions({
      // Supporting Typescript files
      // Uses ".mjs, .js" by default
      extensions: ['.tsx', '.ts', '.jsx', '.js']
    })
  ]
};
```

## Why
Plugins like [rollup-plugin-node-resolve](https://github.com/rollup/rollup-plugin-node-resolve) can cause issues, if you're building a package, by trying to resolve files in `node_modules`.  
This package strives to have a minimal use case and is primarily focused on adding extension support.  

If you need additional features like aliasing, commonjs support, or fully supported nodejs style resolutions try these packages:

* [rollup-plugin-alias](https://github.com/rollup/rollup-plugin-alias)
* [rollup-plugin-node-resolve](https://github.com/rollup/rollup-plugin-node-resolve)
* [rollup-plugin-commonjs](https://github.com/rollup/rollup-plugin-commonjs)


## Todo

- [ ] - Add support for index file resolution


["Inspired" by Oskar](https://github.com/rollup/rollup/issues/1052#issuecomment-260068521)
