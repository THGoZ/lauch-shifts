export class CustomError extends Error {
  public fields: FieldError[];
  public additionalData?: any;

  constructor(message: string, fields: FieldError[] = [], additionalData?: any) {
    super(message);
    this.name = 'CustomError';
    this.fields = fields;
    this.additionalData = additionalData;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      fields: this.fields,
      additionalData: this.additionalData,
    };
  }
}
