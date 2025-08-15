export { SocketIoModule, SOCKET_CONFIG_TOKEN, provideSocketIo } from './src/socket-io.module';
export { SocketIoConfig } from './src/config/socket-io.config';
export { WrappedSocket as Socket } from './src/socket-io.service';
export type { AllButLast, DecorateAcknowledgements, First, FirstArg, Last } from './src/socket-io.service';
export type { DefaultEventsMap, EventNames, EventParams, EventsMap, ReservedOrUserEventNames, ReservedOrUserListener } from '@socket.io/component-emitter';