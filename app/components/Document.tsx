import { Links, LiveReload, Meta, Scripts } from "@remix-run/react";
import { StructuredData } from "remix-utils";
import { CustomScrollRestoration } from "./CustomScrollRestoration";

type DocumentProps = React.PropsWithChildren<{
  cloudflareAnalyticsToken?: string;
}>;

export function Document({ children, cloudflareAnalyticsToken }: DocumentProps) {
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
        {cloudflareAnalyticsToken && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${cloudflareAnalyticsToken}"}`}
          ></script>
        )}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
