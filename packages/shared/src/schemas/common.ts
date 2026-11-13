import { z } from "zod";

/** A calendar date as `YYYY-MM-DD`. */
export const isoDateSchema = z.iso.date();

/** A point in time as an ISO 8601 string (e.g. `2026-11-12T15:04:05.000Z`). */
export const isoDateTimeSchema = z.iso.datetime({ offset: true });

/** Dollars, never negative. Round with `roundMoney` before saving. */
export const moneySchema = z.number().nonnegative().finite();

export const idSchema = z.number().int().positive();
