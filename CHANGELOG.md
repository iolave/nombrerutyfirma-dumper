# nombrerutyfirma-dumper

## 1.2.0

### Minor Changes

- Integrated elrutificador table generation v2
- Added retry on banned_ip response from cloudflare
- Integrated new elrutificador jwt generation v2
- Added an error class that will allow to standarize errors across nryf-dumper

### Patch Changes

- Bumped `typescript` dev dependency version to 5.2.2
- Bumped `@types/node` dev dependency version to `20.5.7`

## 1.1.0

### Minor Changes

- Added `--max-retries <number>` option that will retry on failure for some specific scenarios
- Added `elrutificadorByRut()` retry handler

### Patch Changes

- Added `package.json` keywords.
- Added `version:changeset` and `version:bump` npm scripts

## 1.0.3

### Patch Changes

- Bumped `typescript` dev dependency version to 5.1.6

## 1.0.2

### Patch Changes

- Bumped `@types/node` dev dependency version to 20.5.3

## 1.0.1

### Patch Changes

- Bumped typescript patch version.
- Replaced `eg:` to `i.e.:` within options descriptions.
- Modified the `--verbose` option description.

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
