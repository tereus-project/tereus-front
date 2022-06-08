import { createStyles } from "@mantine/core";
import { Links, LiveReload, Meta, Scripts } from "@remix-run/react";
import { StructuredData } from "remix-utils";
import { CustomScrollRestoration } from "./CustomScrollRestoration";

type DocumentProps = { children: React.ReactNode; title?: string };

const useStyles = createStyles(() => ({
  body: {
    marginTop: 0,
  },
}));

export function Document({ children, title }: DocumentProps) {
  const { classes, cx } = useStyles();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
        <StructuredData />
      </head>
      <body className={cx(classes.body)}>
        {children}
        <CustomScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
