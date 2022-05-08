import { ChakraProvider } from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import React, { useContext, useEffect } from "react";
import {
  json,
  Links,
  LinksFunction,
  LiveReload,
  LoaderFunction,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "remix"; // Depends on the runtime you choose
import * as api from "~/api";
import { ClientStyleContext, ServerStyleContext } from "./context";
import { sessionCookie } from "./cookie";

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
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
});

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

  const context: TereusContext = {
    user: loaderData.user,
  };

  return (
    <Document>
      <ChakraProvider>
        <Outlet context={context} />
      </ChakraProvider>
    </Document>
  );
}
