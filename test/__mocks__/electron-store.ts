
import { StoreSchema } from '../../src/index';

export const mockStoreData = {
  monthlySalary: 320000,
  monthlyHours: 160,
  monthlyHoursCalculationMethod: 'auto',
  manualMonthlyHours: 160,
};

const storeMock = {
  get: jest.fn((key: keyof typeof mockStoreData) => mockStoreData[key]),
  set: jest.fn(<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]) => {
    mockStoreData[key] = value;
  }),
};

export default jest.fn().mockImplementation(() => storeMock);
