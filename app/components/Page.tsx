import { Avatar, Box, Container, Heading, VStack } from "@chakra-ui/react";
import md5 from "md5";
import { RiGithubFill, RiHistoryFill } from "react-icons/ri";
import { NavBar } from "./NavBar";
import { NavBarGroup } from "./NavBarGroup";
import { NavBarLink } from "./NavBarLink";

export type PageProps = React.PropsWithChildren<{
  title?: string;
  user?: {
    email: string;
  };
}>;

export function Page({ children, title, user }: PageProps) {
  return (
    <VStack>
      <NavBar>
        <NavBarGroup>
          <NavBarLink to="/" variant="nav">
            Tereus
          </NavBarLink>
        </NavBarGroup>
        <NavBarGroup>
          <NavBarLink to="/remixer/zip">Remixer</NavBarLink>

          {user && (
            <NavBarLink to="/history">
              <RiHistoryFill />
            </NavBarLink>
          )}

          <NavBarLink to="https://github.com/tereus-project" target="_blank">
            <RiGithubFill />
          </NavBarLink>

          {user && (
            <NavBarLink to="" variant="unstyled">
              <Avatar name="Your account" size="full" src={`https://www.gravatar.com/avatar/${md5(user.email)}`} />
            </NavBarLink>
          )}
        </NavBarGroup>
      </NavBar>

      <Box as="main" width="full" padding={4}>
        <Container as="header">
          <Heading>{title}</Heading>
        </Container>

        {children}
      </Box>
    </VStack>
  );
}
