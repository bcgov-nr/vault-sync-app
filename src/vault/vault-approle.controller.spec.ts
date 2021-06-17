import nv from 'node-vault';
import winston from 'winston';
import {AppService} from '../services/app.service';
import VaultApproleController, {VAULT_APPROLE_MOUNT_POINT} from './vault-approle.controller';
import HclUtil from '../util/hcl.util';
import {AppPolicyService} from './policy-roots/impl/app-policy.service';

describe('vault-approle.controller', () => {
  const mockHclUtil = {
    renderName: jest.fn(() => 'policyname'),
    renderApproleName: jest.fn(() => 'name'),
  } as unknown as HclUtil;

  const vault = {
    read: jest.fn(),
    write: jest.fn(),
    addApproleRole: jest.fn(),
    approleRoles: jest.fn(() => ({data: {keys: ['a', 'c', 'd']}})),
    deleteApproleRole: jest.fn(),
  } as unknown as nv.client;

  const mockApps = [{
    config: {
      enabled: true,
      approle: {
        enabled: true,
        options: {},
      },
    },
    env: ['PRODUCTION'],
  }];
  const mockAppService = {
    getAllApps: jest.fn(() => mockApps),
  } as unknown as AppService;

  const mockAppRootService = {
    buildApplicationForEnv: jest.fn(() => [{}]),
  } as unknown as AppPolicyService;

  const mockLogger = {
    info: jest.fn(() => { }),
    error: jest.fn(() => { }),
    debug: jest.fn(() => { }),
  } as unknown as winston.Logger;

  /**
   * Test harness factory
   */
  function vgcFactory() {
    return new VaultApproleController(
      vault,
      mockAppService,
      mockAppRootService,
      mockHclUtil,
      mockLogger);
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('sync', async () => {
    const va = vgcFactory();
    const mockDict = {};
    jest.spyOn(va, 'buildApproleDict').mockReturnValue(Promise.resolve(mockDict));
    jest.spyOn(va, 'createUpdateRoles').mockReturnValue(Promise.resolve());
    jest.spyOn(va, 'removeUnusedRoles').mockReturnValue(Promise.resolve());

    await va.sync();

    expect(va.buildApproleDict).toBeCalledTimes(1);
    expect(va.createUpdateRoles).toBeCalledTimes(1);
    expect(va.createUpdateRoles).toBeCalledWith(mockDict);
    expect(va.removeUnusedRoles).toBeCalledTimes(1);
    expect(va.removeUnusedRoles).toBeCalledWith(expect.any(Set));
  });

  test('buildApproleDict', async () => {
    const va = vgcFactory();

    const rval = await va.buildApproleDict();

    expect(mockAppService.getAllApps).toBeCalledTimes(1);
    expect(mockHclUtil.renderApproleName).toBeCalledTimes(1);
    expect(mockHclUtil.renderApproleName).toBeCalledWith(mockApps[0], 'PRODUCTION');

    expect(mockAppRootService.buildApplicationForEnv).toBeCalledTimes(1);
    expect(mockAppRootService.buildApplicationForEnv).toBeCalledWith(
      mockApps[0], 'PRODUCTION', mockApps[0].config.approle.options);

    expect(mockHclUtil.renderName).toBeCalledTimes(1);

    expect(rval).toEqual({
      name: {
        enabled: true,
        options: {},
        role_name: 'name',
        token_policies: 'policyname',
      },
    });
  });

  test('createUpdateRoles', async () => {
    const va = vgcFactory();
    await va.createUpdateRoles({
      name: {
        enabled: true,
        options: {
          project: true,
          read: true,
          write: true,
        },
        role_name: 'name',
        bind_secret_id: true,
        secret_id_bound_cidrs: 'secret_id_bound_cidrs',
        secret_id_num_uses: 2,
        secret_id_ttl: 5564,
        enable_local_secret_ids: false,
        token_ttl: 546,
        token_max_ttl: 798897,
        token_policies: 'policy',
        token_bound_cidrs: '',
        token_explicit_max_ttl: 46545,
        token_no_default_policy: true,
        token_num_uses: 44,
        token_period: 798,
        token_type: 'string',
      },
    });

    expect(vault.addApproleRole).toBeCalledTimes(1);
    expect(vault.addApproleRole).toBeCalledWith({
      'bind_secret_id': true,
      'bound_cidr_list': '',
      'mount_point': 'vs_apps_approle',
      'period': 798,
      'policies': 'policy',
      'role_name': 'name',
      'secret_id_num_uses': 2,
      'secret_id_ttl': 5564,
      'token_max_ttl': 798897,
      'token_num_uses': 44,
      'token_ttl': 546,
    });
  });

  test('removeUnusedRoles', async () => {
    const va = vgcFactory();
    const regSet = new Set(['a', 'b']);

    await va.removeUnusedRoles(regSet);

    expect(vault.approleRoles).toBeCalledTimes(1);
    expect(vault.approleRoles).toBeCalledWith({mount_point: VAULT_APPROLE_MOUNT_POINT});

    expect(vault.deleteApproleRole).toBeCalledTimes(2);
    expect(vault.deleteApproleRole).toBeCalledWith({mount_point: VAULT_APPROLE_MOUNT_POINT, role_name: 'c'});
    expect(vault.deleteApproleRole).toBeCalledWith({mount_point: VAULT_APPROLE_MOUNT_POINT, role_name: 'd'});
  });
});
