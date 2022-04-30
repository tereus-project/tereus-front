import { EuiTab, EuiTabs } from "@elastic/eui";
import React from "react";
import { useLinkClickHandler } from "react-router-dom";
import { LoaderFunction, Outlet, redirect, useHref, useLocation, useOutletContext } from "remix";
import { Page } from "~/components/Page";
import { sessionCookie } from "~/cookie";
import { TereusContext } from "~/root";

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) || {};

  if (!session.token) {
    return redirect("/login");
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
      clickHandler: useLinkClickHandler(`/remixer/zip`),
    },
    {
      name: "Inline",
      href: useHref(`/remixer/inline`),
      clickHandler: useLinkClickHandler(`/remixer/inline`),
    },
  ];

  return (
    <Page title="Remixer" icon="compute" user={context.user}>
      <EuiTabs expand={true}>
        {tabs.map((tab) => (
          <EuiTab href={tab.href} onClick={tab.clickHandler} isSelected={tab.href === location.pathname} key={tab.href}>
            {tab.name}
          </EuiTab>
        ))}
      </EuiTabs>

      <br />

      <Outlet context={context} />
    </Page>
  );
}
