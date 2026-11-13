/**
 * Everything a request needs. Services are added here in step 3,
 * so tests can pass in fakes or an in-memory database.
 */
export type Context = Record<string, never>;

export function createContext(): Context {
  return {};
}
