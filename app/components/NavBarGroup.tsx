import { Flex } from "@chakra-ui/react";

export type PageProps = React.PropsWithChildren<{}>;

export function NavBarGroup({ children }: PageProps) {
  return <Flex align="center">{children}</Flex>;
}
