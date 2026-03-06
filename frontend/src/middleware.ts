import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Authentication is handled client-side via wallet connection.
// This middleware is a passthrough.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|sitemap.xml|robots.txt|.*\\.jpg|.*\\.png|.*\\.svg|.*\\.gif).*)",
  ],
};
