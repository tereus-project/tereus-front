import { Container, Tabs } from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { Link, Outlet, useHref, useLocation, useOutletContext } from "@remix-run/react";
import { useLinkClickHandler } from "react-router-dom";
import { Page } from "~/components/Page";
import type { TereusContext } from "~/root";
import { authGuard } from "~/utils/authGuard";

export const loader: LoaderFunction = async ({ request }) => {
  await authGuard(request);
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
    <Page title="Remixer" user={context.user} containerFluid headerSize="sm">
      <Container size="sm">
        <Tabs
          active={tabs.findIndex((tab) => tab.href === location.pathname)}
          styles={(theme) => ({
            tabControl: {
              padding: 0,
            },
            tabLabel: {
              height: "100%",

              a: {
                display: "flex",
                alignItems: "center",
                height: "100%",
                padding: "0px 16px",
                color: "inherit",
                textDecoration: "inherit",
              },
            },
          })}
        >
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.name} label={<Link to={tab.href}>{tab.name}</Link>} />
          ))}
        </Tabs>
      </Container>

      <br />

      <Outlet context={context} />
    </Page>
  );
}
