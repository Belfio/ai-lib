import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";

import "./tailwind.css";
import LayoutDashboard from "./components/LayoutDashboard";
import { UserProvider } from "./providers/userContext";
import { isAuthenticated } from "./server/auth/auth.server";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export default function App() {
  const data = useLoaderData<typeof loader>();
  return (
    <UserProvider initialUser={data.user}>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body>
          <LayoutDashboard />
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </UserProvider>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await isAuthenticated(request);
  return Response.json({ user });
}
