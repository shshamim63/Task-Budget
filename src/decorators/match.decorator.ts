import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

export function Match(property: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {
    const {
      constraints: [property],
    } = validationArguments;

    const propertyValue = validationArguments.object[property];

    return value === propertyValue;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    const {
      constraints: [property],
    } = validationArguments;

    return `${validationArguments.property} must match ${property}`;
  }
}
