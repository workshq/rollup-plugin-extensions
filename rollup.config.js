const path = require('path');
const typescript = require('rollup-typescript');
const pkg = require('./package.json');

// const isDev = process.env.NODE_ENV !== 'production';

const banner = `/**
 * ${pkg.name} v${pkg.version}
 * Author: ${pkg.author}
 *
 * ${pkg.repository.url}
 */
`;

const config = {
  input: path.join(__dirname, 'src', 'index.ts'),
  output: {
    format: 'cjs',
    file: pkg.main,
    name: pkg.name,
    banner,
  },
  external: [
    'fs',
    'path',
  ],
  plugins: [typescript()],
};

const esmConfig = {
  ...config,
  output: {
    ...config.output,
    format: 'es',
    file: pkg.module,
  },
};

module.exports = [config, esmConfig];
