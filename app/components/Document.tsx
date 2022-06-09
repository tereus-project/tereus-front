import { Links, LiveReload, Meta, Scripts } from "@remix-run/react";
import { StructuredData } from "remix-utils";
import { CustomScrollRestoration } from "./CustomScrollRestoration";

type DocumentProps = { children: React.ReactNode; title?: string };

export function Document({ children, title }: DocumentProps) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <StructuredData />
      </head>
      <body>
        {children}
        <CustomScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
