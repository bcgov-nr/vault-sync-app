import * as fs from 'fs';
import * as path from 'path';
import { injectable } from 'inversify';
import {
  AppActorPolicies,
  AppConfig,
  ConfigService,
  DbConfig,
  GroupConfig,
  VaultConfig,
} from '../config.service';
import merge from 'merge-deep';

const periodLookup = {
  hourly: 3600,
  bidaily: 43200,
  daily: 86400,
  weekly: 604800,
};

@injectable()
/**
 * Service for configuration details
 */
export class ConfigFileService implements ConfigService {
  private static readonly policyFilePath = path.join(
    __dirname,
    '../../../config',
    'config.json',
  );
  private static readonly config = JSON.parse(
    fs.readFileSync(ConfigFileService.policyFilePath, { encoding: 'utf8' }),
  ) as VaultConfig;

  /**
   * Apply configuration defaults to the app
   * @param app The application config to apply defaults to
   */
  private static applyAppConfigDefaults(app: AppConfig): AppConfig {
    const tokenPeriodDefault =
      app.policyOptions?.tokenPeriod &&
      periodLookup[app.policyOptions?.tokenPeriod]
        ? periodLookup[app.policyOptions?.tokenPeriod]
        : periodLookup['daily'];
    /* eslint-disable camelcase -- Library code style issue */
    return merge(
      {
        approle: {
          // Vault defaults -- https://www.vaultproject.io/api/auth/approle
          ...{
            enabled: false,
            bind_secret_id: true,
            secret_id_bound_cidrs: '',
            secret_id_num_uses: 0,
            secret_id_ttl: 0,
            enable_local_secret_ids: false,
            token_ttl: 0,
            token_max_ttl: 0,
            token_policies: '',
            token_bound_cidrs: '',
            token_explicit_max_ttl: 0,
            token_no_default_policy: false,
            token_num_uses: 0,
            token_period: 0,
            token_type: '',
          },
          // VS defaults
          ...{
            secret_id_ttl: periodLookup['hourly'],
            token_period: tokenPeriodDefault,
            secret_id_num_uses: 1,
            options: {
              project: false,
              read: true,
              write: false,
            },
            role_name: '',
          },
        },
      },
      app,
    );
    /* eslint-enable camelcase */
  }
  /**
   * Return default policies to grant each type of actor
   */
  getAppActorDefaults(): Promise<AppActorPolicies> {
    return Promise.resolve(ConfigFileService.config.appActorDefaults);
  }

  /**
   * Return the configured DB secret engines
   */
  getDbStores(): Promise<DbConfig[]> {
    return Promise.resolve(ConfigFileService.config.db);
  }

  /**
   * Return a database type from a database name
   */
  getDbType(name: string): Promise<string> {
    const dbConfig = ConfigFileService.config.db.find(
      (dbConfig) => dbConfig.name === name,
    );
    if (dbConfig) {
      return Promise.resolve(dbConfig.type);
    }
    throw new Error(`DB named '${name}' not found`);
  }

  /**
   * Return the paths to the KV secret stores
   */
  getKvStores(): Promise<string[]> {
    return Promise.resolve(ConfigFileService.config.kv);
  }

  /**
   * Return all groups in the configuration
   */
  getGroups(): Promise<GroupConfig[]> {
    return Promise.resolve(ConfigFileService.config.groups);
  }
}
