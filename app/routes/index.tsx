import { useOutletContext } from "remix";
import { Page } from "~/components/Page";
import { TereusContext } from "~/root";

export default function Index() {
  const context = useOutletContext<TereusContext>();

  return <Page user={context.user}></Page>;
}
