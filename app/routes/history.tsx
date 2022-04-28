import { EuiBasicTable } from "@elastic/eui";
import { formatRelative, parseJSON } from "date-fns";
import React, { useState } from "react";
import { json, LoaderFunction, redirect, useLoaderData, useOutletContext } from "remix";
import * as api from "~/api";
import { Page } from "~/components/Page";
import { sessionCookie } from "~/cookie";
import { TereusContext } from "~/root";

interface LoaderResponse {
  response?: api.SubmissionDTO[];
  errors: string[] | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) || {};

  if (!session.token) {
    return redirect("/login");
  }

  const [response, errors] = await api.getUserSubmissions(session.token);
  return json({ response: response?.submissions, errors });
};

export default function History() {
  const context = useOutletContext<TereusContext>();
  const loaderData = useLoaderData<LoaderResponse>();

  const [sources] = useState(loaderData.response ?? []);

  return (
    <Page title="Remix history" icon="clock" user={context.user}>
      <EuiBasicTable
        tableCaption=""
        items={sources}
        columns={[
          {
            field: "id",
            name: "ID",
            truncateText: true,
          },
          {
            field: "created_at",
            name: "Created at",
            render: (_, data) => {
              return formatRelative(parseJSON(data.created_at), new Date());
            },
          },
          {
            field: "source_language",
            name: "Source language",
            truncateText: true,
          },
          {
            field: "target_language",
            name: "Target language",
            truncateText: true,
          },
          // {
          //   field: 'progress',
          //   name: 'Progress',
          //   render: (_, item) => {
          //     return <EuiProgress value={item.progress * 100} max={100} size="m" />
          //   },
          // },
        ]}
        // pagination={{
        //   pageIndex,
        //   pageSize,
        //   totalItemCount: sources.length,
        //   pageSizeOptions: [10, 20, 50, 100, 'all'],
        //   showPerPageOptions: true,
        // }}
        // onChange={onTableChange}
      />
    </Page>
  );
}
