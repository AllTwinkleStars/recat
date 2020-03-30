import { google } from "googleapis";

const auth = new google.auth.OAuth2(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  `${process.env.PUBLIC_URL}/login`
);

const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile"
];

export const Google = {
  authUrl: auth.generateAuthUrl({
    access_type: "online",
    scope: scopes
  }),
  login: async (code: string) => {
    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);

    const { data } = await google.people({ version: "v1", auth }).people.get({
      resourceName: "people/me",
      personFields: "emailAddressess,names,photos"
    });

    return { user: data };
  }
}
