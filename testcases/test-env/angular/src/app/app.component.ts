// See: https://github.com/ethers-io/ethers.js/issues/3910

import { Component } from '@angular/core';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: any;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'test';
  network?: ethers.Network;

  async connect() {

    if (window.ethereum == null) {
      // If MetaMask is not installed, we use the default provider,
      // which is backed by a variety of third-party services (such
      // as INFURA). They do not have private keys installed so are
      // only have read-only access
      console.log('MetaMask not installed; using read-only defaults');
    } else {
      // Connect to the MetaMask EIP-1193 object. This is a standard
      // protocol that allows Ethers access to make all read-only
      // requests through MetaMask.
      const provider = new ethers.BrowserProvider(window.ethereum);

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('accounts: ', accounts);
      // It also provides an opportunity to request access to write
      // operations, which will be performed by the private key
      // that MetaMask manages for the user.
      this.network = await provider.getNetwork();
    }
  }

}
