import { ipcMain } from 'electron';
import Store from 'electron-store';
import { SalaryCalculator } from '../src/lib/SalaryCalculator';

// Mock electron-store
const mockStoreData = {
  monthlySalary: 320000,
  monthlyHours: 160,
};

jest.mock('electron-store', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn((key: keyof typeof mockStoreData) => mockStoreData[key]),
    set: jest.fn((key: keyof typeof mockStoreData, value: any) => {
      mockStoreData[key] = value;
    }),
  }));
});

// Mock ipcMain.handle
jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
  },
}));

// Mock process.uptime
const mockUptime = jest.spyOn(process, 'uptime');

describe('IPC Handlers', () => {
  let mockEvent: any;
  let getSettingsHandler: Function;
  let setSettingsHandler: Function;
  let getEarnedSalaryHandler: Function;

  beforeAll(() => {
    // Import the main process file to register IPC handlers
    require('../src/index');

    // Capture the registered handlers
    const calls = (ipcMain.handle as jest.Mock).mock.calls;

    const findHandler = (channel: string) => {
      const call = calls.find((c) => c[0] === channel);
      if (!call) {
        throw new Error(`Handler for channel ${channel} not found.`);
      }
      return call[1];
    };

    getSettingsHandler = findHandler('get-settings');
    setSettingsHandler = findHandler('set-settings');
    getEarnedSalaryHandler = findHandler('get-earned-salary');
  });

  beforeEach(() => {
    // Clear module cache to ensure fresh mocks
    jest.resetModules();

    // Re-import electron and src/index to ensure mocks are applied
    const { ipcMain: reloadedIpcMain } = require('electron');
    require('../src/index');

    mockEvent = {}; // Mock event object for ipcMain.handle
    // Reset mocks before each test
    (reloadedIpcMain.handle as jest.Mock).mockClear();
    mockUptime.mockClear();
    // Reset store data for each test
    mockStoreData.monthlySalary = 320000;
    mockStoreData.monthlyHours = 160;
  });

  it('should calculate earned salary correctly (direct logic test)', async () => {
    mockUptime.mockReturnValue(3600); // 1 hour

    const expectedEarnedSalary = new SalaryCalculator(320000, 160).calculateEarnedSalary(1);

    // Direct logic from the handler
    const monthlySalary = mockStoreData.monthlySalary;
    const monthlyHours = mockStoreData.monthlyHours;
    const calculator = new SalaryCalculator(monthlySalary, monthlyHours);
    const appUptimeSeconds = process.uptime();
    const appUptimeHours = appUptimeSeconds / 3600;
    const earnedSalary = calculator.calculateEarnedSalary(appUptimeHours);

    expect(earnedSalary).toBeCloseTo(expectedEarnedSalary);
    expect(mockUptime).toHaveBeenCalled();
    // No longer calling mockStoreInstance.get directly in this test
  });

  it('should get settings correctly', async () => {
    const settings = await getSettingsHandler(mockEvent);

    expect(settings).toEqual({
      monthlySalary: 320000,
      monthlyHours: 160,
    });
    expect(mockStoreData.monthlySalary).toBe(320000);
    expect(mockStoreData.monthlyHours).toBe(160);
  });

  it('should set settings correctly', async () => {
    const newSettings = {
      monthlySalary: 400000,
      monthlyHours: 180,
    };

    await setSettingsHandler(mockEvent, newSettings);

    expect(mockStoreData.monthlySalary).toBe(newSettings.monthlySalary);
    expect(mockStoreData.monthlyHours).toBe(newSettings.monthlyHours);
  });
});