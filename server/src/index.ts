import express from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./graphql"

const app = express();
const server = new ApolloServer({ typeDefs, resolvers });
const port = 9000;

server.applyMiddleware({ app, path: "/api" });

app.listen(port);

console.log(`[app]: http://localhost:${port}`);
