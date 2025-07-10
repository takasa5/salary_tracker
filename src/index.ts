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

  async function updateTrayTitle() {
    const monthlySalary = store.get('monthlySalary') as number;
    const monthlyHours = store.get('monthlyHours') as number;
    const calculator = new SalaryCalculator(monthlySalary, monthlyHours);
    const appUptimeSeconds = process.uptime();
    const appUptimeHours = appUptimeSeconds / 3600;
    const earnedSalaryValue = calculator.calculateEarnedSalary(appUptimeHours);
    tray.setTitle(`¥${earnedSalaryValue.toFixed(2)}`);
  }

  updateTrayTitle(); // Initial update
  setInterval(updateTrayTitle, 1000); // Update every second

  console.log('Tray created.');
};

app.on('ready', () => {
  console.log('App is ready.');
  createTray();
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
});


