# nombrerutyfirma-dumper

## 1.4.0

### Minor Changes

- 11fdf4d: Added commander mongodb action
- 641f79c: Added logging for MacOS and Linux
- 845dec7: Added `--option=mongodb` and `--uri=[connection-string]` options
- 593df69: Added `rutificador-net` information source

### Patch Changes

- 27fd607: Fixed a bug on local-file:single-rut `nombrerutyfirma` source that used `elrutificador` source instead of the proper one
- 536f05d: Fixed a bug that caused the local-file writestream to close on a loop cycle

## 1.3.0

### Minor Changes

- b44eb10: Added `nombrerutyfirma.com` search by rut method
- 6877f81: Added `nombrerutyfirma` cli source

### Patch Changes

- 4e42eb2: Added `node-fetch-commonjs` dependency as it includes `FetchError`
- 66a23e3: Added scoped NRYFError error codes to have more control over errors
- 761ffa0: Renamed `elrutifcador` source internal directory to `el-rutificador`

## 1.2.1

### Patch Changes

- 59d6e0f: Bumped `@types/node` dev dependency version to `20.5.9`

## 1.2.0

### Minor Changes

- Integrated elrutificador table generation v2
- Added retry on banned_ip response from cloudflare
- Integrated new elrutificador jwt generation v2
- Added an error class that will allow to standarize errors across nryf-dumper

### Patch Changes

- Bumped `typescript` dev dependency version to `5.2.2`
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
