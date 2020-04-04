import merge from "lodash.merge";
import { userResolvers } from "./User";
import { viewerResolvers } from "./Viewer";

export const resolvers = merge(userResolvers, viewerResolvers);
