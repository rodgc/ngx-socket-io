/** Config interface */
export interface SocketIoConfig {
  url: string;
  /**
   * Options
   * References:
   * https://github.com/socketio/socket.io-client/blob/master/docs/API.md#new-managerurl-options
   */
  options?: {
    /**
     * Name of the path that is captured on the server side. Default: /socket.io
     */
    path?: string;
    /**
     * Whether to reconnect automatically. Default: true
     */
    reconnection?: boolean;
    /**
     * Number of reconnection attempts before giving up. Default: infinity
     */
    reconnectionAttempts?: number;

    /**
     * How long to initially wait before attempting a new reconnection. Default: 1000 +- randomizationFactor
     */
    reconnectionDelay?: number;

    /**
     * Maximum amount of time to wait between reconnections. Default: 5000
     */
    reconnectionDelayMax?: number;
    /**
     * Randomization factor for the reconnection delay. Default: 0.5
     */
    randomizationFactor?: number;
    /**
     * Connection timeout before a connect_error and connect_timeout events are emitted. Default: 20000
     */
    timeout?: number;
    /**
     * By setting this false, you have to call manager.open whenever you decide it's appropriate. Default: true
     */
    autoConnect?: boolean;
    /**
     * Additional query parameters that are sent when connecting a namespace (then found in socket.handshake.query object on the server-side)
     */
    query?: {
      [key: string]: string | null;
    };
    /**
     * The parser to use. Defaults to an instance of the Parser that ships with Socket.IO
     * Reference: https://github.com/socketio/socket.io-parser
     */
    parser?: any;

    // Options for the underlying Engine.IO client:
    /**
     * Whether the client should try to upgrade the transport from long-polling to something better. Default: true
     */
    upgrade?: boolean;
    /**
     * Forces JSONP for polling transport. Default: false
     */
    forceJSONP?: boolean;
    /**
     * Determines whether to use JSONP when necessary for polling. If disabled (by settings to false) an error will be emitted (saying “No transports available”) if no other transports are available. If another transport is available for opening a connection (e.g. WebSocket) that transport will be used instead. Default: false
     */
    jsonp?: boolean;
    /**
     * Forces base 64 encoding for polling transport even when XHR2 responseType is available and WebSocket even if the used standard supports binary. Default: false
     */
    forceBase64?: boolean;
    /**
     * Enables XDomainRequest for IE8 to avoid loading bar flashing with click sound. default to false because XDomainRequest has a flaw of not sending cookie. Default: false
     */
    enablesXDR?: boolean;
    /**
     * Whether to add the timestamp with each transport request. Note: polling requests are always stamped unless this option is explicitly set to false.
     */
    timestampRequests?: boolean;
    /**
     * The timestamp parameter
     */
    timestampParam?: string;
    /**
     * Port the policy server listens on. Default: 843
     */
    policyPort?: number;
    /**
     * A list of transports to try (in order). Engine always attempts to connect directly with the first one, provided the feature detection test for it passes. Default: ["polling", "websocket"]
     */
    transports?: string[];
    /**
     * Hash of options, indexed by transport name, overriding the common options for the given transport. Default: {}
     */
    transportOptions?: any;
    /**
     * If true and if the previous websocket connection to the server succeeded, the connection attempt will bypass the normal upgrade process and will initially try websocket. A connection attempt following a transport error will use the normal upgrade process. It is recommended you turn this on only when using SSL/TLS connections, or if you know that your network does not block websockets. Default: false.
     */
    rememberUpgrade?: boolean;
    /**
     * Whether transport upgrades should be restricted to transports supporting binary data. Default: false
     */
    onlyBinaryUpgrades?: boolean;
    /**
     * Timeout for xhr-polling requests in milliseconds (0) (only for polling transport). Default: 0
     */
    requestTimeout?: number;
    /**
     * A list of subprotocols. See https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#Subprotocols
     */
    protocols?: any;
    /**
     * Credentials that are sent when accessing a namespace. Default: not present
     */
    auth?: { [key: string]: any } | ((cb: (data: object) => void) => void);
    /**
     * Whether cross-site requests should be made using credentials such as cookies, authorization headers or TLS client certificates. Setting withCredentials has no effect on same-site requests. Default value: false
     */
    withCredentials?: boolean;
    /**
     * Additional headers (then found in socket.handshake.headers object on the server-side). Default value: -
     */
    extraHeaders?: {
      [header: string]: string;
    };

    /**
     * decide whether to trigger disconnect event when reloading the page or not
     * */
    closeOnBeforeunload?: boolean;

    /**
     * Whether to create a new Manager instance. Default value: false
     */
    forceNew?: boolean;

    // Additional options for NodeJS Engine.IO clients omitted: https://socket.io/docs/client-api/
  };
}
