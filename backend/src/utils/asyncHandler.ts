import { NextFunction, Request, Response } from "express";

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

const asyncHandler =
  (handler: AsyncRouteHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };

export default asyncHandler;

