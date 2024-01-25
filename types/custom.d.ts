import "express-session";

declare module "express-session" {
  export interface SessionData {
    user?: { id: number, username: string }; // Adjust the type to match the shape of your user object
  }
}