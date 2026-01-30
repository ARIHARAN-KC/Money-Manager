import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";


export interface JwtPayload {
  id: string;
  email: string;
}


export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
};
