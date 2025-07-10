import { calculateMonthlyWorkingHours } from '../../src/lib/utils';

describe('calculateMonthlyWorkingHours', () => {
  it('should calculate working hours for January 2025 correctly', () => {
    // January 2025 has 22 working days (excluding weekends)
    // 22 * 8 = 176 hours
    expect(calculateMonthlyWorkingHours(2025, 1)).toBe(184);
  });

  it('should calculate working hours for February 2024 (leap year) correctly', () => {
    // February 2024 has 21 working days (excluding weekends)
    // 21 * 8 = 168 hours
    expect(calculateMonthlyWorkingHours(2024, 2)).toBe(168);
  });

  it('should calculate working hours for February 2025 (non-leap year) correctly', () => {
    // February 2025 has 20 working days (excluding weekends)
    // 20 * 8 = 160 hours
    expect(calculateMonthlyWorkingHours(2025, 2)).toBe(160);
  });

  it('should calculate working hours for March 2025 correctly', () => {
    // March 2025 has 21 working days (excluding weekends)
    // 21 * 8 = 168 hours
    expect(calculateMonthlyWorkingHours(2025, 3)).toBe(168);
  });

  it('should calculate working hours for April 2025 correctly', () => {
    // April 2025 has 22 working days (excluding weekends)
    // 22 * 8 = 176 hours
    expect(calculateMonthlyWorkingHours(2025, 4)).toBe(176);
  });

  it('should calculate working hours for December 2024 correctly', () => {
    // December 2024 has 22 working days (excluding weekends)
    // 22 * 8 = 176 hours
    expect(calculateMonthlyWorkingHours(2024, 12)).toBe(176);
  });
});
