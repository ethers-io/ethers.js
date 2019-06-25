import { Networkish } from '@ethersproject/networks';
import { AsyncSendable, JsonRpc, Web3Provider } from './web3-provider';

interface IFrameProviderOptions {
  // How long in milliseconds to wait for a response from the parent window before timing out.
  timeoutMs?: number;

  // The origin that should be allowed to host this DAPP. Passed directly to Window#postMessage.
  targetOrigin?: string;
}

class IFrameEthereumProvider implements AsyncSendable {
  public readonly isMetaMask: false;

  private readonly targetOrigin: string;
  private readonly timeoutMs: number;
  private listenerAttached: boolean = false;
  private callbackMap: { [ rpcId: number ]: (error: any, data: any) => void } = {};

  constructor({ timeoutMs = 60000, targetOrigin = '*' }: IFrameProviderOptions = {}) {
    this.targetOrigin = targetOrigin;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Return true if the current context is a window within an iframe.
   */
  public static isWithinIframe(): boolean {
    return window && window.parent && window.parent !== window.self;
  }

  /**
   * Handles events from the parent window
   * @param event received from the parent window
   */
  private handleEvents(event: MessageEvent): void {
    if (event.origin === this.targetOrigin) {
      if (event.data && this.callbackMap[ event.data.id ]) {
        this.callbackMap[ event.data.id ](null, event.data);

        // Remove the resolver from the map so it is not rejected.
        delete this.callbackMap[ event.data.id ];
      }
    }
  }

  /**
   * Attach the message listener only once for this provider.
   */
  private attachListenerOnce(): void {
    if (this.listenerAttached) {
      return;
    }

    this.listenerAttached = true;

    window.addEventListener('message', this.handleEvents);
  }

  /**
   * Send a JSON RPC to the parent window.
   */
  public sendAsync(request: JsonRpc, callback: (error: any, response: any) => void): void {
    if (!IFrameEthereumProvider.isWithinIframe()) {
      throw new Error('Not embedded in an iframe.');
    }

    const parentWindow = window && window.parent;

    this.attachListenerOnce();

    const id = request.id;

    this.callbackMap[ id ] = callback;

    parentWindow.postMessage(request, this.targetOrigin);

    setTimeout(() => {
      if (this.callbackMap[ id ]) {
        callback(new Error(`The RPC to the parent iframe has timed out after ${this.timeoutMs}ms`), null);
      }

      // We no longer care about the result of the RPC after the time out.
      delete this.callbackMap[ id ];
    }, this.timeoutMs);
  }
}

export default class IFrameProvider extends Web3Provider {
  constructor(options?: IFrameProviderOptions, network?: Networkish) {
    const executor = new IFrameEthereumProvider(options);
    super(executor, network);
  }
}