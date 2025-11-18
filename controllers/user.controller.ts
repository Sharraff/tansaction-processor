import type { Request, Response } from "express";
import { User } from "../schema/user.ts";

export class UserController {

    // Get all users
    static async getAllUsers(req: Request, res: Response) {
        try {
            const users = await User.find({ isDeleted: false }).select("-password"); // exclude password
            return res.json({ users });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error" });
        }
    }

    // Get user by ID
    static async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await User.findById(id).select("-password");

            if (!user || user.isDeleted) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.json({ user });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error" });
        }
    }
}
