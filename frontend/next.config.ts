import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "358103b8-58fe-4932-8dc2-416dc408e1ad",
  loginUrl: "/",
  logoutUrl: "/",
  exclude: ["/", "/login", "/docs", "/faq", "/privacy", "/terms", "/test"],
});

export default withCivicAuth(nextConfig);