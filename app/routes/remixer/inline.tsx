import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiForm, EuiFormRow, EuiPanel, EuiSelect } from "@elastic/eui";
import Editor from "@monaco-editor/react";
import React, { useEffect, useState } from "react";
import { ActionFunction, json, useActionData, useOutletContext, useSubmit, useTransition } from "remix";
import { v4 as uuidv4 } from "uuid";
import * as api from "~/api";
import { ActionFormData } from "~/api";
import { sessionCookie } from "~/cookie";
import { TereusContext } from "~/root";

export const action: ActionFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) || {};

  if (!session.token) {
    return json({ errors: ["Not logged in"] });
  }

  const values = await request.formData();

  const sourceLanguage = values.get("sourceLanguage")?.toString();
  const targetLanguage = values.get("targetLanguage")?.toString();

  if (!sourceLanguage) {
    return json({ errors: ["Missing source language"] });
  }

  if (!targetLanguage) {
    return json({ errors: ["Missing target language"] });
  }

  const sourceCode = values.get("sourceCode")?.toString();

  if (!sourceCode) {
    return json({ errors: ["Missing source code"] });
  }

  const [response, errors] = await api.remix.inline(
    sourceLanguage,
    targetLanguage,
    {
      source_code: sourceCode,
    },
    session.token
  );
  return json({ response, errors });
};

export default function RemixerZip() {
  const context = useOutletContext<TereusContext>();

  const submit = useSubmit();
  const transition = useTransition();

  const actionData = useActionData<ActionFormData<api.RemixResponseDTO>>();

  const [isRemixing, setIsRemixing] = useState(false);

  const [sourceLanguage, setSourceLanguage] = useState("c");
  const [targetLanguage, setTargetLanguage] = useState("go");
  const [sourceCode, setSourceCode] = useState("");
  const [outputCode, setOutputCode] = useState("");

  const createSource: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    submit(e.currentTarget, { method: "post" });
  };

  const poll = async (id: string) => {
    const res = await fetch(`/download/${id}/main`);

    if (res.ok) {
      setIsRemixing(false);
      setOutputCode(await res.text());

      context.pushToast({
        id: uuidv4(),
        title: "Remixing success!",
        color: "success",
      });
    } else if (res.status !== 204) {
      setIsRemixing(false);
      const data = await res.json();

      context.pushToast({
        id: uuidv4(),
        title: "An error occured",
        color: "danger",
        text: data?.errors?.join("\n") ?? res.statusText,
      });
    } else {
      setTimeout(() => poll(id), 400);
    }
  };

  useEffect(() => {
    if (transition.state === "loading") {
      if (actionData?.response) {
        context.pushToast({
          id: uuidv4(),
          title: "Remixing started!",
          color: "success",
        });

        setIsRemixing(true);
        setTimeout(() => poll(actionData.response.id), 400);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition]);

  return (
    <EuiForm
      component="form"
      method="post"
      encType="multipart/form-data"
      isInvalid={!!actionData?.errors}
      error={actionData?.errors}
      onSubmit={createSource}
    >
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiPanel hasBorder={true}>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={2}>
                <EuiFormRow label="Source language" fullWidth>
                  <EuiSelect
                    fullWidth
                    name="sourceLanguage"
                    options={[
                      {
                        value: "c",
                        text: "C",
                      },
                    ]}
                    autoComplete="off"
                    required
                    value={sourceLanguage}
                    onChange={(e) => setSourceLanguage(e.target.value)}
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
                        value: "go",
                        text: "Go",
                      },
                    ]}
                    autoComplete="off"
                    required
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                  />
                </EuiFormRow>
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <EuiFormRow hasEmptyLabelSpace>
                  <EuiButton type="submit" fill disabled={isRemixing || transition.state === "submitting"}>
                    {transition.state === "submitting" ? "Sending..." : isRemixing ? "Pending..." : "Remix!"}
                  </EuiButton>
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiPanel hasBorder={true}>
                <input type="hidden" name="sourceCode" value={sourceCode} />
                <Editor
                  language={sourceLanguage}
                  height="500px"
                  value={sourceCode}
                  onChange={(value) => setSourceCode(value ?? "")}
                />
              </EuiPanel>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiPanel hasBorder={true}>
                <Editor
                  language={targetLanguage}
                  height="500px"
                  options={{
                    readOnly: true,
                  }}
                  value={outputCode}
                />
              </EuiPanel>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiForm>
  );
}
