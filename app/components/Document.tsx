import { Links, LiveReload, Meta, Scripts } from "@remix-run/react";
import { ErrorBoundary, withSentryRouteTracing } from "@sentry/remix";
import { StructuredData } from "remix-utils";
import { CustomScrollRestoration } from "./CustomScrollRestoration";

export type DocumentProps = React.PropsWithChildren<{
  cloudflareAnalyticsToken?: string;
  umamiAnalytics?: {
    dataWebsiteId: string;
    script: string;
  };
}>;

function DocumentComponent({ children, cloudflareAnalyticsToken, umamiAnalytics }: DocumentProps) {
  return (
    <ErrorBoundary>
      <html lang="en">
        <head>
          <Meta />
          <Links />
          <StructuredData />
        </head>
        <body style={{ overflowX: "hidden" }}>
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
    </ErrorBoundary>
  );
}

export const Document = withSentryRouteTracing(DocumentComponent);
