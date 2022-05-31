import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Container,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { RiGithubFill, RiGitlabFill } from "react-icons/ri";
import { Page } from "~/components/Page";

type LoaderData = {
  githubLoginUrl: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  let githubLoginUrl = `https://github.com/login/oauth/authorize?scope=user:email%20repo%20gist&client_id=${process.env.GITHUB_OAUTH2_CLIENT_ID}`;

  const queries = new URL(request.url).searchParams;
  const to = queries.get("to");

  const searchParams = new URLSearchParams();

  if (to) {
    searchParams.append("to", to);
  }

  if (process.env.FRONT_URL) {
    githubLoginUrl += `&redirect_uri=${process.env.FRONT_URL}/auth/github?${searchParams.toString()}`;
  } else if (process.env.NODE_ENV === "development") {
    const url = new URL(request.url);
    githubLoginUrl += `&redirect_uri=http://127.0.0.1:${url.port}/auth/github?${searchParams.toString()}`;
  }

  return {
    githubLoginUrl,
  } as LoaderData;
};

export default function Login() {
  const loaderData = useLoaderData<LoaderData>();
  const [searchParams] = useSearchParams();

  const error = searchParams.get("error");

  return (
    <Page title="Login to Tereus" subtitle="Sign up or create an account in one click!">
      {error && (
        <Container maxW="4xl" mb={4}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>An error occured!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Container>
      )}

      <Container maxW="lg" py={{ base: "12", md: "24" }} px={{ base: "0", sm: "8" }}>
        <Stack>
          <Box
            py={{ base: "0", sm: "8" }}
            px={{ base: "4", sm: "10" }}
            bg={"gray.100"}
            boxShadow={{ base: "none", sm: useColorModeValue("lg", "md-dark") }}
            borderRadius={{ base: "none", sm: "xl" }}
          >
            <Stack spacing="6">
              <Stack spacing="6">
                <a href={loaderData.githubLoginUrl}>
                  <Button width="100%" leftIcon={<RiGithubFill />} colorScheme="blue" variant="solid">
                    Continue with GitHub
                  </Button>
                </a>
                <a href={loaderData.githubLoginUrl}>
                  <Button width="100%" leftIcon={<RiGitlabFill />} colorScheme="blue" variant="solid">
                    Continue with GitLab
                  </Button>
                </a>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Page>
  );
}
