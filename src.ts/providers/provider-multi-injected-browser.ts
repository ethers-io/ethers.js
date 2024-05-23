import { Networkish } from './network';
import { BrowserProvider, Eip1193Provider } from './provider-browser';

declare global {
  interface WindowEventMap {
    'eip6963:announceProvider': Eip6963AnnounceProviderEvent;
  }
}

export class Eip6963RequestProviderEvent extends Event {
  constructor() {
    super('eip6963:requestProvider');
  }
}

export interface Eip6963AnnounceProviderEvent extends Event {
  type: 'eip6963:announceProvider';
  detail: Eip6963ProviderDetail;
}

export interface Eip6963ProviderDetail {
  info: Eip6963ProviderInfo;
  provider: Eip1193Provider;
}

export interface Eip6963ProviderInfo {
  /**
   * Unique identifier of the wallet extension announcement, keep in mind it
   * changes on every request-announcement cycle
   */
  uuid: string;
  /**
   * Name of the wallet extension
   */
  name: string;
  /**
   * Icon for the wallet extension
   */
  icon: string;
  /**
   * Reverse DNS name of the wallet extension
   */
  rdns: string;
}

export interface Eip6963ProviderFilter {
  rdns?: string;
}

/**
 * MultiInjectedBrowserProvider is a provider that wrapper around `BrowserProvider`.
 * It supports EIP6963(https://eips.ethereum.org/EIPS/eip-6963) compliant
 * provider protocols and automatically select one to use.
 */
export class MultiInjectedBrowserProvider extends BrowserProvider {
  #options?: Eip6963ProviderFilter;

  // This will hold the details of the providers received
  #providers: Eip6963ProviderDetail[];

  constructor(options?: Eip6963ProviderFilter, network?: Networkish) {
    const notAvailableProvider: Eip1193Provider = {
      request: async () => {
        throw new Error('No provider available');
      },
    };
    super(notAvailableProvider, network);

    this.#options = options;

    const handleEip6963Event = (event: Eip6963AnnounceProviderEvent) => {
      const providerDetail = event.detail;
      const isExist = this.#providers.some(
        ({ info }) => info.uuid === providerDetail.info.uuid
      );
      if (!isExist) {
        this.#providers = [...this.#providers, providerDetail];
      }

      this.switchEip6963Provider(this.#options);
    };

    // subscribe to the announceProvider event
    window.addEventListener('eip6963:announceProvider', handleEip6963Event);

    // request for the provider details
    window.dispatchEvent(new Eip6963RequestProviderEvent());
  }

  /**
   * Switch the EIP-6963 provider detail.
   *
   * @param filter.rdns filter the provider by reverse DNS name
   * @returns EIP-6963 provider details or null
   */
  switchEip6963Provider(
    filter?: Eip6963ProviderFilter
  ): Eip6963ProviderDetail | null {
    const provider =
      this.#providers.find(
        (providerDetail) => providerDetail.info.rdns === filter?.rdns
      ) ||
      this.#providers[0] ||
      null;

    if (provider?.provider && provider.provider !== this.ethereum) {
      this.ethereum = provider.provider;
    }
    return provider;
  }

  /**
   * Get the list of EIP-6963 providers details.
   *
   * @returns EIP-6963 providers details list
   */
  getEip6963Providers(): Eip6963ProviderDetail[] {
    return this.#providers;
  }
}
