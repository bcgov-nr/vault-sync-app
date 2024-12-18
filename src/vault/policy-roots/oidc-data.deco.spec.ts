import { vsContainer } from '../../inversify.config';
import oidcData from './oidc-data.deco';

jest.mock('../../inversify.config');

describe('oidc-data.deco', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('adds OIDC info to the HlcRenderSpec', async () => {
    const mockVaultApi = {
      // Simple test for now. Only the first value should go through
      getOidcAccessors: jest.fn().mockResolvedValue(['accessorId']),
    };
    const mockVsContainer = jest.mocked(vsContainer);
    mockVsContainer.get.mockReturnValue(mockVaultApi);

    const value = jest.fn().mockResolvedValue([
      { foo: 'bar', data: {} },
      { hi: 'there', data: {} },
    ]);
    const descriptor: PropertyDescriptor = { value };
    oidcData(undefined, '', descriptor);
    expect(descriptor.value).not.toBe(undefined);

    const rval = await descriptor.value('myargs');
    expect(value).toHaveBeenCalledTimes(1);
    expect(value).toHaveBeenCalledWith('myargs');

    expect(rval).toEqual([
      { foo: 'bar', data: { global_oidc_accessor: 'accessorId' } },
      { hi: 'there', data: { global_oidc_accessor: 'accessorId' } },
    ]);
  });
});
