import {inject, injectable} from 'inversify';
import winston from 'winston';
import nv from 'node-vault';
import {TYPES} from '../inversify.types';
import {AppService} from '../services/app.service';
import {AppConfigApprole} from '../services/config.service';
import {AppPolicyService} from './policy-roots/impl/app-policy.service';
import HclUtil from '../util/hcl.util';

interface ApproleDict {
  [key: string]: AppConfigApprole;
}

export const VAULT_APPROLE_MOUNT_POINT = 'vs_apps_approle';

@injectable()
/**
 * Vault approle controller.
 */
export default class VaultApproleController {
  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.Vault) private vault: nv.client,
    @inject(TYPES.AppService) private appService: AppService,
    @inject(TYPES.AppPolicyService) private appRootService: AppPolicyService,
    @inject(TYPES.HclUtil) private hclUtil: HclUtil,
    @inject(TYPES.Logger) private logger: winston.Logger,
  ) {}

  /**
   * Syncs approles
   */
  public async sync() {
    const approleDict = await this.buildApproleDict();

    // create / update roles
    await this.createUpdateRoles(approleDict);
    // Remove roles that no longer exist in configuration
    await this.removeUnusedRoles(new Set(Object.keys(approleDict)));
  }

  /**
   * Build approle dict from configuration
   */
  public async buildApproleDict() {
    const apps = await this.appService.getAllApps();
    const approleDict: ApproleDict = {};
    for (const app of apps) {
      if (app.config && app.config?.enabled && app.config.approle?.enabled) {
        for (const env of app.env) {
          const approleName = this.hclUtil.renderApproleName(app, env);

          const spec = this.appRootService.buildApplicationForEnv(app, env, app.config.approle.options);
          const policies = spec.map(this.hclUtil.renderName).join(',');
          approleDict[approleName] = {
            ...app.config.approle,
            ...{
              role_name: approleName,
              token_policies: policies,
            },
          };
        }
      }
    }
    return approleDict;
  }

  /**
   * Create / update roles based on configuration
   * @param approleDict The app role dict
   */
  public async createUpdateRoles(approleDict: ApproleDict) {
    for (const role of Object.keys(approleDict)) {
      const ar = approleDict[role];
      this.logger.debug(`Create/update: ${role}`);
      // TODO: Use API directly to send all parameters
      await this.vault.addApproleRole({
        role_name: ar.role_name,
        mount_point: VAULT_APPROLE_MOUNT_POINT,
        bind_secret_id: ar.bind_secret_id,
        bound_cidr_list: ar.token_bound_cidrs,
        policies: ar.token_policies,
        secret_id_num_uses: ar.secret_id_num_uses,
        secret_id_ttl: ar.secret_id_ttl,
        token_num_uses: ar.token_num_uses,
        token_ttl: ar.token_ttl,
        token_max_ttl: ar.token_max_ttl,
        period: ar.token_period,
      });
    }
  }

  /**
   * Remove roles that no longer exist in configuration
   * @param registeredRoles The approles that have been registered to create/update
   */
  public async removeUnusedRoles(registeredRoles: Set<string>) {
    const existingRoles = (await this.vault.approleRoles({mount_point: VAULT_APPROLE_MOUNT_POINT})).data.keys;
    for (const eRole of existingRoles) {
      if (registeredRoles.has(eRole)) {
        continue;
      }
      await this.vault.deleteApproleRole({mount_point: VAULT_APPROLE_MOUNT_POINT, role_name: eRole});
    }
  }
}
