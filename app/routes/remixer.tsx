import { EuiBasicTable, EuiButton, EuiCode, EuiFilePicker, EuiFlexGroup, EuiFlexItem, EuiForm, EuiFormRow, EuiGlobalToastList, EuiSelect, EuiSpacer } from "@elastic/eui";
import { Toast } from "@elastic/eui/src/components/toast/global_toast_list";
import React, { useEffect, useState } from "react";
import { ActionFunction, json, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData, useActionData, useLoaderData, useSubmit, useTransition } from "remix";
import * as api from '~/api';
import { ActionFormData } from "~/api";
import { Page } from "~/components/Page";
import { v4 as uuidv4 } from 'uuid';

export const loader = async () => {
  return [
    {
      id: '2e7d5e7d-18a1-49fe-93f0-52951e0ec93a',
      // name: 'Test 1',
      source_language: 'c',
      target_language: 'go',
      // progress: 0.5,
    },
    {
      id: '6d92c9d7-b74c-42fd-8f24-128c99608d30',
      // name: 'Test 2',
      source_language: 'c',
      target_language: 'go',
      // progress: 0.5,
    },
  ] as api.RemixResponseDTO[];
};

export const action: ActionFunction = async ({ request }) => {
  const values = await unstable_parseMultipartFormData(request, unstable_createMemoryUploadHandler({
    maxFileSize: 20_000_000,
  }));

  const [response, errors] = await api.remix(values);
  return json({ response, errors });
}

export default function Remixer() {
  const submit = useSubmit();
  const transition = useTransition();

  const actionData = useActionData<ActionFormData<api.RemixResponseDTO>>();
  const loaderData = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  const [sources, setSources] = useState(loaderData);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Toast) => {
    setToasts(toasts.concat(toast));
  };

  const removeToast = (removedToast: Toast) => {
    setToasts(toasts.filter((toast) => toast.id !== removedToast.id));
  };

  const createSource: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    submit(e.currentTarget, { method: "post", action: "/remixer" });
  }

  useEffect(() => {
    if (transition.state === 'loading' && actionData?.response) {
      setSources(loaderData.concat(actionData.response));

      addToast({
        id: uuidv4(),
        title: 'New source added',
        color: 'success',
        text: <>Source <EuiCode>{actionData.response.id}</EuiCode> added. Remixing will start soon.</>,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition]);

  return (
    <Page title="Remixer" icon="compute">
      <EuiForm
        component="form"
        method="post"
        encType="multipart/form-data"
        isInvalid={!!actionData?.errors}
        error={actionData?.errors}
        onSubmit={createSource}
      >
        <EuiFlexGroup>
          {/* <EuiFlexItem grow={false}>
          <EuiFormRow label="Source name">
            <EuiFieldText
              placeholder="Source name"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
            />
          </EuiFormRow>
        </EuiFlexItem> */}

          <EuiFlexItem grow={4}>
            <EuiFormRow label="Source files" fullWidth>
              <EuiFilePicker
                fullWidth
                name="file"
                display="default"
                accept=".zip"
                required
                multiple={false}
              />
            </EuiFormRow>
          </EuiFlexItem>

          <EuiFlexItem grow={2}>
            <EuiFormRow label="Source language" fullWidth>
              <EuiSelect
                fullWidth
                name="sourceLanguage"
                options={[
                  {
                    value: 'c',
                    text: 'C',
                  },
                ]}
                autoComplete="off"
                required
              />
            </EuiFormRow>
          </EuiFlexItem>

          <EuiFlexItem grow={2}>
            <EuiFormRow label="Target language" fullWidth>
              <EuiSelect
                fullWidth
                name="targetLanguage"
                options={[
                  {
                    value: 'go',
                    text: 'Go',
                  },
                ]}
                autoComplete="off"
                required
              />
            </EuiFormRow>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiFormRow hasEmptyLabelSpace>
              <EuiButton
                type="submit"
                fill
                disabled={transition.state === 'submitting'}
              >
                {transition.state === 'submitting' ? 'Sending...' : 'Remix!'}
              </EuiButton>
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiForm>

      <EuiSpacer />

      <EuiBasicTable
        tableCaption="Demo for EuiBasicTable with pagination"
        items={sources}
        columns={[
          {
            field: 'id',
            name: 'ID',
            truncateText: true,
          },
          {
            field: 'source_language',
            name: 'Source language',
            truncateText: true,
          },
          {
            field: 'target_language',
            name: 'Target language',
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
      <EuiGlobalToastList
        toasts={toasts}
        dismissToast={removeToast}
        toastLifeTimeMs={6000}
      />
    </Page>
  );
}
