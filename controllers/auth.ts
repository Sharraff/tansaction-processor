//import { Request, Response } from "express";
import express from 'express';
import type { Request, Response } from 'express';
import "../config/session.ts";
import { User } from "../schema/user.ts";
import bcrypt from "bcryptjs";




export class AuthController {

    static async register(req: Request, res: Response) { // register
        try {
            const {
                type,
                firstName,
                lastName,
                emailAddress,
                phoneNumber,
                password,
            } = req.body;

            // Check if email exists
            const userExists = await User.findOne({ emailAddress });
            if (userExists) {
                return res.status(400).json({ message: "Email already exists" });
            }

            // Auto-generate unique tag
            const baseTag = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;
            let uniqueTag = baseTag;
            let counter = 1;

            while (await User.findOne({ tag: uniqueTag })) {
                uniqueTag = `${baseTag}-${counter++}`;
            }

            // hash password
            const hashedPassword = await bcrypt.hash(password, 10);


            const user = new User({
                type,
                firstName,
                lastName,
                emailAddress,
                phoneNumber,
                password: hashedPassword,
                tag: uniqueTag
            });

            await user.save();

            return res.status(201).json({
                message: "Registration successful",
                user: {
                    id: user._id,
                    email: user.emailAddress,
                }
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }


    static async login(req: Request, res: Response) { // login
        try {
            const { emailAddress, password } = req.body;

            const user = await User.findOne({ emailAddress }).select("+password");

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!user.password) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            // Session login if using session store
            if (req.session) {
                req.session.userId = user._id.toString();
            }

            return res.json({
                message: "Login successful",
                user: {
                    id: user._id,
                    email: user.emailAddress,
                }
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }

    // LOGOUT
    static async logout(req: Request, res: Response) {
        try {
            if (!req.session) return res.status(400).json({ message: "No session active" });

            req.session.destroy(() => {
                res.json({ message: "Logout successful" });
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }
}
