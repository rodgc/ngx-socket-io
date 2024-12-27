import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

import * as io from 'socket.io-client';

import { SocketIoConfig } from './config/socket-io.config';

export class WrappedSocket {
  subscribersCounter: Record<string, number> = {};
  eventObservables$: Record<string, Observable<any>> = {};
  namespaces: Record<string, WrappedSocket> = {};
  ioSocket: any;
  emptyConfig: SocketIoConfig = {
    url: '',
    options: {},
  };

  constructor(private config: SocketIoConfig) {
    if (config === undefined) {
      config = this.emptyConfig;
    }
    const url: string = config.url;
    const options: any = config.options;
    const ioFunc = (io as any).default ? (io as any).default : io;
    this.ioSocket = ioFunc(url, options);
  }

  /**
   * Gets a WrappedSocket for the given namespace.
   *
   * @note if an existing socket exists for the given namespace, it will be reused.
   *
   * @param namespace the namespace to create a new socket based on the current config.
   *        If empty or `/`, then the current instance is returned.
   * @returns a socket that is bound to the given namespace. If namespace is empty or `/`,
   *          then `this` is returned, otherwise another instance is returned, creating
   *          it if it's the first use of such namespace.
   */
  of(namespace: string): WrappedSocket {
    if (!namespace || namespace === '/') {
      return this;
    }
    const existing = this.namespaces[namespace];
    if (existing) {
      return existing;
    }
    const { url, ...rest } = this.config;
    const config = {
      url:
        !url.endsWith('/') && !namespace.startsWith('/')
          ? `${url}/${namespace}`
          : `${url}${namespace}`,
      ...rest,
    };
    const created = new WrappedSocket(config);
    this.namespaces[namespace] = created;
    return created;
  }

  on(eventName: string, callback: Function): this {
    this.ioSocket.on(eventName, callback);
    return this;
  }

  once(eventName: string, callback: Function): this {
    this.ioSocket.once(eventName, callback);
    return this;
  }

  connect(callback?: (err: any) => void): this {
    this.ioSocket.connect(callback);
    return this;
  }

  disconnect(_close?: any): this {
    this.ioSocket.disconnect.apply(this.ioSocket, arguments);
    return this;
  }

  emit(_eventName: string, ..._args: any[]): this {
    this.ioSocket.emit.apply(this.ioSocket, arguments);
    return this;
  }

  send(..._args: any[]): this {
    this.ioSocket.send.apply(this.ioSocket, arguments);
    return this;
  }

  emitWithAck<T>(_eventName: string, ..._args: any[]): Promise<T> {
    return this.ioSocket.emitWithAck.apply(this.ioSocket, arguments);
  }

  removeListener(_eventName: string, _callback?: Function): this {
    this.ioSocket.removeListener.apply(this.ioSocket, arguments);
    return this;
  }

  removeAllListeners(_eventName?: string): this {
    this.ioSocket.removeAllListeners.apply(this.ioSocket, arguments);
    return this;
  }

  fromEvent<T>(eventName: string): Observable<T> {
    if (!this.subscribersCounter[eventName]) {
      this.subscribersCounter[eventName] = 0;
    }
    this.subscribersCounter[eventName]++;

    if (!this.eventObservables$[eventName]) {
      this.eventObservables$[eventName] = new Observable((observer: any) => {
        const listener = (data: T) => {
          observer.next(data);
        };
        this.ioSocket.on(eventName, listener);
        return () => {
          this.subscribersCounter[eventName]--;
          if (this.subscribersCounter[eventName] === 0) {
            this.ioSocket.removeListener(eventName, listener);
            delete this.eventObservables$[eventName];
          }
        };
      }).pipe(share());
    }
    return this.eventObservables$[eventName];
  }

  fromOneTimeEvent<T>(eventName: string): Promise<T> {
    return new Promise<T>(resolve => this.once(eventName, resolve));
  }

  listeners(eventName: string): Function[] {
    return this.ioSocket.listeners(eventName);
  }

  listenersAny(): Function[] {
    return this.ioSocket.listenersAny();
  }

  listenersAnyOutgoing(): Function[] {
    return this.ioSocket.listenersAnyOutgoing();
  }

  off(eventName?: string, listener?: Function[]): this {
    if (!eventName) {
      // Remove all listeners for all events
      this.ioSocket.offAny();
      return this;
    }

    if (eventName && !listener) {
      // Remove all listeners for that event
      this.ioSocket.off(eventName);
      return this;
    }

    // Removes the specified listener from the listener array for the event named
    this.ioSocket.off(eventName, listener);
    return this;
  }

  offAny(callback?: (event: string, ...args: any[]) => void): this {
    this.ioSocket.offAny(callback);
    return this;
  }

  offAnyOutgoing(callback?: (event: string, ...args: any[]) => void): this {
    this.ioSocket.offAnyOutgoing(callback);
    return this;
  }

  onAny(callback: (event: string, ...args: any[]) => void): this {
    this.ioSocket.onAny(callback);
    return this;
  }

  onAnyOutgoing(callback: (event: string, ...args: any[]) => void): this {
    this.ioSocket.onAnyOutgoing(callback);
    return this;
  }

  prependAny(callback: (event: string, ...args: any[]) => void): this {
    this.ioSocket.prependAny(callback);
    return this;
  }

  prependAnyOutgoing(
    callback: (event: string | symbol, ...args: any[]) => void
  ): this {
    this.ioSocket.prependAnyOutgoing(callback);
    return this;
  }

  timeout(value: number): this {
    this.ioSocket.timeout(value);
    return this;
  }

  get volatile(): this {
    // this getter has a side-effect of turning the socket instance true,
    // but it returns the actual instance, so we need to get the value to force the side effect
    const _ = this.ioSocket.volatile;
    return this;
  }

  get active(): boolean {
    return this.ioSocket.active;
  }

  get connected(): boolean {
    return this.ioSocket.connected;
  }

  get disconnected(): boolean {
    return this.ioSocket.disconnected;
  }

  get recovered(): boolean {
    return this.ioSocket.recovered;
  }

  get id(): string {
    return this.ioSocket.id;
  }

  compress(value: boolean): this {
    this.ioSocket.compress(value);
    return this;
  }
}
