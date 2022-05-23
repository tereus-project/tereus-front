import type { LayoutProps } from "@chakra-ui/react";
import {
  Avatar,
  Box,
  Button,
  Center,
  Container,
  Heading,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  VStack
} from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import md5 from "md5";
import { BsCpu } from "react-icons/bs";
import { CgArrowUpO } from "react-icons/cg";
import { RiGithubFill, RiHistoryFill } from "react-icons/ri";
import { NavBar } from "./NavBar";
import { NavBarGroup } from "./NavBarGroup";
import { NavBarLink } from "./NavBarLink";

export type PageProps = React.PropsWithChildren<{
  title?: string;
  user?: {
    email: string;
  };
  headingMaxW?: LayoutProps["maxW"];
}>;

export function Page({ children, title, user, headingMaxW = "60ch" }: PageProps) {
  return (
    <VStack>
      <NavBar>
        <NavBarGroup>
          <NavBarLink to="/" variant="nav">
            Tereus
          </NavBarLink>
        </NavBarGroup>
        <NavBarGroup>
          <NavBarLink to="/pricing">
            <CgArrowUpO />
            <Box ml={2}>Upgrade</Box>
          </NavBarLink>

          <NavBarLink to="/remixer/zip">
            <BsCpu />
            <Box ml={2}>Remixer</Box>
          </NavBarLink>

          {user && (
            <NavBarLink to="/history">
              <RiHistoryFill />
              <Box ml={1}>History</Box>
            </NavBarLink>
          )}

          <NavBarLink to="https://github.com/tereus-project" target="_blank">
            <RiGithubFill />
          </NavBarLink>

          {user && (
            <Box ml="4">
              <Menu>
                <MenuButton as={Button} rounded={"full"} variant={"link"} cursor={"pointer"} minW={0}>
                  <Avatar size={"sm"} src={`https://www.gravatar.com/avatar/${md5(user?.email ?? "")}`} />
                </MenuButton>
                <MenuList alignItems={"center"}>
                  <br />
                  <Center>
                    <Avatar size={"2xl"} src={`https://www.gravatar.com/avatar/${md5(user?.email ?? "")}`} />
                  </Center>
                  <br />
                  <Center>
                    <p>{user?.email}</p>
                  </Center>
                  <br />
                  <MenuDivider />
                  <Link to="/account">
                    <MenuItem>Account Settings</MenuItem>
                  </Link>
                  <Link to="/auth/logout">
                    <MenuItem>Logout</MenuItem>
                  </Link>
                </MenuList>
              </Menu>
            </Box>
          )}
        </NavBarGroup>
      </NavBar>

      <Box as="main" width="full" padding={4}>
        <Container maxW={headingMaxW} as="header" mb={4}>
          <Heading>{title}</Heading>
        </Container>

        {children}
      </Box>
    </VStack>
  );
}
