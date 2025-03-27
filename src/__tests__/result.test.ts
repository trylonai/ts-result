import { describe, it, expect, expectTypeOf } from 'vitest';
import { Ok, Err, type Result, UnwrapError } from '../result';

describe('Result<T, E>', () => {
  // --- Factory Functions ---
  describe('Ok', () => {
    it('should create an Ok instance', () => {
      const okVal = Ok(42);
      expect(okVal).toBeInstanceOf(Object);
      expect(okVal.isOk()).toBe(true);
      expect(okVal.isErr()).toBe(false);
      expect(okVal.unwrap()).toBe(42);
      expectTypeOf(okVal).toMatchTypeOf<Result<number, never>>();
    });

    it('should correctly type Ok with value', () => {
      const okVal = Ok('hello');
      expectTypeOf(okVal.value).toBeString();
      // The error type should be 'never' for an Ok created this way
      expectTypeOf(okVal).toMatchTypeOf<Result<string, never>>();
    });
  });

  describe('Err', () => {
    it('should create an Err instance', () => {
      const errVal = Err('Error message');
      expect(errVal).toBeInstanceOf(Object);
      expect(errVal.isOk()).toBe(false);
      expect(errVal.isErr()).toBe(true);
      expect(errVal.unwrapErr()).toBe('Error message');
      expectTypeOf(errVal).toMatchTypeOf<Result<never, string>>();
    });

    it('should correctly type Err with error', () => {
      const errVal = Err({ code: 500 });
      expectTypeOf(errVal.error).toEqualTypeOf<{ code: number }>();
      // The value type should be 'never' for an Err created this way
      expectTypeOf(errVal).toMatchTypeOf<Result<never, { code: number }>>();
    });
  });

  // --- Type Guards ---
  describe('isOk / isErr', () => {
    const okResult: Result<number, string> = Ok(100);
    const errResult: Result<number, string> = Err('fail');

    it('isOk should return true for Ok and narrow type', () => {
      expect(okResult.isOk()).toBe(true);
      if (okResult.isOk()) {
        expectTypeOf(okResult.value).toBeNumber();
        expect(okResult.value).toBe(100);
      } else {
        // Should not happen
        expect(true).toBe(false);
      }
    });

    it('isOk should return false for Err', () => {
      expect(errResult.isOk()).toBe(false);
    });

    it('isErr should return true for Err and narrow type', () => {
      expect(errResult.isErr()).toBe(true);
      if (errResult.isErr()) {
        expectTypeOf(errResult.error).toBeString();
        expect(errResult.error).toBe('fail');
      } else {
        // Should not happen
        expect(true).toBe(false);
      }
    });

    it('isErr should return false for Ok', () => {
      expect(okResult.isErr()).toBe(false);
    });
  });

  // --- Unwrap Methods ---
  describe('unwrap', () => {
    it('should return value for Ok', () => {
      expect(Ok('data').unwrap()).toBe('data');
    });

    it('should throw UnwrapError for Err', () => {
      const err = Err('boom');
      expect(() => err.unwrap()).toThrow(UnwrapError);
      expect(() => err.unwrap()).toThrow(
        'Called unwrap on an Err value: "boom"'
      );
      try {
        err.unwrap();
      } catch (e) {
        expect((e as UnwrapError).causeValue).toBe('boom');
      }
    });

    it('should throw with custom message for Err', () => {
      expect(() => Err('boom').unwrap('Custom message')).toThrow(UnwrapError);
      expect(() => Err('boom').unwrap('Custom message')).toThrow(
        'Custom message'
      );
    });
  });

  describe('unwrapErr', () => {
    it('should return error for Err', () => {
      expect(Err('error data').unwrapErr()).toBe('error data');
    });

    it('should throw UnwrapError for Ok', () => {
      const ok = Ok(123);
      expect(() => ok.unwrapErr()).toThrow(UnwrapError);
      expect(() => ok.unwrapErr()).toThrow(
        'Called unwrapErr on an Ok value: 123'
      );
      try {
        ok.unwrapErr();
      } catch (e) {
        expect((e as UnwrapError).causeValue).toBe(123);
      }
    });

    it('should throw with custom message for Ok', () => {
      expect(() => Ok(123).unwrapErr('Custom message')).toThrow(UnwrapError);
      expect(() => Ok(123).unwrapErr('Custom message')).toThrow(
        'Custom message'
      );
    });
  });

  describe('unwrapOr', () => {
    it('should return value for Ok', () => {
      expect(Ok(5).unwrapOr(10)).toBe(5);
    });

    it('should return default value for Err', () => {
      const err: Result<number, string> = Err('error');
      expect(err.unwrapOr(10)).toBe(10);
    });

    it('should require default value to match Ok type T', () => {
      const okVal = Ok(5);
      // okVal.unwrapOr('not a number'); // Compile error: Argument of type 'string' is not assignable to parameter of type 'number'.
      expectTypeOf(okVal.unwrapOr(10)).toBeNumber();

      const errVal: Result<number, string> = Err('error');
      // errVal.unwrapOr('not a number'); // Compile error
      expectTypeOf(errVal.unwrapOr(10)).toBeNumber();
    });
  });

  describe('unwrapOrElse', () => {
    it('should return value for Ok', () => {
      expect(Ok(5).unwrapOrElse(() => 10)).toBe(5);
    });

    it('should call op and return its result for Err', () => {
      const err: Result<number, string> = Err('error code 12');
      const result = err.unwrapOrElse((errorMsg) => errorMsg.length);
      expect(result).toBe(13);
      expectTypeOf(result).toBeNumber();
    });

    it('should require op return type to match Ok type T', () => {
      const errVal: Result<number, string> = Err('error');
      // errVal.unwrapOrElse((e) => 'not a number'); // Compile error: Type 'string' is not assignable to type 'number'.
      expectTypeOf(errVal.unwrapOrElse((e) => e.length)).toBeNumber();
    });
  });

  // --- Mapping Methods ---
  describe('map', () => {
    it('should apply mapper to Ok value', () => {
      const mapped = Ok(5).map((x) => x * 2);
      expect(mapped.isOk()).toBe(true);
      expect(mapped.unwrap()).toBe(10);
      expectTypeOf(mapped).toMatchTypeOf<Result<number, never>>();
    });

    it('should change the Ok type', () => {
      const mapped = Ok(5).map((x) => `Value: ${x}`);
      expect(mapped.isOk()).toBe(true);
      expect(mapped.unwrap()).toBe('Value: 5');
      expectTypeOf(mapped).toMatchTypeOf<Result<string, never>>();
    });

    it('should leave Err untouched', () => {
      const err: Result<number, string> = Err('initial error');
      const mapped = err.map((x) => x * 2);
      expect(mapped.isErr()).toBe(true);
      expect(mapped.unwrapErr()).toBe('initial error');
      // Type should be Result<number (new T), string (original E)>
      expectTypeOf(mapped).toMatchTypeOf<Result<number, string>>();
    });
  });

  describe('mapErr', () => {
    it('should apply mapper to Err value', () => {
      const err: Result<number, string> = Err('error msg');
      const mapped = err.mapErr((e) => ({ message: e }));
      expect(mapped.isErr()).toBe(true);
      expect(mapped.unwrapErr()).toEqual({ message: 'error msg' });
      expectTypeOf(mapped).toMatchTypeOf<Result<number, { message: string }>>();
    });

    it('should change the Err type', () => {
      const err: Result<number, string> = Err('500');
      const mapped = err.mapErr((e) => parseInt(e, 10));
      expect(mapped.isErr()).toBe(true);
      expect(mapped.unwrapErr()).toBe(500);
      expectTypeOf(mapped).toMatchTypeOf<Result<number, number>>();
    });

    it('should leave Ok untouched', () => {
      const ok: Result<number, string> = Ok(10);
      const mapped = ok.mapErr((e) => ({ message: e }));
      expect(mapped.isOk()).toBe(true);
      expect(mapped.unwrap()).toBe(10);
      // Type should be Result<number (original T), { message: string } (new F)>
      expectTypeOf(mapped).toMatchTypeOf<Result<number, { message: string }>>();
    });
  });

  // --- Chaining/Combining Methods ---
  describe('andThen', () => {
    const divide = (a: number, b: number): Result<number, string> => {
      if (b === 0) {
        return Err('Cannot divide by zero');
      }
      return Ok(a / b);
    };

    it('should chain operations for Ok', () => {
      const result = Ok(10).andThen((x) => divide(x, 2)); // 10 / 2 = 5
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(5);
      expectTypeOf(result).toMatchTypeOf<Result<number, string>>();
    });

    it('should return the first Err encountered', () => {
      const result = Ok(10).andThen((x) => divide(x, 0)); // Fails here
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe('Cannot divide by zero');
      expectTypeOf(result).toMatchTypeOf<Result<number, string>>();
    });

    it('should pass through Err without calling op', () => {
      const initialErr: Result<number, string> = Err('Initial failure');
      const result = initialErr.andThen((x) => divide(x, 2));
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe('Initial failure'); // Should be the original error
      expectTypeOf(result).toMatchTypeOf<Result<number, string>>();
    });

    it('should maintain the error type E', () => {
      const result = Ok(10).andThen((x) => divide(x, 2)); // Result<number, string>
      // result.andThen(x => Ok(`Num: ${x}`)); // Compile error: Type 'string' is not assignable to type 'number'. Err type mismatch
      const nextResult = result.andThen((x) => divide(x, 0)); // still Result<number, string>
      expectTypeOf(nextResult).toMatchTypeOf<Result<number, string>>();
    });
  });

  describe('orElse', () => {
    const tryParseInt = (s: string): Result<number, string> => {
      const val = parseInt(s, 10);
      return isNaN(val) ? Err(`Failed to parse: ${s}`) : Ok(val);
    };

    const getDefault = (): Result<number, { code: number }> => {
      return Err({ code: -1 }); // Different error type F
    };

    it('should return original Ok', () => {
      const ok: Result<string, string> = Ok('123');
      const result = ok.orElse(getDefault);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe('123'); // Should still be string T
      // Error type F from orElse is incorporated
      expectTypeOf(result).toMatchTypeOf<Result<string, { code: number }>>();
    });

    it('should call op for Err and return its result', () => {
      const err: Result<string, string> = Err('NaN');
      const result = err.orElse(getDefault); // Returns Err({ code: -1 })
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toEqual({ code: -1 });
      // T comes from original, F from orElse op
      expectTypeOf(result).toMatchTypeOf<Result<string, { code: number }>>();
    });

    it('can recover from an error', () => {
      const err: Result<number, string> = Err('parse fail');
      const result = err.orElse((e) => Ok(0)); // Recover with Ok(0)
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(0);
      // Error type F is 'never' from Ok(0)
      expectTypeOf(result).toMatchTypeOf<Result<number, never>>();
    });

    it('should use the error value in the fallback function', () => {
      const err: Result<number, string> = Err('Specific Error');
      const result = err.orElse((e) => Err(`Fallback triggered by: ${e}`));
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe('Fallback triggered by: Specific Error');
      // Type T remains number, F becomes string
      expectTypeOf(result).toMatchTypeOf<Result<number, string>>();
    });
  });

  // --- Match ---
  describe('match', () => {
    const ok: Result<number, string> = Ok(10);
    const err: Result<number, string> = Err('error occurred');

    it('should call Ok handler for Ok result', () => {
      const result = ok.match({
        Ok: (value) => `Success: ${value}`,
        Err: (error) => `Failure: ${error}`,
      });
      expect(result).toBe('Success: 10');
      expectTypeOf(result).toBeString();
    });

    it('should call Err handler for Err result', () => {
      const result = err.match({
        Ok: (value) => `Success: ${value}`,
        Err: (error) => `Failure: ${error}`,
      });
      expect(result).toBe('Failure: error occurred');
      expectTypeOf(result).toBeString();
    });

    it('should infer the return type correctly', () => {
      const result = ok.match({
        Ok: (value) => value > 5, // returns boolean
        Err: (_error) => false, // returns boolean
      });
      expect(result).toBe(true);
      expectTypeOf(result).toBeBoolean();
    });

    it('should handle different return types in handlers if common supertype exists', () => {
      // Example: returning specific object shapes
      type SuccessResponse = { status: 'ok'; data: number };
      type ErrorResponse = { status: 'error'; message: string };

      const result = err.match({
        Ok: (value): SuccessResponse => ({ status: 'ok', data: value }),
        Err: (error): ErrorResponse => ({ status: 'error', message: error }),
      });

      // The inferred type is the union of the handler return types
      expectTypeOf(result).toMatchTypeOf<SuccessResponse | ErrorResponse>();

      if (result.status === 'ok') {
        expectTypeOf(result.data).toBeNumber();
      } else {
        expectTypeOf(result.message).toBeString();
        expect(result.message).toBe('error occurred');
      }
    });
  });
  // --- Boolean Operators ---
  describe('and', () => {
    it('should return the second result if first is Ok', () => {
      const first: Result<number, string> = Ok(5);
      const second: Result<string, string> = Ok('value');
      const result = first.and(second);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe('value');
      expectTypeOf(result).toMatchTypeOf<Result<string, string>>();
    });

    it('should return the first error if first is Err', () => {
      const first: Result<number, string> = Err('error1');
      const second: Result<string, string> = Ok('value');
      const result = first.and(second);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe('error1');
      expectTypeOf(result).toMatchTypeOf<Result<string, string>>();
    });

    it('should work with different result types', () => {
      const numResult: Result<number, string> = Ok(10);
      const boolResult: Result<boolean, string> = Ok(true);
      const result = numResult.and(boolResult);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(true);
      expectTypeOf(result).toMatchTypeOf<Result<boolean, string>>();
    });
  });

  describe('or', () => {
    it('should return the first result if it is Ok', () => {
      const first: Result<number, string> = Ok(5);
      const second: Result<number, number> = Ok(10);
      const result = first.or(second);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(5);
      expectTypeOf(result).toMatchTypeOf<Result<number, number>>();
    });

    it('should return the second result if first is Err', () => {
      const first: Result<number, string> = Err('error');
      const second: Result<number, number> = Ok(10);
      const result = first.or(second);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(10);
      expectTypeOf(result).toMatchTypeOf<Result<number, number>>();
    });

    it('should return the second Err if both are Err', () => {
      const first: Result<number, string> = Err('error1');
      const second: Result<number, number> = Err(404);
      const result = first.or(second);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe(404);
      expectTypeOf(result).toMatchTypeOf<Result<number, number>>();
    });
  });

  describe('mapOr', () => {
    it('should apply mapper to Ok value', () => {
      const ok: Result<number, string> = Ok(5);
      const result = ok.mapOr('default', (x) => `Value: ${x}`);
      expect(result).toBe('Value: 5');
      expectTypeOf(result).toBeString();
    });

    it('should return default value for Err', () => {
      const err: Result<number, string> = Err('error');
      const result = err.mapOr('default', (x) => `Value: ${x}`);
      expect(result).toBe('default');
      expectTypeOf(result).toBeString();
    });
  });

  describe('mapOrElse', () => {
    it('should apply mapper to Ok value', () => {
      const ok: Result<number, string> = Ok(5);
      const result = ok.mapOrElse(
        (e) => `Error: ${e}`,
        (x) => `Value: ${x}`
      );
      expect(result).toBe('Value: 5');
      expectTypeOf(result).toBeString();
    });

    it('should apply fallback function to Err value', () => {
      const err: Result<number, string> = Err('oops');
      const result = err.mapOrElse(
        (e) => `Error: ${e}`,
        (x) => `Value: ${x}`
      );
      expect(result).toBe('Error: oops');
      expectTypeOf(result).toBeString();
    });
  });
});
