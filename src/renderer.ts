declare global {
  interface Window {
    api: {
      getSettings: () => Promise<{ monthlySalary: number; monthlyHours: number }>;
      setSettings: (settings: { monthlySalary: number; monthlyHours: number }) => Promise<void>;
      getEarnedSalary: () => Promise<number>;
    };
  }
}

const earnedSalaryElement = document.getElementById('earned-salary');
const settingsForm = document.getElementById('settings-form') as HTMLFormElement;
const monthlySalaryInput = document.getElementById('monthly-salary') as HTMLInputElement;
const monthlyHoursInput = document.getElementById('monthly-hours') as HTMLInputElement;

async function loadSettings() {
  const settings = await window.api.getSettings();
  monthlySalaryInput.value = settings.monthlySalary.toString();
  monthlyHoursInput.value = settings.monthlyHours.toString();
}

settingsForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const monthlySalary = parseInt(monthlySalaryInput.value, 10);
  const monthlyHours = parseInt(monthlyHoursInput.value, 10);
  await window.api.setSettings({ monthlySalary, monthlyHours });
  alert('Settings saved!');
});

async function updateEarnedSalary() {
  const earnedSalary = await window.api.getEarnedSalary();
  earnedSalaryElement.textContent = `Earned: ${earnedSalary.toFixed(2)} JPY`;
}

loadSettings();
setInterval(updateEarnedSalary, 1000);