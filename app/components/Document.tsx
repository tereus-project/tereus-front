import { createStyles } from "@mantine/core";
import { Links, LiveReload, Meta, Scripts } from "@remix-run/react";
import { ErrorBoundary, withSentryRouteTracing } from "@sentry/remix";
import { StructuredData } from "remix-utils";
import { CustomScrollRestoration } from "./CustomScrollRestoration";

const useStyles = createStyles((theme) => ({
  body: {
    overflowX: "hidden",
  },
}));

export type DocumentProps = React.PropsWithChildren<{
  cloudflareAnalyticsToken?: string;
  umamiAnalytics?: {
    dataWebsiteId: string;
    script: string;
  };
}>;

function DocumentComponent({ children, cloudflareAnalyticsToken, umamiAnalytics }: DocumentProps) {
  const { classes } = useStyles();

  return (
    <ErrorBoundary>
      <html lang="en">
        <head>
          <Meta />
          <Links />
          <StructuredData />
        </head>
        <body className={classes.body}>
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
