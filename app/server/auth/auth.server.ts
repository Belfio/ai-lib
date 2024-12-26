import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
// import { sessionStorage } from "./session.server";
import { User } from "@/lib/types";
import { login, register } from "./login.server";
import { isEmail, isPassword } from "@/lib/utils";
import { commitSession, getSession } from "./session.server";
import { redirect } from "@remix-run/node";

export const authenticator = new Authenticator<User | null | undefined>();
// sessionStorage

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }: { form: FormData }) => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    console.log("logging in", email, password);

    if (!isEmail(email)) {
      throw new Error("Invalid email");
    }
    if (!isPassword(password)) {
      throw new Error("Invalid password");
    }

    const user = await login(email, password);
    console.log("Logged");
    // the type of this user must match the type you pass to the Authenticator
    // the strategy will automatically inherit the type if you instantiate
    // directly inside the `use` method
    return user;
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "login"
);

authenticator.use(
  new FormStrategy(async ({ form }: { form: FormData }) => {
    console.log("registering");
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const company = form.get("company") as string;
    const isRegistering = JSON.parse(form.get("register") as string);
    console.log("registering", email, password, company, isRegistering);
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof company !== "string"
    ) {
      throw new Error("Invalid form data");
    }
    if (!isEmail(email)) {
      throw new Error("Invalid email");
    }
    if (!isPassword(password)) {
      throw new Error("Invalid password");
    }
    console.log("Registering", isRegistering);
    if (isRegistering) {
      try {
        await register({ email, password, companyName: company });
      } catch (e) {
        console.log("Error registering", e);
        throw e;
      }
    }
    console.log("logging in aaa");
    const user = await login(email, password);
    console.log("Logged");
    // the type of this user must match the type you pass to the Authenticator
    // the strategy will automatically inherit the type if you instantiate
    // directly inside the `use` method
    return user;
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "register"
);

export async function loginAction(
  request: Request,
  returnTo?: string
): Promise<User | null> {
  console.log("authenticating");
  const user = await authenticator.authenticate("login", request);
  console.log("user", user);
  const session = await getSession(request.headers.get("cookie"));
  if (user) {
    session.set("user", user);
    return user;
  }
  if (returnTo) session.set("returnTo", returnTo);
  throw redirect(`/login?${new URLSearchParams({ error: "nouser" })}`, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export async function logoutAction(request: Request) {
  const session = await getSession(request.headers.get("cookie"));
  session.set("user", null);
  console.log("logging out");
  return redirect("/login", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export async function isAuthenticated(
  request: Request,
  returnTo?: string
): Promise<User | null> {
  console.log("checking the session");
  const session = await getSession(request.headers.get("cookie"));
  const user = session.get("user");
  if (user) return user;
  if (returnTo) session.set("returnTo", returnTo);
  return null;
}
