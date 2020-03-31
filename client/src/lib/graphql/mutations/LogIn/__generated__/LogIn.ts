/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LoginInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: LogIn
// ====================================================

export interface LogIn_logIn {
  __typename: "Viewer";
  id: string | null;
  token: string | null;
  avatar: string | null;
  hasWallet: boolean | null;
  didRequest: boolean;
}

export interface LogIn {
  logIn: LogIn_logIn;
}

export interface LogInVariables {
  input?: LoginInput | null;
}
