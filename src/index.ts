import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron';
import path from 'path';
import Store from 'electron-store';
import iconPath from './assets/icon.png';
import { SalaryCalculator } from './lib/SalaryCalculator';

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
}

const store = new Store<StoreSchema>({
  defaults: {
    monthlySalary: 320000,
    monthlyHours: 160,
  },
});

export const getSettingsHandler = (store: AppStore<StoreSchema>) => () => {
  return {
    monthlySalary: store.get('monthlySalary'),
    monthlyHours: store.get('monthlyHours'),
  };
};

export const setSettingsHandler = (store: AppStore<StoreSchema>) => (event: Electron.IpcMainInvokeEvent, settings: { monthlySalary: number; monthlyHours: number }) => {
  store.set('monthlySalary', settings.monthlySalary);
  store.set('monthlyHours', settings.monthlyHours);
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

app.on('ready', () => {
  console.log('App is ready.');
  createTray();
  if (process.platform === 'darwin') {
    app.dock?.hide();
  }
});


