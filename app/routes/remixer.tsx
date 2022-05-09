import { Container, Tab, TabList, Tabs } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet, useHref, useLocation, useOutletContext } from "@remix-run/react";
import { useLinkClickHandler } from "react-router-dom";
import { Page } from "~/components/Page";
import { sessionCookie } from "~/cookie";
import type { TereusContext } from "~/root";

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) || {};

  if (!session.token) {
    const url = new URL(request.url);
    return redirect(`/login?to=${url.pathname}${url.search}`);
  }

  return {};
};

export default function Remixer() {
  const context = useOutletContext<TereusContext>();
  const location = useLocation();

  const tabs = [
    {
      name: "Zip / Git",
      href: useHref(`/remixer/zip`),
      clickHandler: useLinkClickHandler<HTMLButtonElement>(`/remixer/zip`),
    },
    {
      name: "Inline",
      href: useHref(`/remixer/inline`),
      clickHandler: useLinkClickHandler<HTMLButtonElement>(`/remixer/inline`),
    },
  ];

  return (
    <Page title="Remixer" user={context.user}>
      <Container>
        <Tabs variant="line" index={tabs.findIndex((tab) => tab.href === location.pathname)}>
          <TabList>
            {tabs.map((tab) => (
              <Tab key={tab.name} as="a" href={tab.href} onClick={tab.clickHandler}>
                {tab.name}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </Container>

      <br />

      <Outlet context={context} />
    </Page>
  );
}
