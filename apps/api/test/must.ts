/** Returns the value, or fails the test if it is missing. */
export function must<T>(value: T | undefined | null): T {
  if (value === undefined || value === null) {
    throw new Error("Expected a value");
  }
  return value;
}
