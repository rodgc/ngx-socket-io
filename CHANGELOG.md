# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [4.9.0] - 2025-07-01

### Bump

- Bump `@angular/*` dependencies to v20.0.0.

### Fixed

- Typo in `provideSocketIo` that results in an instance of SocketFactory being provided instead of a WrappedSocket instance.

## [4.8.5] - 2025-04-07

### Update

- Providers to use `providerSocketIo` function that is using `makeEnvironmentProviders` instance of `importProvidersFrom`

## [4.8.4] - 2025-02-09

### Changed

- Updated the `options` property in the `SocketIoConfig` interface to use `Partial<ManagerOptions>` instead of a `custom-defined` object.

## [4.8.3] - 2025-02-06

### Fixed

- `off()` behavior, sync with socket-io-client and takes a single function, not array
- Mark internal fields as private in `WrappedSocket`.

### Removed

- Outdated `@types/socket-io` & `@types/socket.io-client` dependencies and use the built-in types instead.

## [4.8.2] - 2024-12-27

### Added

- Return types to help users.
- emitWithAck().
- offAny().
- offAnyOutgoing().
- send().
- compress().
- export SOCKET_CONFIG_TOKEN.

### Fixed

- socket.of() method.
- Chaining methods.
- Volatile usage.
- connect() and disconnect() arguments.

## [4.8.1] - 2024-11-25

### Update

- Bump `@angular/core` dependencies to v19.0.0.

## [4.8.0] - 2024-11-21

### Update

- Bump `@angular` dependencies to v19.0.0.

## [4.7.0] - 2024-05-24

### Update

- Bump `@angular` dependencies to v18.0.0.
- Bump `ng-packagr` dependencies to v18.0.0.
- Bump `typescript` dependencies to v5.4.0.

## [4.6.1] - 2023-11-09

### Fixed

- Compatibility with future MINOR versions of Angular.

## [4.6.0] - 2023-11-08

### Added

- Optional callback to `ioSocket.connect` method.

### Update

- Bump `@angular` dependencies to v17.0.0.
- Bump `ng-packagr` dependencies to v17.0.0.
- Bump `postcss` dependencies to 8.4.31.
- Bump `zone.js` dependencies to 0.14.0.
- Bump `socket.io` dependencies to 4.7.2.
- Bump `socket.io-client` dependencies to 4.7.2.
- Bump `@types/socket.io` dependencies to 2.1.13.
- Bump `@types/socket.io-client` dependencies to 1.4.36.

## [4.5.1] - 2023-05-11

### Added

- `listeners` Method.
- `listenersAny` Method.
- `listenersAnyOutgoing` Method.
- `off` Method.
- `onAny` Method.
- `onAnyOutgoing` Method.
- `prependAny` Method.
- `prependAnyOutgoing` Method.
- `timeout` Method.
- `volatile` Method.

## [4.5.0] - 2023-05-11

### Added

- `forceNew` option

### Update

- Bump `@angular` dependencies to v16.0.0.
- Bump `ng-packagr` dependencies to v16.0.0.

## [4.4.0] - 2022-11-17

### Update

- Bump `@angular` dependencies to v15.0.0.
- Bump `ng-packagr` dependencies to v15.0.0.
- Bump `typescript` dependencies to v4.8.0.

## [4.3.1] - 2022-09-12

### Added

- `auth` option to config
- `closeOnBeforeunload` option to config

### Fixed

- Name function `fromEventOnce` to `fromOneTimeEvent`

## [4.3.0] - 2022-06-28

### Update

- Bump `@angular` dependencies to v14.0.0.
- Bump `socket.io` dependencies to v4.5.1.
- Bump `socket.io-client` dependencies to v4.5.1.

## [4.2.0] - 2021-10-22

### Update

- Bump `@angular` dependencies to v13.0.0.

### Fixed

- Property `withCredentials` is missing in type.

## [4.1.0] - 2021-6-29

### Added

- Husky

### Update

- Bump `@angular` dependencies to v12.0.0.

## [4.0.0] - 2021-3-29

### Update

- Bump `socket.io` dependencies to v4.0.0.
- Bump `socket.io-client` dependencies to v4.0.0.

## [3.3.1] - 2021-3-29

### Change

- Downgrade `socket.io` dependencies to v2.2.0.
- Downgrade `socket.io-client` dependencies to v2.2.0.

## [3.3.0] - 2021-3-12

### Updated

- Bump `Angular` dependencies to version 11.
- Bump `socket.io` dependencies to v4.0.0.
- Bump `socket.io-client` dependencies to v4.0.0.

## [3.2.0] - 2020-06-26

### Updated

- `Angular` dependencies to version 10.

### Changed

`emit()` to accept any numbers of args.

## [3.1.0] - 2020-06-26

### Updated

- `Angular` dependencies to version 9.

### Fixed

- tslint warnings.

## [3.0.0] - 2019-08-10

### Updated

- `Angular` dependencies to version 8.

### Changed

- Pack library to `ng-packagr` from `ngc-rollup`.

### Fixed

- Errors at packing the library.

### Removed

- `rxjs` from dependencies.
- `@Inject(SOCKET_CONFIG_TOKEN)` form service constructor, casuing erros with `Angular 8`.

## [2.1.1] - 2018-11-28

### Added

- Function to create custom namespaces.

### Changed

- Angular peer dependencie to `^6.0.0 || ^7.0.0` to resolve npm warnings.

### Removed

- Steps to run proyect in Anuglar 6 with version 1.0.8.

## [2.0.0] - 2018-10-26

### Removed

- Angular core from dependencies to work on Angular 7.
