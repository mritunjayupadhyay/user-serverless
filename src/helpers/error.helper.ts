import { DatabaseError } from 'src/interfaces/error.interface';

// Type guard to check if error is a database error
export const isDatabaseError = (error: unknown): error is DatabaseError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as DatabaseError).code === 'string'
  );
};
