export class SalaryCalculator {
  private monthlySalary: number;
  private monthlyHours: number;

  constructor(monthlySalary: number, monthlyHours: number) {
    if (monthlyHours <= 0) {
      throw new Error('Monthly hours must be a positive number.');
    }
    this.monthlySalary = monthlySalary;
    this.monthlyHours = monthlyHours;
  }

  get hourlyRate(): number {
    return this.monthlySalary / this.monthlyHours;
  }

  calculateEarnedSalary(hoursWorked: number): number {
    return this.hourlyRate * hoursWorked;
  }
}
