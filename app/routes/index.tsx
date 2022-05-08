import { useOutletContext } from "@remix-run/react";
import { Page } from "~/components/Page";
import type { TereusContext } from "~/root";

export default function Index() {
  const context = useOutletContext<TereusContext>();

  return <Page user={context.user}></Page>;
}
