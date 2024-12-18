import { vsContainer } from '../../inversify.config';
import deduplicate from './deduplicate.deco';

jest.mock('../../inversify.config');

describe('deduplicate.deco', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('deduplicates HlcRenderSpec from array of HlcRenderSpec', async () => {
    const mockHclUtilInstance = {
      // Simple test for now. Only the first value should go through
      renderName: jest.fn().mockReturnValue('policyname'),
    };
    const mockVsContainer = jest.mocked(vsContainer);
    mockVsContainer.get.mockReturnValue(mockHclUtilInstance);

    const value = jest
      .fn()
      .mockResolvedValue([
        { foo: 'bar' },
        { should: 'beremoved' },
        { should: 'also be removed' },
      ]);
    const descriptor: PropertyDescriptor = { value };
    deduplicate(undefined, '', descriptor);
    expect(descriptor.value).not.toBe(undefined);

    const rval = await descriptor.value('myargs');
    expect(value).toHaveBeenCalledTimes(1);
    expect(value).toHaveBeenCalledWith('myargs');

    expect(rval).toEqual([{ foo: 'bar' }]);
  });
});
