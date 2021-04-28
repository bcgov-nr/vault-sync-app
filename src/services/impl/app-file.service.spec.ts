import * as fs from 'fs';
import 'reflect-metadata';
import {mocked} from 'ts-jest/utils';
import {ConfigService} from '../config.service';

jest.mock('fs');
const mockFs = mocked(fs);
const mockData = [
  {
    'env': [
      'INTEGRATION',
      'TEST',
      'PRODUCTION',
      'STAGING1',
      'STAGING2',
      'STAGING3',
    ],
    'app': 'arts-client-war',
    'project': 'ARTS',
  },
  {
    'env': [
      'INTEGRATION',
      'TEST',
      'PRODUCTION',
      'STAGING1',
      'STAGING2',
      'STAGING3',
    ],
    'app': 'APP-TUS',
    'project': 'WOO',
  },
];
mockFs.readFileSync.mockReturnValue(JSON.stringify(mockData));

import {AppFileService} from './app-file.service';

describe('app-file.service', () => {
  let cs: ConfigService;
  beforeEach(() => {
    cs = {
      getApps: jest.fn().mockResolvedValue([{
        'enabled': true,
        'name': 'APP-TUS',
      }]),
      getApp: jest.fn().mockResolvedValue({
        'enabled': true,
        'name': 'APP-TUS',
      }),
    } as unknown as ConfigService;
  });

  afterEach(() => jest.restoreAllMocks());

  it('reads file once', () => {
    new AppFileService(cs);
    new AppFileService(cs);
    expect(mockFs.readFileSync).toBeCalledWith(
      expect.stringContaining('applications.json'), 'UTF8');
    expect(mockFs.readFileSync).toBeCalledTimes(1);
  });

  it('getAllApps', async () => {
    const afs = new AppFileService(cs);
    const apps = await afs.getAllApps();

    expect(apps).toEqual([
      {...mockData[1], config: {
        'enabled': true,
        'name': 'APP-TUS',
      }},
    ]);
    expect(cs.getApps).toBeCalled();
  });

  it('getAllApps - config error', async () => {
    mocked(cs.getApps).mockResolvedValue([{
      'enabled': true,
      'name': 'APP-TUS-WRONG',
    }]);
    const afs = new AppFileService(cs);
    await expect(afs.getAllApps())
      .rejects
      .toThrow();

    expect(cs.getApps).toBeCalled();
  });

  it('getApp - exists', async () => {
    const afs = new AppFileService(cs);
    const app = await afs.getApp('APP-TUS');

    expect(app).toEqual({...mockData[1], config: {
      'enabled': true,
      'name': 'APP-TUS',
    }});
  });

  it('getApp - does not exist', async () => {
    const afs = new AppFileService(cs);
    mocked(cs.getApp).mockResolvedValue(undefined);

    await expect(afs.getApp('APP-fff'))
      .rejects
      .toThrow();
  });
});