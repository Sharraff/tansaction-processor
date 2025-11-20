import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

export const generateAccessToken = (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, {
        expiresIn: "24h"
    });
};

export const generateRefreshToken = (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: "7d"
    });
};
