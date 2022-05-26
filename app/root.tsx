import { ChakraProvider } from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import type { LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, useLoaderData } from "@remix-run/react";
import React, { useContext, useEffect } from "react";
import { AuthenticityTokenProvider, createAuthenticityToken } from "remix-utils";
import * as api from "~/api";
import { CustomScrollRestoration } from "./components/CustomScrollRestoration";
import { ClientStyleContext, ServerStyleContext } from "./context";
import { commitSession, getSession } from "./sessions.server";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  viewport: "width=device-width,initial-scale=1",
  title: "Tereus",
});

export let links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstaticom" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap",
    },
  ];
};

const Document = withEmotionCache(({ children }: React.PropsWithChildren<{}>, emotionCache) => {
  const serverStyleData = useContext(ServerStyleContext);
  const clientStyleData = useContext(ClientStyleContext);

  // Only executed on client
  useEffect(() => {
    // re-link sheet container
    emotionCache.sheet.container = document.head;
    // re-inject tags
    const tags = emotionCache.sheet.tags;
    emotionCache.sheet.flush();

    tags.forEach((tag) => {
      (emotionCache.sheet as any)._insertTag(tag);
    });

    // reset cache to reapply global styles
    clientStyleData?.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        {serverStyleData?.map(({ key, ids, css }) => (
          <style key={key} data-emotion={`${key} ${ids.join(" ")}`} dangerouslySetInnerHTML={{ __html: css }} />
        ))}
      </head>
      <body>
        {children}
        <CustomScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
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

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export interface TereusContext {
  user?: api.GetCurrentUserResponseDTO;
}

export default function App() {
  const loaderData = useLoaderData<LoaderResponse>();

  return (
    <AuthenticityTokenProvider token={loaderData.csrf}>
      <Document>
        <ChakraProvider>
          <Outlet
            context={{
              user: loaderData.user,
            }}
          />
        </ChakraProvider>
      </Document>
    </AuthenticityTokenProvider>
  );
}
