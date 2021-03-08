import 'reflect-metadata';
import GroupSync from './group-sync';
import {mocked} from 'ts-jest/utils';
import {bindKeycloak, bindVault, vsContainer} from '../inversify.config';

jest.mock('../inversify.config');

describe('group sync command', () => {
  afterEach(() => jest.restoreAllMocks());

  it('runs', async () => {
    const mockKcInstance = {
      syncRoleAndGroup: jest.fn().mockResolvedValue('bob'),
    };
    const mockBindVault = mocked(bindVault);
    mockBindVault.mockReturnValue();

    const mockBindKeycloak = mocked(bindKeycloak);
    mockBindKeycloak.mockResolvedValue();

    const mockVsContainer = mocked(vsContainer);
    mockVsContainer.get.mockReturnValueOnce(mockKcInstance);

    // Test command
    await GroupSync.run([
      'group-name',
      '--vault-addr', 'vaddr',
      '--vault-token', 'token',
      '--keycloak-addr', 'kaddr',
      '--keycloak-username', 'user',
      '--keycloak-password', 'pass'],
    );

    expect(mockBindVault).toBeCalledTimes(1);
    expect(mockBindVault).toBeCalledWith('vaddr', 'token');

    expect(mockBindKeycloak).toBeCalledTimes(1);
    expect(mockBindKeycloak).toBeCalledWith('kaddr', 'user', 'pass');
    expect(mockKcInstance.syncRoleAndGroup).toBeCalledTimes(1);
    expect(mockKcInstance.syncRoleAndGroup).toBeCalledWith('group-name');
  });
});
