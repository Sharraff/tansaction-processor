import { Request, Response } from "express";
import "../config/session"; // Load session type augmentation
import { User } from "../schema/user";
import bcrypt from "bcryptjs";




export class AuthController {

    // REGISTER
    static async register(req: Request, res: Response) {
        try {
            const {
                type,
                firstName,
                lastName,
                otherNames,
                tag,
                emailAddress,
                phoneNumber,
                password,
            } = req.body;

            // Check if email exists
            const userExists = await User.findOne({ emailAddress });
            if (userExists) {
                return res.status(400).json({ message: "Email already exists" });
            }

            const tagExists = await User.findOne({ tag });
            if (tagExists) {
                return res.status(400).json({ message: "Tag already exists" });
            }

            const user = new User({
                type,
                firstName,
                lastName,
                otherNames,
                tag,
                emailAddress,
                phoneNumber,
                password,
            });

            await user.save();

            return res.status(201).json({
                message: "Registration successful",
                user: {
                    id: user._id,
                    email: user.emailAddress,
                    tag: user.tag
                }
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }

    // LOGIN
    static async login(req: Request, res: Response) {
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
                    tag: user.tag
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
