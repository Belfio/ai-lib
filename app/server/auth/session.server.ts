import { createCookieSessionStorage } from "@remix-run/node";
// export the whole sessionStorage object
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [
      process.env.AUTH_SECRET || "0mWNLv3hBacJZHjmlHa+egTlFo2l6PnRYo0FjpBHuaQ=",
    ],
    // secure: process.env.NODE_ENV === "production", // enable this in prod only
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
});

// you can also export the methods individually for your own usage
export const { getSession, commitSession, destroySession } = sessionStorage;
