import {
  EuiBasicTable,
  EuiButton,
  EuiButtonIcon,
  EuiDescriptionList,
  EuiGlobalToastList,
  EuiScreenReaderOnly,
  RIGHT_ALIGNMENT,
} from "@elastic/eui";
import { Toast } from "@elastic/eui/src/components/toast/global_toast_list";
import { formatRelative, parseJSON } from "date-fns";
import React, { useState } from "react";
import { json, LoaderFunction, redirect, useLoaderData, useOutletContext } from "remix";
import { v4 as uuidv4 } from "uuid";
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
  return json<LoaderResponse>({
    response: response?.submissions,
    errors,
  });
};

export default function History() {
  const context = useOutletContext<TereusContext>();
  const loaderData = useLoaderData<LoaderResponse>();

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Toast) => setToasts(toasts.concat(toast));

  const removeToast = (removedToast: Toast) => {
    setToasts(toasts.filter((toast) => toast.id !== removedToast.id));
  };

  const [sources] = useState(loaderData.response ?? []);
  const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState<Record<string, React.ReactNode>>({});

  const toggleDetails = (item: api.SubmissionDTO) => {
    const itemIdToExpandedRowMapValues = { ...itemIdToExpandedRowMap };

    if (itemIdToExpandedRowMapValues[item.id]) {
      delete itemIdToExpandedRowMapValues[item.id];
    } else {
      itemIdToExpandedRowMapValues[item.id] = (
        <EuiDescriptionList
          listItems={[
            {
              title: "Error reason",
              description: item.reason,
            },
          ]}
        />
      );
    }

    setItemIdToExpandedRowMap(itemIdToExpandedRowMapValues);
  };

  const download = async (id: string) => {
    const res = await fetch(`/download/${id}`);

    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${id}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const data = await res.json();

      addToast({
        id: uuidv4(),
        title: "Failed to download files",
        color: "danger",
        text: data?.errors?.join("\n"),
      });
    }
  };

  return (
    <Page title="Remix history" icon="clock" user={context.user}>
      <EuiBasicTable
        tableCaption=""
        items={sources}
        itemId="id"
        itemIdToExpandedRowMap={itemIdToExpandedRowMap}
        isExpandable={true}
        hasActions={true}
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
          {
            actions: [
              {
                name: "Download",
                description: "Download all files",
                render: (record) => {
                  if (record.status === "done") {
                    return (
                      <EuiButton
                        onClick={() => {
                          download(record.id);
                        }}
                      >
                        Download
                      </EuiButton>
                    );
                  } else {
                    return (
                      <EuiButton disabled>
                        {record.status[0].toUpperCase()}
                        {record.status.slice(1)}
                      </EuiButton>
                    );
                  }
                },
              },
            ],
          },
          {
            align: RIGHT_ALIGNMENT,
            width: "40px",
            isExpander: true,
            name: (
              <EuiScreenReaderOnly>
                <span>Expand rows</span>
              </EuiScreenReaderOnly>
            ),
            render: (record: api.SubmissionDTO) => (
              <EuiButtonIcon
                onClick={() => toggleDetails(record)}
                aria-label={itemIdToExpandedRowMap[record.id] ? "Collapse" : "Expand"}
                iconType={itemIdToExpandedRowMap[record.id] ? "arrowUp" : "arrowDown"}
              />
            ),
          },
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

      <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={6000} />
    </Page>
  );
}
