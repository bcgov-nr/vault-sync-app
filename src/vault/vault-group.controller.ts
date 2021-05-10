import {inject, injectable} from 'inversify';
import nv from 'node-vault';
import winston from 'winston';
import {TYPES} from '../inversify.types';
import {AppService} from '../services/app.service';
import {ConfigService} from '../services/config.service';
import VaultApi from './vault.api';
import HclUtil from '../util/hcl.util';
import {GroupPolicyService} from './policy-roots/impl/group-policy.service';
import {AppPolicyService} from './policy-roots/impl/app-policy.service';

@injectable()
/**
 * Vault group controller.
 */
export default class VaultGroupController {
  /**
   * Constructor. Accepts a vault client, and logger.
   */
  constructor(
    @inject(TYPES.Vault) private vault: nv.client,
    @inject(TYPES.VaultApi) private vaultApi: VaultApi,
    @inject(TYPES.ConfigService) private config: ConfigService,
    @inject(TYPES.AppService) private appService: AppService,
    @inject(TYPES.HclUtil) private hclUtil: HclUtil,
    @inject(TYPES.GroupPolicyService) private groupRootService: GroupPolicyService,
    @inject(TYPES.AppPolicyService) private appRootService: AppPolicyService,
    @inject(TYPES.Logger) private logger: winston.Logger,
  ) {}

  /**
   * Sync external groups to Vault
   */
  public async sync() {
    await this.syncAppGroups();
    await this.syncUserGroups();
    // TODO: Remove no longer used groups
  }

  /**
   * Sync app groups. This is specifically for developers.
   */
  public async syncAppGroups() {
    const apps = await this.config.getApps();
    const devAppGroup = (await this.config.getAppGroups()).developer;
    const projectSet = new Set();
    for (const app of apps) {
      try {
        const appInfo = await this.appService.getApp(app.name);
        const specs = await this.appRootService.build(appInfo);
        if (projectSet.has(appInfo.project)) {
          continue;
        }
        projectSet.add(appInfo.project);
        const policyNames = specs.filter((spec) => {
          return spec.data && devAppGroup[spec.data.environment] &&
              devAppGroup[spec.data.environment].indexOf(spec.templateName) != -1;
        })
          .map((spec) => this.hclUtil.renderName(spec));
        await this.syncGroup(`${appInfo.project.toLowerCase()}-developers`, policyNames);
      } catch (error) {
        this.logger.error(`Error syncing dev app group: ${app.name}`);
      }
    }
  }

  /**
   * Sync user groups
   */
  public async syncUserGroups() {
    const groups = await this.config.getGroups();
    for (const group of groups) {
      await this.syncGroup(group.name, [
        ...(group.policies ? group.policies : []),
        ...(await this.groupRootService.build(group))
          .filter((spec) => spec.templateName === 'user')
          .map((spec) => this.hclUtil.renderName(spec)),
      ]);
    }
  }

  /**
   * Find a user group in Vault; create it if it does not exist.
   */
  public async syncGroup(groupName: string, policies: string[], metadata: {[key: string]: string} = {}): Promise<any> {
    const accessor = await this.vaultApi.getOidcAccessor();

    let group = await this.vault.write(
      `identity/group/name/${groupName}`, {
        policies,
        type: 'external',
        metadata,
      })
      .catch((error: any) => {
        this.logger.error(`Error creating group '${groupName}' in Vault: Error ${error.response.statusCode}`);
        throw new Error('Could not create group');
      });

    if (!group) {
      // API does not return data if write was an update
      group = await this.vault.read(`identity/group/name/${groupName}`);
    }
    if (!group.data.alias || (group.data.alias && Object.keys(group.data.alias).length === 0)) {
      await this.createGroupAlias(group.data.id, accessor, groupName);
    } else {
      this.logger.debug('Skip adding alias');
    }
    this.logger.info(`Vault group: ${groupName}`);
    return group;
  }

  /**
   * Create a group alias
   * @param canonicalId The group canonical id
   * @param accessor The accessor id
   * @param name The name provided by the accessor for the group
   */
  async createGroupAlias(canonicalId: string, mountAccessor: string, name: string) {
    const alias = await this.vault.write(`identity/lookup/group`,
      {alias_name: name, alias_mount_accessor: mountAccessor});

    if (!alias) {
      return await this.vault.write(
        `identity/group-alias`, {
          name,
          mount_accessor: mountAccessor,
          canonical_id: canonicalId,
        })
        .catch((error) => {
          const code = error.response.statusCode;
          this.logger.error(
            `Failed to create alias '${name}' for '${canonicalId}' on '${mountAccessor}' in Vault. Error ${code}`);
          throw new Error('Could not create alias');
        });
    }
  }
}
