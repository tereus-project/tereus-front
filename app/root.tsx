import { ColorScheme, Stack } from "@mantine/core";
import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { AuthenticityTokenProvider, createAuthenticityToken } from "remix-utils";
import { ArrowBigUpLines, BrandGithub, Cpu, Home, History } from "tabler-icons-react";
import * as api from "~/api";
import { Document } from "~/components/Document";
import { ResponsiveHeader } from "./components/Header";
import { commitSession, getSession } from "./sessions.server";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Tereus",
  viewport: "width=device-width,initial-scale=1",
});

interface LoaderResponse {
  csrf: string;
  user: api.GetCurrentUserResponseDTO | null;

  errors: string[] | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request);
  const csrf = createAuthenticityToken(session);

  const data: LoaderResponse = {
    csrf,
    user: null,
    errors: null,
  };

  if (session.has("token")) {
    const [user, errors] = await api.getCurrentUser(session.get("token"));
    data.user = user;
    data.errors = (data.errors ?? []).concat(errors ?? []);
  }

  return json<LoaderResponse>(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export interface TereusContext {
  user?: api.GetCurrentUserResponseDTO;
}

export default function App() {
  const { user, csrf } = useLoaderData<LoaderResponse>();

  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  return (
    <AuthenticityTokenProvider token={csrf}>
      <Document>
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
          <MantineProvider withGlobalStyles withNormalizeCSS>
            <NotificationsProvider>
              <Stack>
                <ResponsiveHeader
                  user={user}
                  links={[
                    { to: "/", label: "Home", leftIcon: <Home size={16} /> },
                    {
                      to: "/pricing",
                      label: user ? "Subscription" : "Pricing",
                      leftIcon: <ArrowBigUpLines size={16} />,
                    },
                    { to: "/transpiler/inline", label: "Transpiler", leftIcon: <Cpu size={16} /> },
                    { to: "/history", label: "History", leftIcon: <History size={16} /> },
                    { href: "https://github.com/tereus-project", label: <BrandGithub size={16} />, target: "_blank" },
                  ]}
                />

                <Outlet
                  context={{
                    user,
                  }}
                />
              </Stack>
            </NotificationsProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </Document>
    </AuthenticityTokenProvider>
  );
}
