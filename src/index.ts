import fs from 'fs';
import { posix } from 'path';
import { Plugin } from 'rollup';

const { basename, dirname, isAbsolute, resolve } = posix;

type Extensions = Array<string>;

function fileExists(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

function isDirectory(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (err) {
    return false;
  }
}

const resolvedFilesCache = new Map<string, string>();

function resolveFilePath(file: string, extensions: Extensions, resolveIndex: boolean) {
  try {
    // Check if file is already resolved
    if (resolvedFilesCache.has(file)) return resolvedFilesCache.get(file) as string;

    // Name without extension
    const name = basename(file);
    const dir = dirname(file);
    const files = fs.readdirSync(dir);

    // We have an exact path.
    if (files.includes(name) && fileExists(file)) {
      resolvedFilesCache.set(file, file);
      return file;
    }

    for (const ext of extensions) {
      const fileName = `${name}${ext}`;
      const filePath = `${file}${ext}`;
      // Return on first find
      if (files.includes(fileName) && fileExists(filePath)) {
        resolvedFilesCache.set(file, filePath);
        return filePath;
      }
    }

    // Resolve index file if path is a directory.
    // This should come *after* checking to see if we have any files that match,
    // in-case there is a dir and a file with the same name.
    if (resolveIndex === true && isDirectory(file)) {
      // Get all available files from dir
      const files = fs.readdirSync(file);

      for (const ext of extensions) {
        // Check for any index files matching extensions
        const fileName = `index${ext}`;
        const filePath = resolve(file, fileName);

        // Return first index file found in dir
        if (files.includes(fileName) && fileExists(filePath)) {
          resolvedFilesCache.set(file, filePath);
          return filePath;
        }
      }
    }
  } catch (err) {
    // noop
  }

  return null;
}


type ExtensionsArgs = {
  /** Which extensions to look for */
  extensions?: Extensions;
  /** If folder "index" files should be resolved. Will use extensions. */
  resolveIndex?: boolean;
}

const DEFAULT_EXTENSIONS = ['.mjs', '.js'];

export default function extensions({
  extensions = DEFAULT_EXTENSIONS,
  resolveIndex = true,
}: ExtensionsArgs = {}): Plugin {
  if (extensions == null || extensions.length <= 0) {
    throw new Error(`[rollup-plugin-extensions] Extensions must be a non-empty array of strings.
      e.g "{ extensions: ['.ts, '.jsx', '.jsx'] }"
    `)
  }

  return {
    name: 'extensions',
    resolveId(id, parent) {
      // Resolve absolute paths
      if (isAbsolute(id)) return resolveFilePath(resolve(id), extensions, resolveIndex);

      // Parent will be undefined if this is an entry point.
      // Resolve against current working directory.
      if (parent === undefined) return resolveFilePath(resolve(process.cwd(), id), extensions, resolveIndex);

      // Skip external modules at this stage
      if (id[0] !== '.') return null;

      // Resolve all local imports
      return resolveFilePath(
        // local file path
        resolve(dirname(parent), id),
        extensions,
        resolveIndex
      );
    }
  };
}
