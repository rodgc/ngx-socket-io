import type { ManagerOptions } from 'socket.io-client';

/** Config interface */
export interface SocketIoConfig {
  url: string;
  /**
   * Options
   * References:
   * https://socket.io/docs/v4/client-options
   */
  options?: Partial<ManagerOptions>;
}
