import { validate } from 'class-validator';
import { faker } from '@faker-js/faker/.';

import { Match } from '../../src/decorators/match.decorator';

class TestClass {
  password: string;

  @Match('password')
  confirmPassword: string;
}

describe('Match Decorator', () => {
  it('should validate when passwords match', async () => {
    const demoPassword = faker.internet.password();
    const testInstance = new TestClass();
    testInstance.password = demoPassword;
    testInstance.confirmPassword = demoPassword;

    const errors = await validate(testInstance);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when passwords do not match', async () => {
    const testInstance = new TestClass();
    testInstance.password = faker.internet.password();
    testInstance.confirmPassword = faker.internet.password();

    const errors = await validate(testInstance);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.Match).toBe(
      'confirmPassword must match password',
    );
  });
});
