import jwt from "jsonwebtoken";
import { Response } from "express";
//this basically generated and set cookie and returned

const JWT_SECRET = process.env.JWT_SECRET || "just a secret";
const NODE_ENV = process.env.NODE_ENV;

//jwt= header . payload .signature
//as func to show details on hover
export default function (
  res: Response,
  payload: object //types bruh
): any {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, //on ms 7days
  });

  /**
     * return res.status(200).json({
        error: false,
        message,
        token,
        user: payload,
    }); //nah not ideal
   */
  return token;
}
