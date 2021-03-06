import { Container, Tabs } from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import type { ShouldReloadFunction } from "@remix-run/react";
import { Link, Outlet, useHref, useLocation, useOutletContext } from "@remix-run/react";
import { useLinkClickHandler } from "react-router-dom";
import { Page } from "~/components/Page";
import type { TereusContext } from "~/root";
import { authGuard } from "~/utils/authGuard.server";

export const TRANSPILER_MAP = {
  c: {
    label: "C",
    targets: [
      {
        label: "Go",
        value: "go",
      },
    ],
  },
  lua: {
    label: "Lua",
    targets: [
      {
        label: "Ruby",
        value: "ruby",
      },
    ],
  },
};

export const loader: LoaderFunction = async ({ request }) => {
  await authGuard(request);
  return {};
};

export const unstable_shouldReload: ShouldReloadFunction = ({ submission }) => {
  return !!submission && submission.method !== "GET";
};

export default function Transpiler() {
  const context = useOutletContext<TereusContext>();
  const location = useLocation();

  const tabs = [
    {
      name: "Zip / Git",
      href: useHref(`/transpiler/zip`),
      clickHandler: useLinkClickHandler<HTMLButtonElement>(`/transpiler/zip`),
    },
    {
      name: "Inline",
      href: useHref(`/transpiler/inline`),
      clickHandler: useLinkClickHandler<HTMLButtonElement>(`/transpiler/inline`),
    },
  ];

  return (
    <Page title="Transpiler" containerFluid headerSize="sm">
      <Container size="sm">
        <Tabs
          active={tabs.findIndex((tab) => tab.href === location.pathname)}
          styles={{
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
          }}
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
