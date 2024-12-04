export class CustomError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
