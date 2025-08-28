import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  // callbacks: {
  //   authorized: ({ token }) => !!token,
  // },
  // async middleware(req) {
  //   const token = req.nextauth.token;

  //   if (!token) {
  //     // 👇 Use full absolute URL
  //     const loginUrl = req.nextUrl.clone();
  //     loginUrl.pathname = "/login";
  //     loginUrl.searchParams.set("unauth", "true");

  //     return NextResponse.redirect(loginUrl);
  //   }

  //   return NextResponse.next();
  // },
})

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|login).*)"],
};
