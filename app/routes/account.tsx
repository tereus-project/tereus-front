import { Container, ListItem, UnorderedList } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { useState } from "react";
import * as api from "~/api";
import { Page } from "~/components/Page";
import type { TereusContext } from "~/root";
import { authGuard } from "~/utils/authGuard";

interface LoaderResponse {
  response?: api.GetCurrentUserResponseDTO;
  errors: string[] | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const token = await authGuard(request);

  const [response, errors] = await api.getCurrentUser(token);
  return json<LoaderResponse>({
    response: response ?? undefined,
    errors,
  });
};

export default function History() {
  const context = useOutletContext<TereusContext>();
  const loaderData = useLoaderData<LoaderResponse>();

  const [user] = useState(loaderData.response);

  return (
    <Page title="Your account" user={context.user}>
      <Container>
        <UnorderedList>
          <ListItem>ID: {user?.id}</ListItem>
          <ListItem>Email: {user?.email}</ListItem>
        </UnorderedList>
      </Container>
    </Page>
  );
}
