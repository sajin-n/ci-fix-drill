const { formatCurrency } = require('./formatCurrency');

test('formats currency correctly', () => {
  // The function returns an object, so toEqual compares its properties instead of object identity.
  expect(formatCurrency(10.005, 'USD')).toEqual({ amount: 10.01, currency: 'USD' });
});
