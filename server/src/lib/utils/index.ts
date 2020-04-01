import { Request } from "express";
import { Database, User } from "../types";

export const authorize = async (db: Database, req: Request): Promise<User | null> => {
  const viewer = await db.users.findOne({
    _id: req.signedCookies.viewer,
    token: req.get("X-CSRF-TOKEN")
  });

  return viewer;
}
