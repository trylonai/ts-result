# ts-result

[![npm version](https://img.shields.io/npm/v/@trylonai/ts-result)](https://npmjs.com/package/@trylonai/ts-result)

`ts-result` provides a TypeScript implementation of the `Result<T, E>` type, commonly found in languages like Rust. It offers a mechanism for functions to return and propagate errors explicitly, without relying on exceptions or ambiguous return values like `null` or `undefined`.

## Core Concept

A `Result<T, E>` is a discriminated union type representing one of two possibilities:

1.  **`Ok<T, E>`**: Represents success and contains a value of type `T`.
2.  **`Err<T, E>`**: Represents failure and contains an error value of type `E`.

This library provides the `Result<T, E>` type alias, the underlying `Ok` and `Err` classes (though direct use is typically via factory functions), and a set of methods to interact with these types in a type-safe manner.

Instances are created using the factory functions:

- `Ok(value: T)`: Creates a success result containing `value`.
- `Err(error: E)`: Creates an error result containing `error`.

## Motivation

Traditional error handling in JavaScript/TypeScript often uses:

- **Exceptions (`throw`/`try...catch`):** Implicitly alters control flow and requires callers to know _when_ to catch. Errors are not part of the function signature.
- **`null`/`undefined` returns:** Ambiguous; doesn't distinguish between a valid "not found" state and an actual error. Type checking doesn't enforce handling.

`Result` addresses this by making potential errors an explicit part of the function's return type (`() => Result<User, FetchError>`). This forces callers to acknowledge and handle potential failures, leveraging the TypeScript compiler for verification.

## Features

- **Explicit Error Handling:** Functions explicitly declare their potential failure modes via the `Result<T, E>` return type.
- **Type Safety:** Utilizes TypeScript's discriminated unions and type guards (`isOk`, `isErr`) for compile-time verification of error handling paths.
- **Method-Based Operations:** Provides methods for transforming (`map`, `mapErr`), chaining (`andThen`, `orElse`), and extracting values (`unwrapOr`, `unwrapOrElse`, `match`) without manual type checks in many cases.
- **Rust `Result` Parity:** Implements core methods found on Rust's `std::result::Result` (see API).

## Installation

```bash
npm install @trylonai/ts-result
# or
yarn add @trylonai/ts-result
# or
pnpm add @trylonai/ts-result
```

## Basic Usage

```ts
import { Ok, Err, Result } from 'ts-result';

// Function returning a Result
function divide(
  numerator: number,
  denominator: number
): Result<number, string> {
  if (denominator === 0) {
    return Err('Division by zero'); // Return an Err variant
  }
  return Ok(numerator / denominator); // Return an Ok variant
}

const result1 = divide(10, 2); // Ok(5)
const result2 = divide(5, 0); // Err("Division by zero")

// 1. Checking the variant using type guards
if (result1.isOk()) {
  // result1 is narrowed to Ok<number, string> here
  console.log('Result 1 is Ok:', result1.value); // Output: Result 1 is Ok: 5
}

if (result2.isErr()) {
  // result2 is narrowed to Err<number, string> here
  console.error('Result 2 is Err:', result2.error); // Output: Result 2 is Err: Division by zero
}

// 2. Handling both cases with match
const message = result1.match({
  Ok: (value) => `Success: ${value}`,
  Err: (error) => `Failure: ${error}`,
});
console.log(message); // Output: Success: 5

// 3. Extracting the value safely
const value1 = result1.unwrapOr(0); // Extracts 5 from Ok(5)
const value2 = result2.unwrapOr(0); // Returns default 0 because result2 is Err
console.log(value1, value2); // Output: 5 0

// 4. Chaining operations
function checkPositive(n: number): Result<number, string> {
  return n > 0 ? Ok(n) : Err('Number is not positive');
}

const positiveResult = divide(20, 4) // Ok(5)
  .andThen(checkPositive); // Calls checkPositive(5) -> Ok(5)

const nonPositiveResult = divide(-10, 2) // Ok(-5)
  .andThen(checkPositive); // Calls checkPositive(-5) -> Err("Number is not positive")

const errorResult = divide(10, 0) // Err("Division by zero")
  .andThen(checkPositive); // Does not call checkPositive, remains Err("Division by zero")

console.log(positiveResult); // Ok { value: 5 }
console.log(nonPositiveResult); // Err { error: 'Number is not positive' }
console.log(errorResult); // Err { error: 'Division by zero' }

// 5. Unwrapping (Use cautiously - throws on Err)
try {
  const unwrapped = result2.unwrap('Should have been Ok'); // Throws UnwrapError
} catch (e) {
  if (e instanceof UnwrapError) {
    console.error(e.message); // Output: Should have been Ok
    console.error(e.causeValue); // Output: Division by zero
  }
}
```

# API Overview

`Result<T, E>` provides methods for:

- **Checking:** `isOk()`, `isErr()` (act as type guards)
- **Extracting:** `unwrap()`, `unwrapErr()` (throw on incorrect variant), `unwrapOr()`, `unwrapOrElse()` (provide defaults)
- **Transforming:** `map()`, `mapErr()`, `mapOr()`, `mapOrElse()`
- **Chaining:** `andThen()`, `orElse()`
- **Boolean Logic:** `and()`, `or()`
- **Matching:** `match()`
