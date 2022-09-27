import {injectable} from 'inversify';

/**
 * Library of environment aliases
 */
const envAlias: {[key: string]: string} = {
  'PRODUCTION': 'prod',
  'TEST': 'test',
  'DELIVERY': 'dev',
  'DEVELOPMENT': 'dev',
  'INTEGRATION': 'dev',
  'WFPRD': 'prod',
  'WFTST': 'test',
  'WFDLV': 'dev',
  'WFINT': 'dev',
  'SMTPRODUCTION': 'prod',
  'SMTTEST': 'test',
  'SMTDELIVERY': 'dev',
};

@injectable()
/**
 * Utility class for environment strings
 */
export default class EnvironmentUtil {
  /**
   * Normalize evironment names
   * @param environment The string to normalize
   */
  public static normalize(environment: string): string {
    if (environment in envAlias) {
      return envAlias[environment];
    }
    throw new Error(`Unsupported env: ${environment}`);
  }
}
