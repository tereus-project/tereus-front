import type { ThemingProps } from "@chakra-ui/react";
import { Box, Button } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import type { To } from "history";
import React from "react";

export type PageProps = React.PropsWithChildren<{
  to?: To;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  variant?: ThemingProps<"Button">["variant"];
}>;

export function NavBarLink({ children, to, href, target, variant = "outline" }: PageProps) {
  return (
    <Box ml="4">
      {to ? (
        <Link to={to} target={target}>
          <Button variant={variant}>{children}</Button>
        </Link>
      ) : (
        <a href={href} target={target}>
          <Button variant={variant}>{children}</Button>
        </a>
      )}
    </Box>
  );
}
