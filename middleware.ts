export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/flow-generator",
    "/calendar",
    "/social-accounts",
  ],
};
