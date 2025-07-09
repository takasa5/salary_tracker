import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron';
import path from 'path';
import path from 'path';
import Store from 'electron-store';
import iconPath from './assets/icon.png';
import { SalaryCalculator } from './lib/SalaryCalculator';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const SETTINGS_WINDOW_WEBPACK_ENTRY: string;

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

const store = new Store({
  defaults: {
    monthlySalary: 320000,
    monthlyHours: 160,
  },
});

ipcMain.handle('get-settings', () => {
  return {
    monthlySalary: store.get('monthlySalary'),
    monthlyHours: store.get('monthlyHours'),
  };
});

ipcMain.handle('set-settings', (event, settings) => {
  store.set('monthlySalary', settings.monthlySalary);
  store.set('monthlyHours', settings.monthlyHours);
});

ipcMain.handle('get-earned-salary', () => {
  const monthlySalary = store.get('monthlySalary') as number;
  const monthlyHours = store.get('monthlyHours') as number;
  const calculator = new SalaryCalculator(monthlySalary, monthlyHours);
  const appUptimeSeconds = process.uptime();
  const appUptimeHours = appUptimeSeconds / 3600;
  return calculator.calculateEarnedSalary(appUptimeHours);
});

const createWindow = (): void => {
  console.log('Creating main window...');
  mainWindow = new BrowserWindow({
    width: 300,
    height: 200,
    show: true,
    frame: false,
    fullscreenable: false,
    resizable: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('blur', () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide();
    }
  });
  console.log('Main window created.');
};

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
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Settings', click: createSettingsWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setToolTip('Salary Tracker');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      const { x, y } = tray.getBounds();
      const { width, height } = mainWindow.getBounds();
      mainWindow.setPosition(x - width / 2 + tray.getBounds().width / 2, y + tray.getBounds().height);
      mainWindow.show();
    }
  });
  console.log('Tray created.');
};

app.on('ready', () => {
  console.log('App is ready.');
  createWindow();
  createTray();
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
