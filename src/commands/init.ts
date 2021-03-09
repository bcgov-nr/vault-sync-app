import {Command} from '@oclif/command';
import 'reflect-metadata';
import * as fs from 'fs';
import {vaultFactory} from '../vault/vault.factory';
import {help, secretShares, secretThreshold, vaultAddr, vaultToken} from '../flags';

/**
 * Vault Initialization command
 */
export default class Init extends Command {
  static description = 'Initialize a Vault instance and save root token and unseal keys.';

  static flags = {
    ...help,
    ...secretShares,
    ...secretThreshold,
    ...vaultToken,
    ...vaultAddr,
  };

  static args = [{name: 'vault-addr'}, {name: 'vault-token'}];

  /**
   * Run the command
   */
  async run() {
    const {flags} = this.parse(Init);
    const vault = vaultFactory(flags['vault-addr'], flags['vault-token']);
    const {initialized, version} = await vault.health();
    const secretShares = flags['secret-shares'];
    const secretThreshold = flags['secret-threshold'];

    this.log(`Init vault - ${vault.endpoint} (${version})`);

    if (!initialized) {
      this.log('Warning: Never initialize a production server this way');

      if (secretThreshold <= 0) {
        this.log('Secret threshold must be greater than 0');
        this.exit();
      }

      if (secretShares <= 0) {
        this.log('Secret shares must be greater than 0');
        this.exit();
      }

      if (secretThreshold > secretShares ) {
        this.log('Secret threshold must be smaller than secret shares');
        this.exit();
      }

      const result = await vault.init({
        secret_shares: secretShares,
        secret_threshold: secretThreshold,
      });
      const token = result.root_token;

      vault.token = token;
      fs.writeFileSync('VAULT_ROOT_TOKEN', token);
      if (flags['secret-shares'] === 1) {
        fs.writeFileSync('VAULT_UNSEAL_KEY', result.keys[0]);
      } else {
        fs.writeFileSync('VAULT_UNSEAL_KEY', JSON.stringify(result.keys));
      }
      let unsealCnt = 0;
      for (const key of result.keys) {
        unsealCnt++;
        await vault.unseal({key});
        if (unsealCnt >= secretThreshold) {
          break;
        }
      }
    } else {
      this.log('Already initialized. No action taken.');
    }
  }
}
