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

      const selectedProvider = this.getEip6963Provider(this.#options)?.provider;
      if (selectedProvider && selectedProvider !== this.ethereum) {
        this.ethereum = selectedProvider;
      }
    };

    // subscribe to the announceProvider event
    window.addEventListener('eip6963:announceProvider', handleEip6963Event);

    // request for the provider details
    window.dispatchEvent(new Eip6963RequestProviderEvent());
  }

  /**
   * Get the EIP-6963 provider details.
   *
   * @param filter.rdns filter the provider by reverse DNS name
   * @returns EIP-6963 provider details or null
   */
  getEip6963Provider(
    filter?: Eip6963ProviderFilter
  ): Eip6963ProviderDetail | null {
    const defaultProvider = this.#providers[0] || null;
    if (!filter?.rdns) return defaultProvider;
    return (
      this.#providers.find(
        (providerDetail) => providerDetail.info.rdns === filter.rdns
      ) || defaultProvider
    );
  }
}
