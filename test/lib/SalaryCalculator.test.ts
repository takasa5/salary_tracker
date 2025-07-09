import { SalaryCalculator } from '../../src/lib/SalaryCalculator';

describe('SalaryCalculator', () => {
  describe('正常系', () => {
    it('月給320,000円、月間労働時間160時間の場合、時給が2,000円になること', () => {
      const calculator = new SalaryCalculator(320000, 160);
      expect(calculator.hourlyRate).toBe(2000);
    });

    it('時給2,000円のとき、2時間働いたら稼いだ給料が4,000円になること', () => {
      const calculator = new SalaryCalculator(320000, 160);
      expect(calculator.calculateEarnedSalary(2)).toBe(4000);
    });
  });

  describe('異常系', () => {
    it('月間労働時間に0を指定した場合、エラーがスローされること', () => {
      expect(() => new SalaryCalculator(320000, 0)).toThrow('Monthly hours must be a positive number.');
    });

    it('月間労働時間に負の値を指定した場合、エラーがスローされること', () => {
      expect(() => new SalaryCalculator(320000, -10)).toThrow('Monthly hours must be a positive number.');
    });
  });
});
