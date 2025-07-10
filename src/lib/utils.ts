export function calculateMonthlyWorkingHours(year: number, month: number): number {
  let workingDays = 0;
  const date = new Date(year, month - 1, 1); // month is 0-indexed in Date object

  while (date.getMonth() === month - 1) {
    const day = date.getDay();
    // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) {
      workingDays++;
    }
    date.setDate(date.getDate() + 1);
  }
  return workingDays * 8; // Assuming 8 hours per working day
}
