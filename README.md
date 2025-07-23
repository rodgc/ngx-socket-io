# ngx-socket-io

[![Build Status](https://travis-ci.org/rodgc/ngx-socket-io.svg?branch=master)](https://travis-ci.org/rodgc/ngx-socket-io)
[![npm version](https://badge.fury.io/js/ngx-socket-io.svg)](https://badge.fury.io/js/ngx-socket-io)
[![npm downloads](https://img.shields.io/badge/Downloads-132%2Fmonth-brightgreen.svg)](https://github.com/rodgc/ngx-socket-io)

[Socket.IO](http://socket.io/) module for Angular

## Install

`npm install ngx-socket-io`

**Important:**

Make sure you're using the proper corresponding version of socket.io on the server.

| Package Version | Socket-io Server Version | Angular version | Notes    |
| --------------- | ------------------------ | --------------- | -------- |
| v3.4.0          | v2.2.0                   |                 |          |
| v4.1.0          | v4.0.0                   | 12.x            |          |
| v4.2.0          | v4.0.0                   | 13.x            |          |
| v4.3.0          | v4.5.1                   | 14.x            |          |
| v4.4.0          | v4.5.1                   | 15.x            |          |
| v4.5.0          | v4.5.1                   | 16.x            |          |
| v4.6.1          | v4.7.2                   | 17.x            |          |
| v4.7.0          | v4.7.2                   | 18.x            |          |
| v4.8.1          | v4.8.1                   | 19.x            |          |
| v4.9.0          | v4.8.1                   | 20.x            |          |
| v4.9.1          | v4.8.1                   | 20.x            | Zoneless |

## How to use

### Import and configure SocketIoModule for NgModule based applications

```ts
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

const config: SocketIoConfig = { url: 'http://localhost:8988', options: {} };

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, SocketIoModule.forRoot(config)],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

We need to configure `SocketIoModule` module using the object `config` of type `SocketIoConfig`, this object accepts two optional properties they are the same used here [io(url[, options])](https://socket.io/docs/v4/client-initialization/#Options).

Now we pass the configuration to the static method `forRoot` of `SocketIoModule`

### Import and configure SocketIoModule for standalone based applications

In app.config.ts use the following:

```ts
import { ApplicationConfig } from '@angular/core';
import { SocketIoModule, SocketIoConfig, provideSocketIo } from 'ngx-socket-io';

const config: SocketIoConfig = { url: 'http://localhost:8988', options: {} };

export const appConfig: ApplicationConfig = {
  providers: [provideSocketIo(config)],
};
```

In standalone applications, there is no `AppModule` to import `SocketIoModule`. Instead, we use `provideSocketIo(config)` directly in the providers' configuration. The usage of the socket instance remains the same as in an NgModule-based application.

### Using your socket Instance

The `SocketIoModule` provides now a configured `Socket` service that can be injected anywhere inside the `AppModule`.

```typescript
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';

@Injectable()
export class ChatService {
  constructor(private socket: Socket) {}

  sendMessage(msg: string) {
    this.socket.emit('message', msg);
  }
  getMessage() {
    return this.socket.fromEvent('message').pipe(map(data => data.msg));
  }
}
```

### Using multiple sockets with different end points

In this case we do not configure the `SocketIoModule` directly using `forRoot`. What we have to do is: extend the `Socket` service, and call `super()` with the `SocketIoConfig` object type (passing `url` & `options` if any).

```typescript
import { Injectable, NgModule } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable()
export class SocketOne extends Socket {
  constructor() {
    super({ url: 'http://url_one:portOne', options: {} });
  }
}

@Injectable()
export class SocketTwo extends Socket {
  constructor() {
    super({ url: 'http://url_two:portTwo', options: {} });
  }
}

@NgModule({
  declarations: [
    //components
  ],
  imports: [
    SocketIoModule,
    //...
  ],
  providers: [SocketOne, SocketTwo],
  bootstrap: [
    /** AppComponent **/
  ],
})
export class AppModule {}
```

Now you can inject `SocketOne`, `SocketTwo` in any other services and / or components.

## Zoneless Implementation

Starting from version `4.9.1`, `ngx-socket-io` no longer depends on zone.js. This means you need to manually trigger Angular's change detection when using this library in a zoneless environment.

Example Usage
Here’s an example of how to use `ngx-socket-io` in a zoneless Angular application:

```TS
import { Component, ApplicationRef } from '@angular/core';
import { WrappedSocket } from 'ngx-socket-io';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <h1>Socket.IO Example</h1>
      <p>Message: {{ message }}</p>
    </div>
  `,
})
export class AppComponent {
  message: string = '';

  constructor(private socket: WrappedSocket, private appRef: ApplicationRef) {
    // Listen to events
    this.socket.fromEvent<string>('message').subscribe((data) => {
      this.message = data;
      this.appRef.tick(); // Manually trigger change detection
    });

    // Emit events
    this.socket.emit('message', 'Hello from Angular!');
  }
}
```

### Configuration

To configure the `SocketIoModule`, use the `forRoot` method or the `provideSocketIo` function:

Using `forRoot`

```TS
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

const config: SocketIoConfig = {
  url: 'https://your-websocket-server',
  options: {
    transports: ['websocket'],
  },
};

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, SocketIoModule.forRoot(config)],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

Using `provideSocketIo`

```TS
import { bootstrapApplication } from '@angular/platform-browser';
import { provideSocketIo, SocketIoConfig } from 'ngx-socket-io';

const config: SocketIoConfig = {
  url: 'https://your-websocket-server',
  options: {
    transports: ['websocket'],
  },
};

bootstrapApplication(AppComponent, {
  providers: [provideSocketIo(config)],
});
```

#### Notes

- _Manual Change Detection_: Since `zone.js` is no longer required, you must manually trigger Angular's change detection using `ApplicationRef.tick()` or `NgZone.run()` when handling WebSocket events.

- _Compatibility_: Ensure your application is compatible with `Angular` 20+ and `socket.io-client` v4.x.

## Typings

Two typing approaches are supported: the Socket.IO Typing Pattern and the Event Payload Inline Typing.

### Socket.IO Types

The [Socket.IO types](https://socket.io/docs/v4/typescript/) pattern is supported by both `ngx-socket-io` extended and native wrapped funcions.

Example using the following types:

```TS
interface ListenEvents {
  withAck: (callback: (n: number) => void) => void;
  fromEventSig: (onlyOneArg: FromEventSupportsOnlyOneArg) => void;
}

interface EmitEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: CustomObject) => void;
}

interface CustomObject {
  name: string;
  age: number;
}

interface FromEventSupportsOnlyOneArg {
  a: number;
  b: string;
  c: CustomObject;
}
```

To use with the default `ngx-socket-io` instance, simply add the types to the injected field using one of the following methods:

- `constructor(private socket: Socket<ListenEvents, EmitEvents>) {}`
- `private socket: Socket<ListenEvents, EmitEvents> = inject(Socket)`
- `private socket = inject<Socket<ListenEvents, EmitEvents>>(Socket)`

To use with an extension, simply specify in the class definition:

```TS
...
export class SocketOne extends Socket<ListenEvents, EmitEvents> {
...
```

When using, all types will be inferred automatically.
```TS
import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="noArg()">No Arg</button>
    <button (click)="basicEmit()">Basic Emit</button>
  `,
})
export class App {

  fromEventArg?: FromEventSupportsOnlyOneArg;

  constructor(
    private socket: Socket<ListenEvents, EmitEvents>
  ) {

    // Infer arg to the FromEventSupportsOnlyOneArg type.
    this.socket.fromEvent('fromEventSig')
      .pipe(takeUntilDestroyed())
      .subscribe(arg => this.fromEventArg = arg);

    // Infers the callback for a function that takes an argument of type number.
    this.socket.fromEvent('withAck')
      .pipe(takeUntilDestroyed())
      .subscribe(callback => callback(Math.random()));
  }

  noArg() {
    // Type error if any more arguments are added.
    this.socket.emit('noArg');
  }

  basicEmit() {
    // Type error if any of the arguments does not match the sequence (number, string, CustomObject) defined in the EmitEvents interface.
    this.socket.emit('basicEmit', 4.9, 'lib', { name: 'ngx', age: 8 });
  }
}
```

### Event Payload Inline Types

Inline typing does not restrict or validate the event names supported by the socket, but it is useful for inferring the types of the parameters used by each event.

For this usage, a type variable must be specified in each socket method call. Example using the types defined previously:

```TS
export class App {

  fromEventArg?: FromEventSupportsOnlyOneArg;

  constructor(
    private socket: Socket
  ) {

    // this.socket.fromEvent return a Observable<FromEventSupportsOnlyOneArg>
    this.socket.fromEvent<FromEventSupportsOnlyOneArg>('fromEventSig')
      .pipe(takeUntilDestroyed())
      .subscribe(arg => this.fromEventArg = arg);

    this.socket.fromEvent<(n: number) => void>('withAck')
      .pipe(takeUntilDestroyed())
      .subscribe(callback => callback(Math.random()));
  }

  noArg() {
    this.socket.emit<[]>('noArg');
  }

  basicEmit() {
    // When emitting events, the parameter types must be informed within an array.
    this.socket.emit<
      [number, string, CustomObject]
      >('basicEmit', 4.9, 'lib', { name: 'ngx', age: 8 });
  }
}
```

## API

Most of the functionalities here you are already familiar with.

The only addition is the `fromEvent` method, which returns an `Observable` that you can subscribe to.

### `socket.of(namespace: string)`

Takes a namespace and returns an instance based on the current config and the given namespace,
that is added to the end of the current url.
See [Namespaces - Client Initialization](https://socket.io/docs/v4/namespaces/#client-initialization).
Instances are reused based on the namespace.

### `socket.on(eventName: string, callback: Function)`

Takes an event name and callback.
Works the same as in Socket.IO.

### `socket.removeListener(eventName: string, callback?: Function)`

Takes an event name and callback.
Works the same as in Socket.IO.

### `socket.removeAllListeners(eventName?: string)`

Takes an event name.
Works the same as in Socket.IO.

### `socket.emit(eventName:string, ...args: any[])`

Sends a message to the server.
Works the same as in Socket.IO.

### `socket.fromEvent<T>(eventName: string): Observable<T>`

Takes an event name and returns an Observable that you can subscribe to.

### `socket.fromOneTimeEvent<T>(eventName: string): Promise<T>`

Creates a Promise for a one-time event.

You should keep a reference to the Observable subscription and unsubscribe when you're done with it.
This prevents memory leaks as the event listener attached will be removed (using `socket.removeListener`) ONLY and when/if you unsubscribe.

If you have multiple subscriptions to an Observable only the last unsubscription will remove the listener.

## Know Issue

For `error TS2345` you need to add this to your `tsconfig.json`.

```json
{
  ...
  "compilerOptions": {
    ...
    "paths": {
      "rxjs": ["node_modules/rxjs"]
    }
  },
}
```

## Related projects

- [bougarfaoui/ng-socket-io](https://github.com/bougarfaoui/ng-socket-io) - Socket.IO module for Angular

## LICENSE

MIT
