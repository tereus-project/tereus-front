import type { LoaderFunction } from "@remix-run/server-runtime";
import { DiskCache, imageLoader } from "remix-image/server";

const config = {
  selfUrl: "http://localhost:3000",
  cache: new DiskCache(),
};

export const loader: LoaderFunction = ({ request }) => {
  return imageLoader(config, request);
};
