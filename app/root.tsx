import {
  Links,
  LinksFunction,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "remix";
import type { MetaFunction } from "remix";
import euiThemeLight from '@elastic/eui/dist/eui_theme_light.css';
import { EuiGlobalStyles, EuiProvider } from "@elastic/eui";

export const meta: MetaFunction = () => {
  return { title: "Tereus" };
};

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: euiThemeLight,
    },
  ];
};

export default function App() {
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
          <Outlet />
        </EuiProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
