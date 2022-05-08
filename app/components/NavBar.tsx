import { Flex } from "@chakra-ui/react";

export type PageProps = React.PropsWithChildren<{
  title?: string;
  user?: {
    email: string;
  };
}>;

export function NavBar({ children, title, user }: PageProps) {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      width="full"
      padding={4}
      marginBottom={2}
      background={["black.500", "black.500", "transparent", "transparent"]}
      color={["black", "black", "primary.700", "primary.700"]}
    >
      {children}
    </Flex>
  );
}
