import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import config from "../config/config";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = <string>req.headers["auth"];
  let jwtPayLoad;

  try {
    jwtPayLoad = <any>jwt.verify(token, config.jwtSecret);
    res.locals.jwtPayLoad = jwtPayLoad;
  } catch (error) {
    return res.status(401).send({ message: "No autorizado" });
  }

  const { userId, username } = jwtPayLoad;
  const newToken = jwt.sign({ userId, username }, config.jwtSecret, {
    expiresIn: "1h",
  });
  res.setHeader("token", newToken);

  next();
};
