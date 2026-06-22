import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../types';

type ValidationType = 'body' | 'params' | 'query';

/**
 * Zod validation middleware factory
 * Usage: validate(MyZodSchema) or validate(MyZodSchema, 'params')
 */
export const validate = (schema: ZodSchema, type: ValidationType = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = type === 'body' ? req.body : type === 'params' ? req.params : req.query;
      const parsed = schema.parse(data);

      // Replace with parsed/sanitized data
      if (type === 'body') req.body = parsed;
      else if (type === 'params') req.params = parsed as any;
      else req.query = parsed as any;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        const errorList = (error as ZodError).issues || [];
        errorList.forEach((err: any) => {
          const path = (err.path || []).join('.') || '_';
          if (!errors[path]) errors[path] = [];
          errors[path].push(err.message);
        });

        // Build a user-friendly single message from the first error
        const firstMessage =
          errorList[0]?.message || 'Validation failed. Please check your input.';

        const response: ApiResponse = {
          success: false,
          message: firstMessage,
          errors,
        };
        res.status(422).json(response);
        return;
      }
      next(error);
    }
  };
};
