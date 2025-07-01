import {
  NgModule,
  ModuleWithProviders,
  InjectionToken,
  makeEnvironmentProviders,
  EnvironmentProviders,
  ApplicationRef,
} from '@angular/core';
import { SocketIoConfig } from './config/socket-io.config';
import { WrappedSocket } from './socket-io.service';

/** Socket factory */
export function SocketFactory(config: SocketIoConfig, appRef: ApplicationRef) {
  return new WrappedSocket(config, appRef);
}

export const SOCKET_CONFIG_TOKEN = new InjectionToken<SocketIoConfig>(
  '__SOCKET_IO_CONFIG__'
);

@NgModule({})
export class SocketIoModule {
  static forRoot(config: SocketIoConfig): ModuleWithProviders<SocketIoModule> {
    return {
      ngModule: SocketIoModule,
      providers: [
        { provide: SOCKET_CONFIG_TOKEN, useValue: config },
        {
          provide: WrappedSocket,
          useFactory: SocketFactory,
          deps: [SOCKET_CONFIG_TOKEN, ApplicationRef],
        },
      ],
    };
  }
}

export const provideSocketIo = (
  config: SocketIoConfig
): EnvironmentProviders => {
  return makeEnvironmentProviders([
    { provide: SOCKET_CONFIG_TOKEN, useValue: config },
    {
      provide: WrappedSocket,
      useFactory: SocketFactory,
      deps: [SOCKET_CONFIG_TOKEN],
    },
  ]);
};
