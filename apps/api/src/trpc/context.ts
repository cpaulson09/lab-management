import type { Services } from "../container";

/** Everything a request needs: the services. Tests build it from an in-memory database. */
export type Context = {
  services: Services;
};

export function createContext(services: Services): Context {
  return { services };
}
