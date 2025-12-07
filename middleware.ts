// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This middleware runs before every route
export function middleware(request: NextRequest) {
  // For now, we're handling auth client-side with Firebase
  // But you can add additional logic here if needed
  
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};