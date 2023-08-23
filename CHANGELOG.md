# nombrerutyfirma-dumper

## 1.1.0

### Minor Changes

- Added `--max-retries <number>` option that will retry on failure for some specific scenarios
- Added elrutificadorByRut retry handler

### Patch Changes

- Added `package.json` keywords.
- Bumped @types/node version
- Added `version:changeset` and `version:bump` npm scripts

## 1.0.0

### Major Changes

- Added `--source` flag with support for `elrutificador.com` information source.
- Added `--output` flag with support for `console` and `local-file`.
- Added `--rut` flag to query a single rut.
- Added `--ruts` flag to query multiple ruts.
- Added `--from-rut` and `--to-rut` flags to query a range of ruts.
- Added `--verbose` flag to output more information through the console.
- Added `--batch-size` flag to allow simultaneous requests.
- Published package to npm.
