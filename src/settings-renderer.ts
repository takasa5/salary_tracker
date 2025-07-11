import { ipcRenderer } from 'electron';
import './settings.css';

declare global {
  interface Window {
    api: {
      getSettings: () => Promise<{ monthlySalary: number; monthlyHoursCalculationMethod: 'auto' | 'manual'; manualMonthlyHours: number }>;
      setSettings: (settings: { monthlySalary: number; monthlyHoursCalculationMethod: 'auto' | 'manual'; manualMonthlyHours: number }) => Promise<void>;
      getAutoCalculatedMonthlyHours: () => Promise<number>;
    };
  }
}

const settingsForm = document.getElementById('settings-form') as HTMLFormElement;
const monthlySalaryInput = document.getElementById('monthly-salary') as HTMLInputElement;
const monthlyHoursAutoRadio = document.getElementById('monthly-hours-auto') as HTMLInputElement;
const monthlyHoursManualRadio = document.getElementById('monthly-hours-manual') as HTMLInputElement;
const manualMonthlyHoursInput = document.getElementById('manual-monthly-hours') as HTMLInputElement;

async function loadSettings() {
  const settings = await window.api.getSettings();
  monthlySalaryInput.value = settings.monthlySalary.toString();

  if (settings.monthlyHoursCalculationMethod === 'auto') {
    monthlyHoursAutoRadio.checked = true;
    manualMonthlyHoursInput.disabled = true;
  } else {
    monthlyHoursManualRadio.checked = true;
    manualMonthlyHoursInput.disabled = false;
    manualMonthlyHoursInput.value = settings.manualMonthlyHours.toString();
  }
}

function updateManualHoursInputState() {
  manualMonthlyHoursInput.disabled = monthlyHoursAutoRadio.checked;
}

monthlyHoursAutoRadio.addEventListener('change', updateManualHoursInputState);
monthlyHoursManualRadio.addEventListener('change', updateManualHoursInputState);

settingsForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const monthlySalary = parseInt(monthlySalaryInput.value, 10);
  const monthlyHoursCalculationMethod = monthlyHoursAutoRadio.checked ? 'auto' : 'manual';
  const manualMonthlyHours = parseInt(manualMonthlyHoursInput.value, 10);

  await window.api.setSettings({
    monthlySalary,
    monthlyHoursCalculationMethod,
    manualMonthlyHours,
  });
  alert('Settings saved!');
});

monthlySalaryInput.addEventListener('focus', () => {
  monthlySalaryInput.type = 'number';
});

monthlySalaryInput.addEventListener('blur', () => {
  monthlySalaryInput.type = 'password';
});

loadSettings();