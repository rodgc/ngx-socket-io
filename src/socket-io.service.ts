import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

import * as ioModule from 'socket.io-client';
import type { io, Socket } from 'socket.io-client';
import type {
  ReservedOrUserListener,
  ReservedOrUserEventNames,
  DefaultEventsMap,
} from '@socket.io/component-emitter';

export type IoSocket = Socket;
// This is not exported in the original, but let's export as helpers for those declaring disconnect handlers
export type DisconnectDescription =
  | Error
  | {
      description: string;
      context?: unknown;
    };

// Not exported but needed to properly map ReservedEvents to their signatures
interface SocketReservedEvents {
  connect: () => void;
  connect_error: (err: Error) => void;
  disconnect: (
    reason: Socket.DisconnectReason,
    description?: DisconnectDescription
  ) => void;
}

type EventNames = ReservedOrUserEventNames<
  SocketReservedEvents,
  DefaultEventsMap
>;
type EventListener<Ev extends EventNames> = ReservedOrUserListener<
  SocketReservedEvents,
  DefaultEventsMap,
  Ev
>;
type EventParameters<Ev extends EventNames> = Parameters<EventListener<Ev>>;
type EventPayload<Ev extends EventNames> =
  EventParameters<Ev> extends [] ? undefined : EventParameters<Ev>[0];

type IgnoredWrapperEvents = 'receiveBuffer' | 'sendBuffer';

type WrappedSocketIface<Wrapper> = {
  [K in Exclude<keyof IoSocket, IgnoredWrapperEvents>]: IoSocket[K] extends (
    ...args: any[]
  ) => IoSocket
    ? (...args: Parameters<IoSocket[K]>) => Wrapper // chainable methods on().off().emit()...
    : IoSocket[K] extends IoSocket
      ? Wrapper // ie: volatile is a getter
      : IoSocket[K];
};

import { SocketIoConfig } from './config/socket-io.config';

export class WrappedSocket implements WrappedSocketIface<WrappedSocket> {
  subscribersCounter: Record<string, number> = {};
  eventObservables$: Record<string, Observable<any>> = {};
  namespaces: Record<string, WrappedSocket> = {};
  ioSocket: IoSocket;
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
    const ioFunc = (
      (ioModule as any).default ? (ioModule as any).default : ioModule
    ) as typeof io;
    this.ioSocket = ioFunc(url, options);
  }

  get auth(): Socket['auth'] {
    return this.ioSocket.auth;
  }

  set auth(value: Socket['auth']) {
    this.ioSocket.auth = value;
  }

  /** readonly access to io manager */
  get io(): Socket['io'] {
    return this.ioSocket.io;
  }

  /** alias to connect */
  get open(): WrappedSocket['connect'] {
    return this.connect;
  }

  /** alias to disconnect */
  get close(): WrappedSocket['disconnect'] {
    return this.disconnect;
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

  on<Ev extends EventNames>(eventName: Ev, callback: EventListener<Ev>): this {
    this.ioSocket.on(eventName, callback);
    return this;
  }

  once<Ev extends EventNames>(
    eventName: Ev,
    callback: EventListener<Ev>
  ): this {
    this.ioSocket.once(eventName, callback);
    return this;
  }

  connect(): this {
    this.ioSocket.connect();
    return this;
  }

  disconnect(): this {
    this.ioSocket.disconnect();
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

  removeListener<Ev extends EventNames>(
    _eventName?: Ev,
    _callback?: EventListener<Ev>
  ): this {
    this.ioSocket.removeListener.apply(this.ioSocket, arguments);
    return this;
  }

  removeAllListeners<Ev extends EventNames>(_eventName?: Ev): this {
    this.ioSocket.removeAllListeners.apply(this.ioSocket, arguments);
    return this;
  }

  fromEvent<T extends EventPayload<Ev>, Ev extends EventNames>(
    eventName: Ev
  ): Observable<T> {
    if (!this.subscribersCounter[eventName]) {
      this.subscribersCounter[eventName] = 0;
    }
    this.subscribersCounter[eventName]++;

    if (!this.eventObservables$[eventName]) {
      this.eventObservables$[eventName] = new Observable((observer: any) => {
        const listener = (data: T) => {
          observer.next(data);
        };
        this.ioSocket.on(eventName, listener as EventListener<Ev>);
        return () => {
          this.subscribersCounter[eventName]--;
          if (this.subscribersCounter[eventName] === 0) {
            this.ioSocket.removeListener(
              eventName,
              listener as EventListener<Ev>
            );
            delete this.eventObservables$[eventName];
          }
        };
      }).pipe(share());
    }
    return this.eventObservables$[eventName];
  }

  fromOneTimeEvent<T extends EventPayload<Ev>, Ev extends EventNames>(
    eventName: Ev
  ): Promise<T> {
    return new Promise<T>(resolve =>
      this.once(eventName, resolve as EventListener<Ev>)
    );
  }

  listeners<Ev extends EventNames>(eventName: Ev): EventListener<Ev>[] {
    return this.ioSocket.listeners(eventName);
  }

  hasListeners<Ev extends EventNames>(eventName: Ev): boolean {
    return this.ioSocket.hasListeners(eventName);
  }

  listenersAny(): ((...args: any[]) => void)[] {
    return this.ioSocket.listenersAny();
  }

  listenersAnyOutgoing(): ((...args: any[]) => void)[] {
    return this.ioSocket.listenersAnyOutgoing();
  }

  off<Ev extends EventNames>(
    eventName?: Ev,
    listener?: EventListener<Ev>
  ): this {
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

  get active(): Socket['active'] {
    return this.ioSocket.active;
  }

  get connected(): Socket['connected'] {
    return this.ioSocket.connected;
  }

  get disconnected(): Socket['disconnected'] {
    return this.ioSocket.disconnected;
  }

  get recovered(): Socket['recovered'] {
    return this.ioSocket.recovered;
  }

  get id(): Socket['id'] {
    return this.ioSocket.id;
  }

  compress(value: boolean): this {
    this.ioSocket.compress(value);
    return this;
  }
}
