import { Links, LiveReload, Meta, Scripts } from "@remix-run/react";
import { StructuredData } from "remix-utils";
import { CustomScrollRestoration } from "./CustomScrollRestoration";

export type DocumentProps = React.PropsWithChildren<{
  cloudflareAnalyticsToken?: string;
  umamiAnalytics?: {
    dataWebsiteId: string;
    script: string;
  };
}>;

export function Document({ children, cloudflareAnalyticsToken, umamiAnalytics }: DocumentProps) {
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
        {umamiAnalytics && (
          <script async defer data-website-id={umamiAnalytics.dataWebsiteId} src={umamiAnalytics.script}></script>
        )}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
