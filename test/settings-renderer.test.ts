import { JSDOM } from 'jsdom';
import path from 'path';
import fs from 'fs';

// Mock electron's ipcRenderer
const mockIpcRenderer = {
  invoke: jest.fn(),
};

jest.mock('electron', () => ({
  ipcRenderer: mockIpcRenderer,
}));

describe('Settings Renderer', () => {
  let dom: JSDOM;
  let monthlySalaryInput: HTMLInputElement;
  let resolveGetSettings: (value: any) => void;

  beforeEach(async () => {
    // Load the HTML file
    const html = fs.readFileSync(path.resolve(__dirname, '../src/settings.html'), 'utf8');
    dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
    global.document = dom.window.document;
    global.window = dom.window as unknown as Window & typeof globalThis;

    // Reset mocks
    jest.clearAllMocks();

    // Create a promise that we can control for getSettings
    const getSettingsPromise = new Promise(resolve => {
      resolveGetSettings = resolve;
    });

    // Mock the window.api object that settings-renderer.ts expects
    Object.defineProperty(global.window, 'api', {
      value: {
        getSettings: () => mockIpcRenderer.invoke('get-settings'),
        setSettings: (settings: any) => mockIpcRenderer.invoke('set-settings', settings),
        getAutoCalculatedMonthlyHours: () => mockIpcRenderer.invoke('get-auto-calculated-monthly-hours'),
      },
      writable: true,
    });

    // Mock initial settings for ipcRenderer.invoke
    mockIpcRenderer.invoke.mockImplementation((channel: string) => {
      if (channel === 'get-settings') {
        return getSettingsPromise; // Return the controlled promise
      }
      return Promise.resolve();
    });

    // Load the settings-renderer.ts script
    jest.isolateModules(() => {
      require('../src/settings-renderer.ts');
    });

    // Resolve the promise to simulate getSettings completing
    resolveGetSettings({
      monthlySalary: 123456,
      monthlyHoursCalculationMethod: 'auto',
      manualMonthlyHours: 160,
    });

    // Wait for the loadSettings to complete (which calls getSettings)
    await getSettingsPromise;

    // Allow any microtasks (like event listeners being attached) to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    // Get the input element AFTER all scripts and async operations have completed
    monthlySalaryInput = document.getElementById('monthly-salary') as HTMLInputElement;
  });

  it('should initially set monthly salary input type to password', () => {
    expect(monthlySalaryInput).toBeDefined();
    expect(monthlySalaryInput.type).toBe('password');
    expect(monthlySalaryInput.value).toBe('123456'); // Value should still be set
  });

  it('should change monthly salary input type to number on focus', () => {
    monthlySalaryInput.focus();
    expect(monthlySalaryInput.type).toBe('number');
  });

  it('should change monthly salary input type back to password on blur', () => {
    monthlySalaryInput.focus();
    expect(monthlySalaryInput.type).toBe('number');

    monthlySalaryInput.blur();
    expect(monthlySalaryInput.type).toBe('password');
  });
});
