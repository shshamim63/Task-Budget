import { validate } from 'class-validator';
import { Match } from '../../src/decorators/match.decorator';

class TestClass {
  password: string;

  @Match('password')
  confirmPassword: string;
}

describe('Match Decorator', () => {
  it('should validate when passwords match', async () => {
    const testInstance = new TestClass();
    testInstance.password = 'securePassword';
    testInstance.confirmPassword = 'securePassword';

    const errors = await validate(testInstance);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when passwords do not match', async () => {
    const testInstance = new TestClass();
    testInstance.password = 'securePassword';
    testInstance.confirmPassword = 'differentPassword';

    const errors = await validate(testInstance);
    console.log(errors);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.matches).toBe(
      'confirmPassword must match password',
    );
  });
});
