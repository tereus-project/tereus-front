import { EuiGlobalStyles, EuiProvider } from "@elastic/eui";
import euiThemeLight from "@elastic/eui/dist/eui_theme_light.css";
import { json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import { Links, LinksFunction, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "remix";
import * as api from "~/api";
import { sessionCookie } from "./cookie";
import styles from "~/styles/global.css";

export const meta: MetaFunction = () => {
  return { title: "Tereus" };
};

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: euiThemeLight,
    },
    {
      rel: "stylesheet",
      href: styles,
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) || {};

  if (session.token) {
    const [user, errors] = await api.getCurrentUser(session.token);
    return json({ user, errors });
  }

  return json({ user: null });
};

export interface TereusContext {
  user?: api.GetCurrentUserResponseDTO;
}

export default function App() {
  const loaderData = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  const context = {
    user: loaderData.user,
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <EuiGlobalStyles />
        <Links />
      </head>
      <body>
        <EuiProvider colorMode="light" globalStyles={false}>
          <Outlet context={context} />
        </EuiProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
