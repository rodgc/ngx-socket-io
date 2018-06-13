export default {
  entry: 'dist/index.js',
  dest: 'dist/bundles/socketio.umd.js',
  sourceMap: false,
  format: 'umd',
  moduleName: 'ng.socketio',
  globals: {
    '@angular/core': 'ng.core',
    'rxjs/Observable': 'Rx',
    'rxjs/ReplaySubject': 'Rx',
    'rxjs/operators': 'Rx',
    'rxjs/add/operator/map': 'Rx.Observable.prototype',
    'rxjs/add/operator/mergeMap': 'Rx.Observable.prototype',
    'rxjs/add/observable/fromEvent': 'Rx.Observable',
    'rxjs/add/observable/of': 'Rx.Observable',
    'socket.io-client': 'io'
  },
  external:[
    '@angular/core',
    'rxjs/Observable',
    'rxjs/operators',
    'socket.io-client'
  ]
}