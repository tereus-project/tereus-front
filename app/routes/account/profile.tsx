import { Button, Container, HStack, ListItem, UnorderedList, useToast } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
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
  const toast = useToast();

  const [user] = useState(loaderData.response);

  const deleteUserFetcher = useFetcher<api.ActionFormData<null>>();
  useEffect(() => {
    if (deleteUserFetcher.data?.errors) {
      toast({
        isClosable: true,
        title: "An error occured",
        status: "error",
        description: deleteUserFetcher.data.errors.join("\n"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteUserFetcher]);

  const downloadUserExport = async () => {
    const res = await fetch(`/account/export`);

    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tereus-export.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const data = await res.json();

      toast({
        title: "Failed to download files",
        status: "error",
        description: data?.errors?.join("\n"),
      });
    }
  };

  return (
    <Page title="Your account" user={context.user}>
      <Container>
        <UnorderedList>
          <ListItem>ID: {user?.id}</ListItem>
          <ListItem>Email: {user?.email}</ListItem>
        </UnorderedList>

        <HStack mt={4}>
          <Button
            variant="outline"
            colorScheme={"red"}
            leftIcon={<RiDeleteBin6Line />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              deleteUserFetcher.submit(
                {},
                {
                  action: `/account/delete`,
                  replace: true,
                  method: "post",
                }
              );
            }}
          >
            Delete account
          </Button>
          <Button
            variant="outline"
            leftIcon={<FiDownload />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              downloadUserExport();
            }}
          >
            Download data export
          </Button>
        </HStack>
      </Container>
    </Page>
  );
}
