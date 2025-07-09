import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings: { monthlySalary: number; monthlyHours: number }) =>
    ipcRenderer.invoke('set-settings', settings),
  getEarnedSalary: () => ipcRenderer.invoke('get-earned-salary'),
});