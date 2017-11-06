import { Injectable, EventEmitter, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/share'; 

import * as io from 'socket.io-client';

import { SocketIoConfig } from './config/socket-io.config';
import { SOCKET_CONFIG_TOKEN } from './socket-io.module';

export class WrappedSocket {
    subscribersCounter : number = 0;
    ioSocket: any;
    emptyConfig: SocketIoConfig = {
        url: '',
        options: {}
    };

    constructor(@Inject(SOCKET_CONFIG_TOKEN) config: SocketIoConfig) {
        if (config === undefined) config = this.emptyConfig;
        const url: string = config.url;
        const options: any = config.options;
        var ioFunc = (io as any).default ? (io as any).default : io;
        this.ioSocket = ioFunc(url, options);
    }

    on(eventName: string, callback: Function) {
        this.ioSocket.on(eventName, callback);
    }

    once(eventName: string, callback: Function) {
        this.ioSocket.once(eventName, callback);
    }

    connect() {
        return this.ioSocket.connect();
    }

    disconnect(close?: any) {
        return this.ioSocket.disconnect.apply(this.ioSocket, arguments);
    }

    emit(eventName: string, data?: any, callback?: Function) {
        return this.ioSocket.emit.apply(this.ioSocket, arguments);
    }

    removeListener(eventName: string, callback?: Function) {
        return this.ioSocket.removeListener.apply(this.ioSocket, arguments);
    }

    removeAllListeners(eventName?: string) {
        return this.ioSocket.removeAllListeners.apply(this.ioSocket, arguments);
    }

    fromEvent<T>(eventName: string): Observable<T> {
        this.subscribersCounter++;
        return Observable.create( (observer: any) => {
             this.ioSocket.on(eventName, (data: T) => {
                 observer.next(data);
             });
             return () => {
                 if (this.subscribersCounter === 1)
                    this.ioSocket.removeListener(eventName);
            };
        }).share();
    }

    fromOneTimeEvent<T>(eventName: string): Promise<T> {
        return new Promise<T>(resolve => this.once(eventName, resolve));
    }

}