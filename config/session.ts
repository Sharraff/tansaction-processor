import session from "express-session";
import MongoStore from "connect-mongo";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export const sessionMiddleware = session({
  secret: "supersecret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
  mongoUrl: "mongodb://localhost:27017/tps",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
});