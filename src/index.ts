import fs from 'fs';
import { posix } from 'path';
import { Plugin } from 'rollup';

const { basename, dirname, isAbsolute, resolve } = posix;

type Extensions = Array<string>;

function exists(file: string): boolean {
  try {
    return fs.statSync(file).isFile();
  } catch (err) {
    return false;
  }
}

const resolvedFilesCache = new Map<string, string>();

function addExtensionIfNecessary(file: string, extensions: Extensions) {
  try {
    // Check if file is already resolved
    if (resolvedFilesCache.has(file)) return resolvedFilesCache.get(file) as string;
    // Name without extension
    const name = basename(file);
    const dir = dirname(file);
    const files = fs.readdirSync(dir);

    // We have an exact path.
    if (files.includes(name) && exists(file)) {
      resolvedFilesCache.set(file, file);
      return file;
    }

    for (const ext of extensions) {
      const fileName = `${name}${ext}`;
      const filePath = `${file}${ext}`;
      // Return on first find
      if (files.includes(fileName) && exists(filePath)) {
        resolvedFilesCache.set(file, filePath);
        return filePath;
      }
    }
  } catch (err) {
    // noop
  }

  return null;
}


type ExtensionsArgs = {
  extensions: Extensions;
}

export default function extensions({ extensions }: ExtensionsArgs): Plugin {
  if (extensions == null || extensions.length <= 0) {
    throw new Error(`[rollup-plugin-extensions] Extensions must be a non-empty array of strings.
      e.g "{ extensions: ['.ts, '.jsx', '.jsx'] }"
    `)
  }

  return {
    name: 'extensions',
    resolveId(id, parent) {
      // Resolve absolute paths
      if (isAbsolute(id)) return addExtensionIfNecessary(resolve(id), extensions);

      // Parent will be undefined if this is an entry point.
      // Resolve against current working directory.
      if (parent === undefined) return addExtensionIfNecessary(resolve(process.cwd(), id), extensions);

      // Skip external modules at this stage
      if (id[0] !== '.') return null;

      // Resolve all local imports
      return addExtensionIfNecessary(
        // local file path
        resolve(dirname(parent), id),
        extensions
      );
    }
  };
}
