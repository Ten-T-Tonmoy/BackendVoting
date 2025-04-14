import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Jwt } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { error } from "console";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "just a secret";

// adding I in last just incase to realize its interface
interface UserI {
  id: number;
  username: string;
  email: string;
  password: string;
  name?: string;
  birthday?: string;
}

export const signupController = async (req: Request, res: Response) => {
  const { username, email, name, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({
        error: true,
        message: "Credentials not given properly!",
      });
    }
    //findunique searching by unique identifiers

    //duplicate email and username checking
    const emailExisting = await prisma.user.findUnique({
      where: { email },
    });
    if (emailExisting) {
      return res.status(400).json({
        error: true,
        message: "Email is already used!!",
      });
    }

    const usernameExisting = await prisma.user.findUnique({
      where: { username },
    });

    if (usernameExisting) {
      return res.status(400).json({
        error: true,
        message: "username is already taken!!",
      });
    }

    // password hashing using bcrypt no need for jwt now

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPass,
        name,
      },
    });

    const { password: throwingPass, ...safeData } = newUser;

    //setting password="*********"  doesnt feel safe
    res.status(201).json({
      error: false,
      message: "Success singing up!",
      user: safeData,
    });
  } catch (error: any) {
    console.log("signup controller error ");
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
