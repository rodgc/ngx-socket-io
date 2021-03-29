# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

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

- Pack library to `ng-packagr` from `ngc-rollup`. ([@GregOnNet](https://github.com/GregOnNet)

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
