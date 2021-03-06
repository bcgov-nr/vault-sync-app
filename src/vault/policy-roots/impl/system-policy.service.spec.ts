import winston from 'winston';
import {ConfigService} from '../../../services/config.service';
import {VAULT_ROOT_SYSTEM} from '../policy-root.service';
import {SystemPolicyService} from './system-policy.service';

jest.mock('../oidc-data.deco', () => jest.fn());

describe('system-policy.service', () => {
  const mockLogger = {
    info: jest.fn(() => { }),
    error: jest.fn(() => { }),
    debug: jest.fn(() => { }),
  } as unknown as winston.Logger;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getName', () => {
    const sps = new SystemPolicyService({} as unknown as ConfigService, mockLogger);

    expect(sps.getName()).toBe(VAULT_ROOT_SYSTEM);
  });

  test('build: no limit', async () => {
    const sps = new SystemPolicyService({} as unknown as ConfigService, mockLogger);

    jest.spyOn(sps, 'buildSystem').mockReturnValue([]);
    jest.spyOn(sps, 'buildKvSecretEngines').mockReturnValue(Promise.resolve([]));
    await sps.build();

    expect(sps.buildSystem).toBeCalledTimes(1);
    expect(sps.buildKvSecretEngines).toBeCalledTimes(1);
  });
});
