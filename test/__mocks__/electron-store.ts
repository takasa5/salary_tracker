
export const mockStoreData = {
  monthlySalary: 320000,
  monthlyHours: 160,
};

const storeMock = {
  get: jest.fn((key: keyof typeof mockStoreData) => mockStoreData[key]),
  set: jest.fn((key: keyof typeof mockStoreData, value: any) => {
    mockStoreData[key] = value;
  }),
};

export default jest.fn().mockImplementation(() => storeMock);
