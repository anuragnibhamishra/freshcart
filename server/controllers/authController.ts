import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Generate JWT token
const generateToken = (id: string) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET as string,
        { expiresIn: "30d" }
    );
}

const getAdminStatus = (email: string | null | undefined): boolean => {
    if (!email) return false;

    const adminEmails = process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
        : [];

    return adminEmails.includes(email.toLowerCase());
}

export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please provide all fields" });
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (existingUser) {
        return res.status(400).json({
            message: "User already exists with this email"
        });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const user = await prisma.user.create({
        data: {
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        }
    });

    // Generate a token for the user
    const token = generateToken(user.id);
    const userData: any = {...user};
    delete userData.password; // Remove password from the response
    userData.isAdmin = getAdminStatus(user.email);

    res.status(201).json({
        user: userData,
        token
    });
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (!user) {
        return res.status(400).json({
            message: "Invalid credentials"
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({
            message: "Invalid credentials"
        })
    }

    // Generate a token for the user
    const token = generateToken(user.id);
    const userData: any = {...user};
    delete userData.password; // Remove password from the response
    userData.isAdmin = getAdminStatus(user.email);

    res.status(201).json({
        user: userData,
        token
    });
}