import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron';
import path from 'path';
import Store from 'electron-store';
import iconPath from './assets/icon.png';
import { SalaryCalculator } from './lib/SalaryCalculator';
import { calculateMonthlyWorkingHours } from './lib/utils';

export interface AppStore<T> {
  get<K extends keyof T>(key: K): T[K] | undefined;
  get<K extends keyof T>(key: K, defaultValue: T[K]): T[K];
  set<K extends keyof T>(key: K, value: T[K]): void;
}


declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const SETTINGS_WINDOW_WEBPACK_ENTRY: string;

let tray: Tray | null = null;
let settingsWindow: BrowserWindow | null = null;

export interface StoreSchema {
  monthlySalary: number;
  monthlyHours: number;
  monthlyHoursCalculationMethod: 'auto' | 'manual';
  manualMonthlyHours: number;
}

const store = new Store<StoreSchema>({
  defaults: {
    monthlySalary: 320000,
    monthlyHours: 160,
    monthlyHoursCalculationMethod: 'auto',
    manualMonthlyHours: 160,
  },
});

export const getSettingsHandler = (store: AppStore<StoreSchema>) => () => {
  return {
    monthlySalary: store.get('monthlySalary'),
    monthlyHours: store.get('monthlyHours'),
    monthlyHoursCalculationMethod: store.get('monthlyHoursCalculationMethod'),
    manualMonthlyHours: store.get('manualMonthlyHours'),
  };
};

export const setSettingsHandler = (store: AppStore<StoreSchema>) => (event: Electron.IpcMainInvokeEvent, settings: {
  monthlySalary: number;
  monthlyHoursCalculationMethod: 'auto' | 'manual';
  manualMonthlyHours: number;
}) => {
  store.set('monthlySalary', settings.monthlySalary);
  store.set('monthlyHoursCalculationMethod', settings.monthlyHoursCalculationMethod);
  store.set('manualMonthlyHours', settings.manualMonthlyHours);

  // Update monthlyHours based on the selected method
  if (settings.monthlyHoursCalculationMethod === 'auto') {
    const now = new Date();
    const autoCalculatedHours = calculateMonthlyWorkingHours(now.getFullYear(), now.getMonth() + 1);
    store.set('monthlyHours', autoCalculatedHours);
  } else {
    store.set('monthlyHours', settings.manualMonthlyHours);
  }
};

export const getEarnedSalaryHandler = (store: AppStore<StoreSchema>) => () => {
  const monthlySalary = store.get('monthlySalary') as number;
  const monthlyHours = store.get('monthlyHours') as number;
  const calculator = new SalaryCalculator(monthlySalary, monthlyHours);
  const appUptimeSeconds = process.uptime();
  const appUptimeHours = appUptimeSeconds / 3600;
  return calculator.calculateEarnedSalary(appUptimeHours);
};

ipcMain.handle('get-settings', getSettingsHandler(store as any));
ipcMain.handle('set-settings', setSettingsHandler(store as any));
ipcMain.handle('get-earned-salary', getEarnedSalaryHandler(store as any));

ipcMain.handle('get-auto-calculated-monthly-hours', () => {
  const now = new Date();
  return calculateMonthlyWorkingHours(now.getFullYear(), now.getMonth() + 1);
});



const createSettingsWindow = (): void => {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 400,
    height: 300,
    title: 'Settings',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  settingsWindow.loadURL(SETTINGS_WINDOW_WEBPACK_ENTRY);

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
};

// Function to create a simple orange icon dynamically using Data URL
function createOrangeIcon(size = 20) {
  // A simple 1x1 pixel orange square as a data URL
  // This will be scaled up by the system to the appropriate size
  const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0AAAAABJRU5ErkJggg==';
  return dataUrl;
}

const createTray = () => {
  console.log('Creating tray...');
  const iconPath = path.join(__dirname, 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  icon.setTemplateImage(true);
  tray = new Tray(icon);
  console.log('Tray object created:', tray);
  console.log('Tray is destroyed:', tray.isDestroyed());

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Settings', click: createSettingsWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setToolTip('Salary Tracker');
  tray.setContextMenu(contextMenu);

  async function updateTrayTitle(currentStore: AppStore<StoreSchema>) {
    if (!tray) {
      return;
    }
    const monthlySalary = currentStore.get('monthlySalary') as number;
    const monthlyHours = currentStore.get('monthlyHours') as number;
    const calculator = new SalaryCalculator(monthlySalary, monthlyHours);
    const appUptimeSeconds = process.uptime();
    const appUptimeHours = appUptimeSeconds / 3600;
    const earnedSalaryValue = calculator.calculateEarnedSalary(appUptimeHours);
    tray.setTitle(`¥${earnedSalaryValue.toFixed(2)}`);
  }

  updateTrayTitle(store as any); // Initial update
  setInterval(() => updateTrayTitle(store as any), 1000); // Update every second

  console.log('Tray created.');
};

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  console.log('App is ready.');
  createTray();
  if (process.platform === 'darwin') {
    app.dock?.hide();
  }
});


