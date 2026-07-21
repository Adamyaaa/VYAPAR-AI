import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Mirrors FastAPI's automatic request-body validation: parses req.body
 * against the given schema, replaces req.body with the parsed/defaulted
 * result, or responds 422 with field-level errors on failure.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({ detail: result.error.issues });
    }
    req.body = result.data;
    next();
  };
}

/** Same as validateBody, but for req.query (e.g. pagination params). */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(422).json({ detail: result.error.issues });
    }
    req.pagination = result.data;
    next();
  };
}
