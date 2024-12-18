import ApproleSync from './approle-sync';
import { bindVault, vsContainer } from '../inversify.config';

jest.mock('../inversify.config');

describe('approle sync command', () => {
  let stdoutSpy: jest.SpyInstance;
  beforeEach(() => {
    stdoutSpy = jest.spyOn(console, 'log').mockImplementation(() => true);
  });

  afterEach(() => jest.restoreAllMocks());

  it('run without root', async () => {
    const mockVgcInstance = {
      sync: jest.fn(),
    };
    const mockBindVault = jest.mocked(bindVault);
    const mockVsContainer = jest.mocked(vsContainer);
    mockBindVault.mockReturnValue();
    mockVsContainer.get.mockReturnValue(mockVgcInstance);

    // Test command
    await ApproleSync.run(['--vault-addr', 'addr', '--vault-token', 'token']);

    expect(mockBindVault).toHaveBeenCalledTimes(1);
    expect(mockBindVault).toHaveBeenCalledWith('addr', 'token');
    expect(mockVgcInstance.sync).toHaveBeenCalled();
    expect(stdoutSpy).toHaveBeenCalledWith('Vault Approle Sync');
  });
});
