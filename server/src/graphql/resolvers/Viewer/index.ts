import { IResolvers } from "apollo-server-express";
import { Google } from "../../../lib/api";
import { Viewer, Database, User } from "../../../lib/types";
import { LogInArgs } from "./types";
import crypto from "crypto";

const logInViaGoogle = async (code: string, token: string, db: Database): Promise<User | undefined> => {
  const { user } = await Google.login(code);

  if (!user) {
    throw new Error("Google Login Error");
  }

  // Names / Photos / Emails Lists
  const userNamesList = user.names && user.names.length ? user.names : null;
  const userPhotosList = user.photos && user.photos.length ? user.photos : null;
  const userEmailsList = user.emailAddresses && user.emailAddresses.length ? user.emailAddresses : null;

  // Get required user details from Google OAuth
  const userName = userNamesList ? userNamesList[0].displayName : null;
  const userId = userNamesList && userNamesList[0].metadata && userNamesList[0].metadata.source
    ? userNamesList[0].metadata.source.id
    : null;
  const userAvatar = userPhotosList && userPhotosList[0].url ? userPhotosList[0].url : null;
  const userEmail = userEmailsList && userEmailsList[0].value ? userEmailsList[0].value : null;

  if (!userId || !userName || !userAvatar || !userEmail) {
    throw new Error("Google Login Error");
  }

  const updateRes = await db.users.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        name: userName,
        avatar: userAvatar,
        contact: userEmail,
        token: token
      }
    },
    { returnOriginal: false }
  );

  let viewer = updateRes.value;

  if (!viewer) {
    const insertRes = await db.users.insertOne({
      _id: userId,
      token: token,
      name: userName,
      avatar: userAvatar,
      contact: userEmail,
      income: 0,
      bookings: [],
      listings: []
    });

    viewer = insertRes.ops[0];
  }

  return viewer;
}

export const viewerResolvers: IResolvers = {
  Query: {
    authUrl: (): string => {
      try {
        return Google.authUrl;
      } catch (error) {
        throw new Error(`Failed to query Google Auth Url: ${error}`);
      }
    }
  },
  Mutation: {
    logIn: async (_root: undefined, { input }: LogInArgs, { db }: { db: Database }): Promise<Viewer> => {
      try {
        const code = input ? input.code : null;
        const token = crypto.randomBytes(16).toString("hex");

        const viewer: User | undefined = code
          ? await logInViaGoogle(code, token, db)
          : undefined;

        if (!viewer) {
          return { didRequest: true };
        }

        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true
        };
      } catch (error) {
        throw new Error(`Failed to login: ${error}`);
      }
    },
    logOut: (): Viewer => {
      try {
        // TODO: Implement logout via cookies.
        return { didRequest: true };
      } catch (error) {
        throw new Error(`Failed to logout: ${error}`);
      }
    }
  },
  Viewer: {
    id: (viewer: Viewer): string | undefined => {
      return viewer._id;
    },
    hasWallet: (viewer: Viewer): boolean | undefined => {
      return viewer.walletId ? true : undefined;
    }
  }
};
