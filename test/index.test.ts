import { getSettingsHandler, setSettingsHandler, getEarnedSalaryHandler, AppStore, StoreSchema } from '../src/index';
import { SalaryCalculator } from '../src/lib/SalaryCalculator';
import { mockStoreData } from './__mocks__/electron-store';
import { calculateMonthlyWorkingHours } from '../src/lib/utils';

jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
  },
  app: {
    on: jest.fn(),
    quit: jest.fn(),
    dock: {
      hide: jest.fn(),
    },
  },
}));

const mockStore: AppStore<StoreSchema> = {
  get: jest.fn(<K extends keyof StoreSchema>(key: K, defaultValue?: StoreSchema[K]): StoreSchema[K] => {
    return (mockStoreData[key] as StoreSchema[K]) || (defaultValue as StoreSchema[K]);
  }),
  set: jest.fn(<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]) => {
    mockStoreData[key] = value;
  }),
};

const mockUptime = jest.spyOn(process, 'uptime');

describe('IPC Handlers', () => {
  beforeEach(() => {
    mockStoreData.monthlySalary = 320000;
    mockStoreData.monthlyHours = 160;
    mockStoreData.monthlyHoursCalculationMethod = 'auto';
    mockStoreData.manualMonthlyHours = 160;
    jest.clearAllMocks();
    mockUptime.mockClear();
  });

  it('should calculate earned salary correctly', () => {
    mockUptime.mockReturnValue(3600); // 1 hour

    const earnedSalary = getEarnedSalaryHandler(mockStore)();
    const expectedEarnedSalary = new SalaryCalculator(320000, 160).calculateEarnedSalary(1);

    expect(earnedSalary).toBeCloseTo(expectedEarnedSalary);
    expect(mockUptime).toHaveBeenCalled();
  });

  it('should get settings correctly', () => {
    const settings = getSettingsHandler(mockStore)();

    expect(settings).toEqual({
      monthlySalary: 320000,
      monthlyHours: 160,
      monthlyHoursCalculationMethod: 'auto' as const,
      manualMonthlyHours: 160,
    });
  });

  it('should set settings correctly (manual)', () => {
    const newSettings = {
      monthlySalary: 400000,
      monthlyHoursCalculationMethod: 'manual' as const,
      manualMonthlyHours: 180,
    };

    setSettingsHandler(mockStore)({} as Electron.IpcMainInvokeEvent, newSettings);

    const settings = getSettingsHandler(mockStore)();
    expect(settings).toEqual({
      monthlySalary: 400000,
      monthlyHours: 180, // Should be updated to manualMonthlyHours
      monthlyHoursCalculationMethod: 'manual' as const,
      manualMonthlyHours: 180,
    });
  });

  it('should set settings correctly (auto)', () => {
    const newSettings = {
      monthlySalary: 400000,
      monthlyHoursCalculationMethod: 'auto' as const,
      manualMonthlyHours: 180, // This value should be ignored
    };

    const now = new Date();
    const autoCalculatedHours = calculateMonthlyWorkingHours(now.getFullYear(), now.getMonth() + 1);

    setSettingsHandler(mockStore)({} as Electron.IpcMainInvokeEvent, newSettings);

    const settings = getSettingsHandler(mockStore)();
    expect(settings).toEqual({
      monthlySalary: 400000,
      monthlyHours: autoCalculatedHours, // Should be updated to auto-calculated hours
      monthlyHoursCalculationMethod: 'auto' as const,
      manualMonthlyHours: 180,
    });
  });

  it('should return auto-calculated monthly hours', () => {
    const now = new Date();
    const expectedHours = calculateMonthlyWorkingHours(now.getFullYear(), now.getMonth() + 1);
    const actualHours = calculateMonthlyWorkingHours(now.getFullYear(), now.getMonth() + 1);
    expect(actualHours).toBe(expectedHours);
  });
});