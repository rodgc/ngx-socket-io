import { ApplicationRef } from '@angular/core';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

import * as ioModule from 'socket.io-client';
import type { io, Socket } from 'socket.io-client';
import type {
  ReservedOrUserListener,
  ReservedOrUserEventNames,
  DefaultEventsMap,
  EventsMap,
  EventNames,
  EventParams,
} from '@socket.io/component-emitter';

import { SocketIoConfig } from './config/socket-io.config';

export type IoSocket<
  ListenEvents extends EventsMap = DefaultEventsMap,
  EmitEvents extends EventsMap = ListenEvents,
> = Socket<ListenEvents, EmitEvents>;
// socket.io-client internal types for emitWithAck
export type First<T extends any[]> = T extends [infer F, ...infer L] ? F : any;
export type Last<T extends any[]> = T extends [...infer H, infer L] ? L : any;
export type AllButLast<T extends any[]> = T extends [...infer H, infer L]
  ? H
  : any[];
export type FirstArg<T> = T extends (arg: infer Param) => infer Result
  ? Param
  : any;
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

export class WrappedSocket<
  ListenEvents extends EventsMap = DefaultEventsMap,
  EmitEvents extends EventsMap = ListenEvents,
> implements WrappedSocketIface<WrappedSocket>
{
  private readonly subscribersCounter: Partial<
    Record<ReservedOrUserEventNames<SocketReservedEvents, ListenEvents>, number>
  > = {};
  private readonly eventObservables$: Partial<
    Record<
      ReservedOrUserEventNames<SocketReservedEvents, ListenEvents>,
      Observable<any>
    >
  > = {};
  private readonly namespaces: Record<string, WrappedSocket> = {};
  readonly ioSocket: IoSocket<ListenEvents, EmitEvents>;
  private readonly emptyConfig: SocketIoConfig = {
    url: '',
    options: {},
  };

  constructor(
    private config: SocketIoConfig,
    private appRef: ApplicationRef
  ) {
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
    const created = new WrappedSocket(config, this.appRef);
    this.namespaces[namespace] = created;
    return created;
  }

  on<Ev extends ReservedOrUserEventNames<SocketReservedEvents, ListenEvents>>(
    eventName: Ev,
    callback: ReservedOrUserListener<SocketReservedEvents, ListenEvents, Ev>
  ): this {
    this.ioSocket.on<Ev>(eventName, callback);
    return this;
  }

  once<Ev extends ReservedOrUserEventNames<SocketReservedEvents, ListenEvents>>(
    eventName: Ev,
    callback: ReservedOrUserListener<SocketReservedEvents, ListenEvents, Ev>
  ): this {
    this.ioSocket.once<Ev>(eventName, callback);
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

  emit<
    Ep extends EventParams<EmitEvents, Ev>,
    Ev extends EventNames<EmitEvents> = EventNames<EmitEvents>,
  >(eventName: Ev, ...args: Ep): this {
    this.ioSocket.emit(eventName, ...args);
    return this;
  }

  send(..._args: any[]): this {
    this.ioSocket.send.apply(this.ioSocket, arguments);
    return this;
  }

  emitWithAck<
    Ep extends EventParams<EmitEvents, Ev>,
    Ev extends EventNames<EmitEvents> = EventNames<EmitEvents>,
  >(eventName: Ev, ...args: AllButLast<Ep>): Promise<FirstArg<Last<Ep>>> {
    return this.ioSocket.emitWithAck(eventName, ...args);
  }

  removeListener<
    Ev extends ReservedOrUserEventNames<SocketReservedEvents, ListenEvents>,
  >(
    eventName?: Ev,
    callback?: ReservedOrUserListener<SocketReservedEvents, ListenEvents, Ev>
  ): this {
    this.ioSocket.removeListener<Ev>(eventName, callback);
    return this;
  }

  removeAllListeners<
    Ev extends ReservedOrUserEventNames<SocketReservedEvents, ListenEvents>,
  >(eventName?: Ev): this {
    this.ioSocket.removeAllListeners<Ev>(eventName);
    return this;
  }

  fromEvent<
    Ep extends First<EventParams<ListenEvents, Ev>>,
    Ev extends ReservedOrUserEventNames<
      SocketReservedEvents,
      ListenEvents
    > = ReservedOrUserEventNames<SocketReservedEvents, ListenEvents>,
  >(eventName: Ev): Observable<Ep> {
    if (!this.subscribersCounter[eventName]) {
      this.subscribersCounter[eventName] = 0;
    }
    this.subscribersCounter[eventName]!++;

    if (!this.eventObservables$[eventName]) {
      this.eventObservables$[eventName] = new Observable<Ep>(observer => {
        const listener: any = (data: Ep) => {
          observer.next(data);
          this.appRef.tick();
        };
        this.ioSocket.on(eventName, listener);
        return () => {
          this.subscribersCounter[eventName]!--;
          if (this.subscribersCounter[eventName] === 0) {
            this.ioSocket.removeListener(eventName, listener);
            delete this.eventObservables$[eventName];
          }
        };
      }).pipe(share());
    }
    return this.eventObservables$[eventName];
  }

  fromOneTimeEvent<
    Ep extends ReservedOrUserListener<SocketReservedEvents, ListenEvents, Ev>,
    Ev extends ReservedOrUserEventNames<
      SocketReservedEvents,
      ListenEvents
    > = ReservedOrUserEventNames<SocketReservedEvents, ListenEvents>,
  >(eventName: Ev): Promise<Ep> {
    return new Promise<Ep>(resolve => this.once(eventName, resolve as Ep));
  }

  listeners<
    Ev extends ReservedOrUserEventNames<SocketReservedEvents, ListenEvents>,
  >(
    eventName: Ev
  ): ReservedOrUserListener<SocketReservedEvents, ListenEvents, Ev>[] {
    return this.ioSocket.listeners(eventName);
  }

  hasListeners<
    Ev extends ReservedOrUserEventNames<SocketReservedEvents, ListenEvents>,
  >(eventName: Ev): boolean {
    return this.ioSocket.hasListeners(eventName);
  }

  listenersAny(): ((...args: any[]) => void)[] {
    return this.ioSocket.listenersAny();
  }

  listenersAnyOutgoing(): ((...args: any[]) => void)[] {
    return this.ioSocket.listenersAnyOutgoing();
  }

  off<Ev extends ReservedOrUserEventNames<SocketReservedEvents, ListenEvents>>(
    eventName?: Ev,
    listener?: ReservedOrUserListener<SocketReservedEvents, ListenEvents, Ev>
  ): this {
    this.ioSocket.off<Ev>(eventName, listener);
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
