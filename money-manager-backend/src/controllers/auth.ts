import { Request, Response } from "express";
import User from "../models/user";
import { signToken } from "../utils/jwt";


// Register logic
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailNormalized = email.toLowerCase().trim();

    const exists = await User.findOne({ email: emailNormalized });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email: emailNormalized,
      password,
    });

    const token = signToken({ id: user._id.toString(), email: user.email });

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Registration failed" });
  }
};


// Login logic
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailNormalized = email.toLowerCase().trim();

    // Fetch user including password (since select: false in schema)
    const user = await User.findOne({ email: emailNormalized }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({ id: user._id.toString(), email: user.email });

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Login failed" });
  }
};
