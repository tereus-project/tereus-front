import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AuthenticityTokenProvider, createAuthenticityToken } from "remix-utils";
import * as api from "~/api";
import { Document } from "~/components/Document";
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
  const loaderData = useLoaderData<LoaderResponse>();

  return (
    <AuthenticityTokenProvider token={loaderData.csrf}>
      <Document>
        <MantineProvider>
          <NotificationsProvider>
            <Outlet
              context={{
                user: loaderData.user,
              }}
            />
          </NotificationsProvider>
        </MantineProvider>
      </Document>
    </AuthenticityTokenProvider>
  );
}
