import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { error } from "console";

import tokenGenerate from "../utils/jwtgenerate.utils.ts";

const prisma = new PrismaClient();

// adding I in last just incase to realize its interface
interface UserI {
  id: number;
  username: string;
  email: string;
  password: string;
  name?: string;
  birthday?: string;
}

//-------------------------------Signup controller-----------------------------

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
    return res.status(201).json({
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

//---------------------------------login Controller-----------------------------

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "Email or password invalid",
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser) {
      return res.status(400).json({
        error: true,
        message: "Invalid credentials! no user found !",
      });
    }

    const passOk: boolean = await bcrypt.compare(password, dbUser?.password!); //forcing that it isnt undefined

    if (!passOk) {
      return res.status(401).json({
        error: true,
        message: "Invalid credentials!password wrong!",
      });
    }

    //generating jwt cookies yea it suks
    /**
     * in ts
     * dbUSer={} | null so!
     */
    const { password: removepass, ...payload } = dbUser!; //bruh again forcing bro its not null
    const token = tokenGenerate(res, payload);

    return res.status(201).json({
      error: false,
      message: "Logged in sucsessfully!",
      user: payload,
      token,
    });
  } catch (error: any) {
    console.log("login controller error ");
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
