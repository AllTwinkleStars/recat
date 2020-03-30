import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Viewer {
    id: ID
    token: String
    avatar: String
    hasWallet: Boolean
    didRequest: Boolean!
  }

  input LoginInput {
    code: String!
  }

  type Query {
    authUrl: String!
  }

  type Mutation {
    logIn(input: LoginInput): Viewer!
    logOut: Viewer!
  }
`;
