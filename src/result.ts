/**
 * Represents a successful outcome containing a value.
 * @template T The type of the success value.
 */
export class OkImpl<T, E = never> {
  /** @internal */
  readonly _tag = 'Ok';
  /** @internal */
  readonly _T!: T; // Phantom type for T
  /** @internal */
  readonly _E!: E; // Phantom type for E

  /** The success value. */
  public readonly value: T;

  /**
   * Creates an instance of Ok.
   * @param value The success value.
   * @internal Use the Ok() function instead.
   */
  constructor(value: T) {
    this.value = value;
  }

  /**
   * Returns `true` if the result is `Ok`.
   */
  isOk(): this is Ok<T, E> {
    return true;
  }

  /**
   * Returns `false` if the result is `Ok`.
   */
  isErr(): this is Err<T, E> {
    return false;
  }

  /**
   * Maps a `Result<T, E>` to `Result<U, E>` by applying a function
   * to a contained `Ok` value, leaving an `Err` value untouched.
   * @template U The type of the value returned by the `mapper` function.
   * @param mapper The function to apply to the `Ok` value.
   * @returns A new `Result` with the mapped value if `Ok`, otherwise the original `Err`.
   */
  map<U>(mapper: (value: T) => U): Result<U, E> {
    return new OkImpl(mapper(this.value));
  }

  /**
   * Maps a `Result<T, E>` to `Result<T, F>` by applying a function
   * to a contained `Err` value, leaving an `Ok` value untouched.
   * This function can be used to pass through a successful result while handling an error.
   * @template F The type of the error returned by the `mapper` function.
   * @param _mapper The function to apply to the `Err` value (ignored in Ok).
   * @returns The original `Ok` result.
   */
  mapErr<F>(_mapper: (error: E) => F): Result<T, F> {
    // Type assertion is safe because this is Ok, E doesn't exist, F doesn't matter yet.
    return this as unknown as Result<T, F>;
  }

  /**
   * Returns the contained `Ok` value.
   * Throws an error if the result is `Err`.
   * @param msg Optional custom error message.
   * @returns The contained `Ok` value.
   * @throws {UnwrapError} If the result is `Err`.
   */
  unwrap(msg?: string): T {
    return this.value;
  }

  /**
   * Returns the contained `Err` value.
   * Throws an error if the result is `Ok`.
   * @param msg Optional custom error message.
   * @returns Never, always throws.
   * @throws {UnwrapError} Always, because the result is `Ok`.
   */
  unwrapErr(msg?: string): E {
    const message =
      msg ?? `Called unwrapErr on an Ok value: ${formatValue(this.value)}`;
    throw new UnwrapError(message, this.value);
  }

  /**
   * Returns the contained `Ok` value or a provided default.
   * @param defaultValue The default value to return if the result is `Err`.
   * @returns The contained `Ok` value or the `defaultValue`.
   */
  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  /**
   * Returns the contained `Ok` value or computes it from a closure.
   * @param op The function that computes the default value (ignored in Ok).
   * @returns The contained `Ok` value.
   */
  unwrapOrElse(_op: (error: E) => T): T {
    return this.value;
  }

  /**
   * Calls the provided function `op` with the contained `Ok` value and returns the result.
   * If the result is `Err`, returns the `Err` value untouched.
   * This is often used for chaining operations that return `Result`.
   * @template U The success type of the `Result` returned by `op`.
   * @param op The function to call with the `Ok` value.
   * @returns The `Result` returned by `op` or the original `Err`.
   */
  andThen<U>(op: (value: T) => Result<U, E>): Result<U, E> {
    return op(this.value);
  }

  /**
   * Calls the provided function `op` if the result is `Err`, otherwise returns the `Ok` value.
   * This function can be used for error recovery.
   * @template F The error type of the `Result` returned by `op`.
   * @param _op The function to call with the `Err` value (ignored in Ok).
   * @returns The original `Ok` result.
   */
  orElse<F>(_op: (error: E) => Result<T, F>): Result<T, F> {
    // Type assertion is safe because this is Ok, E doesn't exist, F doesn't matter yet.
    return this as unknown as Result<T, F>;
  }

  /**
   * Matches the `Result` and executes a handler based on whether it's `Ok` or `Err`.
   * @template R The return type of the match handlers.
   * @param matcher An object with `Ok` and `Err` handlers.
   * @returns The result of executing the appropriate handler.
   */
  match<R>(matcher: { Ok: (value: T) => R; Err: (error: E) => R }): R {
    return matcher.Ok(this.value);
  }
  /**
   * Returns the provided Result if this Result is Ok, otherwise returns the Err value of self.
   * This is equivalent to the `and` method in Rust.
   * @template U The value type of the provided Result.
   * @param res The Result to return if this Result is Ok.
   * @returns The provided Result if this Result is Ok, otherwise this Err.
   */
  and<U>(res: Result<U, E>): Result<U, E> {
    return res;
  }

  /**
   * Returns this Result if it is Ok, otherwise returns the provided Result.
   * This is equivalent to the `or` method in Rust.
   * @template F The error type of the provided Result.
   * @param _res The Result to return if this Result is Err (ignored for Ok).
   * @returns This Result if it is Ok, otherwise the provided Result.
   */
  or<F>(_res: Result<T, F>): Result<T, F> {
    // Type assertion is safe because this is Ok and E is not used in the return type
    return this as unknown as Result<T, F>;
  }

  /**
   * Maps a Result<T, E> to U by applying a function to the contained Ok value,
   * or returns the provided default value if this Result is Err.
   * @template U The return type of the mapper function and the function result.
   * @param _defaultValue The default value to return if this Result is Err (ignored for Ok).
   * @param mapper The function to apply to the Ok value.
   * @returns The result of applying mapper to the Ok value, or defaultValue if Err.
   */
  mapOr<U>(_defaultValue: U, mapper: (value: T) => U): U {
    return mapper(this.value);
  }

  /**
   * Maps a Result<T, E> to U by applying a function to the contained Ok value,
   * or applies a fallback function to the contained Err value.
   * @template U The return type of both the mapper and the fallback functions.
   * @param _defaultFn The function to call with the Err value (ignored for Ok).
   * @param mapper The function to apply to the Ok value.
   * @returns The result of applying mapper to the Ok value or defaultFn to the Err value.
   */
  mapOrElse<U>(_defaultFn: (error: E) => U, mapper: (value: T) => U): U {
    return mapper(this.value);
  }
}

/**
 * Represents a failure outcome containing an error.
 * @template E The type of the error value.
 */
export class ErrImpl<T = never, E = unknown> {
  /** @internal */
  readonly _tag = 'Err';
  /** @internal */
  readonly _T!: T; // Phantom type for T
  /** @internal */
  readonly _E!: E; // Phantom type for E

  /** The error value. */
  public readonly error: E;

  /**
   * Creates an instance of Err.
   * @param error The error value.
   * @internal Use the Err() function instead.
   */
  constructor(error: E) {
    this.error = error;
  }

  /**
   * Returns `false` if the result is `Err`.
   */
  isOk(): this is Ok<T, E> {
    return false;
  }

  /**
   * Returns `true` if the result is `Err`.
   */
  isErr(): this is Err<T, E> {
    return true;
  }

  /**
   * Maps a `Result<T, E>` to `Result<U, E>` by applying a function
   * to a contained `Ok` value, leaving an `Err` value untouched.
   * @template U The type of the value returned by the `mapper` function (ignored in Err).
   * @param _mapper The function to apply to the `Ok` value (ignored in Err).
   * @returns The original `Err` result.
   */
  map<U>(_mapper: (value: T) => U): Result<U, E> {
    // Type assertion is safe because this is Err, T doesn't exist, U doesn't matter yet.
    return this as unknown as Result<U, E>;
  }

  /**
   * Maps a `Result<T, E>` to `Result<T, F>` by applying a function
   * to a contained `Err` value, leaving an `Ok` value untouched.
   * @template F The type of the error returned by the `mapper` function.
   * @param mapper The function to apply to the `Err` value.
   * @returns A new `Err` with the mapped error.
   */
  mapErr<F>(mapper: (error: E) => F): Result<T, F> {
    return new ErrImpl(mapper(this.error));
  }

  /**
   * Returns the contained `Ok` value.
   * Throws an error because the result is `Err`.
   * @param msg Optional custom error message.
   * @returns Never, always throws.
   * @throws {UnwrapError} Always, because the result is `Err`.
   */
  unwrap(msg?: string): T {
    const message =
      msg ?? `Called unwrap on an Err value: ${formatValue(this.error)}`;
    throw new UnwrapError(message, this.error);
  }

  /**
   * Returns the contained `Err` value.
   * @param _msg Optional custom error message (ignored in Err).
   * @returns The contained `Err` value.
   */
  unwrapErr(_msg?: string): E {
    return this.error;
  }

  /**
   * Returns the contained `Ok` value or a provided default.
   * @param defaultValue The default value to return because the result is `Err`.
   * @returns The `defaultValue`.
   */
  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  /**
   * Returns the contained `Ok` value or computes it from a closure.
   * @param op The function that computes the default value using the `Err` value.
   * @returns The result of calling `op` with the contained `Err` value.
   */
  unwrapOrElse(op: (error: E) => T): T {
    return op(this.error);
  }

  /**
   * Calls the provided function `op` with the contained `Ok` value (ignored in Err).
   * Returns the `Err` value untouched.
   * @template U The success type of the `Result` returned by `op` (ignored in Err).
   * @param _op The function to call with the `Ok` value (ignored in Err).
   * @returns The original `Err` result.
   */
  andThen<U>(_op: (value: T) => Result<U, E>): Result<U, E> {
    // Type assertion is safe because this is Err, T doesn't exist, U doesn't matter yet.
    return this as unknown as Result<U, E>;
  }

  /**
   * Calls the provided function `op` with the `Err` value and returns the result.
   * This function can be used for error recovery.
   * @template F The error type of the `Result` returned by `op`.
   * @param op The function to call with the `Err` value.
   * @returns The `Result` returned by `op`.
   */
  orElse<F>(op: (error: E) => Result<T, F>): Result<T, F> {
    return op(this.error);
  }

  /**
   * Matches the `Result` and executes a handler based on whether it's `Ok` or `Err`.
   * @template R The return type of the match handlers.
   * @param matcher An object with `Ok` and `Err` handlers.
   * @returns The result of executing the appropriate handler.
   */
  match<R>(matcher: { Ok: (value: T) => R; Err: (error: E) => R }): R {
    return matcher.Err(this.error);
  }
  /**
   * Returns the Err value of self, ignoring the provided Result.
   * This is equivalent to the `and` method in Rust.
   * @template U The value type of the provided Result (ignored for Err).
   * @param _res The Result to return if this Result is Ok (ignored for Err).
   * @returns This Err, ignoring the provided Result.
   */
  and<U>(_res: Result<U, E>): Result<U, E> {
    // Type assertion is safe because we're keeping the error type E and changing the value type
    return this as unknown as Result<U, E>;
  }

  /**
   * Returns the provided Result if this Result is Err, otherwise returns self.
   * This is equivalent to the `or` method in Rust.
   * @template F The error type of the provided Result.
   * @param res The Result to return if this Result is Err.
   * @returns The provided Result if this Result is Err, otherwise self.
   */
  or<F>(res: Result<T, F>): Result<T, F> {
    return res;
  }

  /**
   * Maps a Result<T, E> to U by applying a function to the contained Ok value,
   * or returns the provided default value if this Result is Err.
   * @template U The return type.
   * @param defaultValue The default value to return if this Result is Err.
   * @param _mapper The function to apply to the Ok value (ignored for Err).
   * @returns The defaultValue.
   */
  mapOr<U>(defaultValue: U, _mapper: (value: T) => U): U {
    return defaultValue;
  }

  /**
   * Maps a Result<T, E> to U by applying a function to the contained Ok value,
   * or applies a fallback function to the contained Err value.
   * @template U The return type of both the mapper and the fallback functions.
   * @param defaultFn The function to call with the Err value.
   * @param _mapper The function to apply to the Ok value (ignored for Err).
   * @returns The result of applying defaultFn to the Err value.
   */
  mapOrElse<U>(defaultFn: (error: E) => U, _mapper: (value: T) => U): U {
    return defaultFn(this.error);
  }
}

/**
 * A type representing either success (`Ok`) containing a value of type `T`,
 * or failure (`Err`) containing an error value of type `E`.
 *
 * This is a discriminated union based on the `_tag` property, but users should
 * interact with it primarily through the provided methods like `isOk()`, `isErr()`,
 * `map()`, `unwrap()`, etc., or the `Ok()` and `Err()` factory functions.
 *
 * @template T The type of the success value.
 * @template E The type of the error value (defaults to `unknown`).
 */
export type Result<T, E = unknown> = Ok<T, E> | Err<T, E>;

/**
 * Represents a successful outcome containing a value.
 * Use the `Ok(value)` function to create instances.
 * @template T The type of the success value.
 * @template E The type of the error value (typically `never` for Ok).
 */
export type Ok<T, E = unknown> = OkImpl<T, E>;

/**
 * Represents a failure outcome containing an error.
 * Use the `Err(error)` function to create instances.
 * @template T The type of the success value (typically `never` for Err).
 * @template E The type of the error value.
 */
export type Err<T = never, E = unknown> = ErrImpl<T, E>;

/**
 * Creates a new `Ok` result containing the success value.
 * @template T The type of the success value.
 * @param value The success value.
 * @returns An `Ok` instance containing the value.
 * @example
 * const success = Ok(42);
 */
export function Ok<T>(value: T): Ok<T, never> {
  return new OkImpl(value);
}

/**
 * Creates a new `Err` result containing the error value.
 * @template E The type of the error value.
 * @param error The error value.
 * @returns An `Err` instance containing the error.
 * @example
 * const failure = Err("Something went wrong");
 */
export function Err<E>(error: E): Err<never, E> {
  return new ErrImpl(error);
}

/**
 * Custom error class for `unwrap` and `unwrapErr` failures.
 */
export class UnwrapError extends Error {
  /** The value or error that caused the unwrap failure. */
  public readonly causeValue: unknown;

  constructor(message: string, causeValue: unknown) {
    super(message);
    this.name = 'UnwrapError';
    this.causeValue = causeValue;
    // Maintains proper stack trace in V8 environments (Node, Chrome)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnwrapError);
    }
  }
}

// --- Utility ---

/** @internal Formats a value for inclusion in error messages */
function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null ||
    value === undefined
  ) {
    return String(value);
  }
  try {
    return JSON.stringify(value, null, 2); // Pretty print objects/arrays if possible
  } catch {
    return Object.prototype.toString.call(value); // Fallback for complex objects
  }
}
