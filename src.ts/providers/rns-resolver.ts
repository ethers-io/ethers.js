/**
 *  RNS is a service which allows easy-to-remember names to map to
 *  network addresses on Rootstock.
 *
 *  @_section: api/providers/rns-resolver:RNS Resolver  [about-rns-rsolver]
 */

import { ZeroAddress } from "../constants/index.js";
import { Contract } from "../contract/index.js";
import { namehash } from "../hash/index.js";

import type { AbstractProvider } from "./abstract-provider.js";

// REF: https://developers.rsk.co/rif/rns/architecture/registry/
const RNS_REGISTRY_ADDRESS = "0xcb868aeabd31e2b66f74e9a55cf064abb31a4ad5";

const stripHexPrefix = (hex: string): string => hex.slice(2);

const RNS_REGISTRY_ABI = [
  "function resolver(bytes32 node) public view returns (address)",
];

const RNS_ADDR_RESOLVER_ABI = [
  "function addr(bytes32 node) public view returns (address)",
];

const RNS_NAME_RESOLVER_ABI = [
  "function name(bytes32 node) external view returns (string)",
];

/**
 *  A connected object to a resolved RNS name resolver, which can be
 *  used to query additional details.
 */
export class RnsResolver {
    /**
     *  The connected provider.
     */
    provider!: AbstractProvider;

    /**
     *  RNS registry contract
     */
    #rnsRegistryContract: Contract;
  

    constructor(provider: AbstractProvider) {
      this.provider = provider;
      this.#rnsRegistryContract = new Contract(
          RNS_REGISTRY_ADDRESS,
          RNS_REGISTRY_ABI,
          this.provider
        );
    }

    /**
     *  Resolves to the address for %%name%% or null if the
     *  provided %%name%% has not been configured.
     */
    async getAddress(name: string): Promise<null | string> {
      const nameHash = namehash(name)
      const resolverAddress = await this.#rnsRegistryContract.resolver(nameHash)

      if (resolverAddress === ZeroAddress) {
        return null
      }

      const addrResolverContract = new Contract(
          resolverAddress,
          RNS_ADDR_RESOLVER_ABI,
          this.provider  
        )
  
      const address = await addrResolverContract.addr(nameHash)
  
      if (address === undefined || address === null) {
        return null
      }
  
      return address;
    }

    /**
     *  Resolves to the name for %%address%% or null if the
     *  provided %%address%% has not been configured.
     */
    async getName(address: string): Promise<null | string> {
      const reverseRecordHash = namehash(
          `${stripHexPrefix(address)}.addr.reverse`
        );
    
        const resolverAddress = await this.#rnsRegistryContract.resolver(
          reverseRecordHash
        );
    
        if (resolverAddress === ZeroAddress) {
          return null;
        }
    
        const nameResolverContract = new Contract(
          resolverAddress,
          RNS_NAME_RESOLVER_ABI,
          this.provider
        );
    
        const name = await nameResolverContract.name(reverseRecordHash);
    
        if (name === undefined) {
          return null;
        }
    
        return name;
    }
}
