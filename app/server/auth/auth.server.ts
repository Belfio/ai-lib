import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "./session.server";
import { UserType } from "@/lib/types";
import { login, register } from "./login.server";
import { isEmail, isPassword } from "@/lib/utils";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<UserType | null | undefined>(
  sessionStorage
);

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }: { form: FormData }) => {
    const email = form.get("email");
    const password = form.get("password");
    const company = form.get("company");
    const isRegistering = JSON.parse(form.get("register") as string);
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof company !== "string"
    ) {
      return;
    }
    if (!isEmail(email)) {
      return;
    }
    if (!isPassword(password)) {
      return;
    }
    console.log("Registering", isRegistering);
    if (isRegistering) {
      try {
        await register({ email, password, company });
      } catch (e) {
        console.log("Error registering", e);
        throw e;
      }
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
  "user-pass"
);
