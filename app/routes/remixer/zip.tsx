import {
  EuiButton,
  EuiCode,
  EuiFieldText,
  EuiFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiPanel,
  EuiRadioGroup,
  EuiSelect,
} from "@elastic/eui";
import React, { useEffect, useState } from "react";
import {
  ActionFunction,
  json,
  Link,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  useActionData,
  useOutletContext,
  useSubmit,
  useTransition,
} from "remix";
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

  const values = await unstable_parseMultipartFormData(
    request,
    unstable_createMemoryUploadHandler({
      maxFileSize: 20_000_000,
    })
  );

  const mode = values.get("mode")?.toString();
  const sourceLanguage = values.get("sourceLanguage")?.toString();
  const targetLanguage = values.get("targetLanguage")?.toString();

  if (!mode) {
    return json({ errors: ["Missing mode"] });
  }

  if (!sourceLanguage) {
    return json({ errors: ["Missing source language"] });
  }

  if (!targetLanguage) {
    return json({ errors: ["Missing target language"] });
  }

  if (mode === "zip") {
    const [response, errors] = await api.remix.zip(sourceLanguage, targetLanguage, values, session.token);
    return json({ response, errors });
  } else if (mode === "git") {
    const gitRepo = values.get("gitRepo")?.toString();

    if (!gitRepo) {
      return json({ errors: ["Missing git repo"] });
    }

    const [response, errors] = await api.remix.git(
      sourceLanguage,
      targetLanguage,
      {
        git_repo: gitRepo,
      },
      session.token
    );
    return json({ response, errors });
  } else if (mode === "inline") {
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
  }

  return json({ errors: ["Unknown mode"] });
};

export default function RemixerZip() {
  const context = useOutletContext<TereusContext>();

  const submit = useSubmit();
  const transition = useTransition();

  const actionData = useActionData<ActionFormData<api.RemixResponseDTO>>();

  const modeIdZip = "selected-mode-zip";
  const modeIdGit = "selected-mode-git";
  const [selectedModeId, setSelectedModeId] = useState(modeIdZip);

  const modeIdToMode: Record<string, keyof typeof api.remix> = {
    [modeIdZip]: "zip",
    [modeIdGit]: "git",
  };
  const [selectedMode, setSelectedMode] = useState(modeIdToMode[selectedModeId]);

  const createSource: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    submit(e.currentTarget, { method: "post" });
  };

  useEffect(() => {
    if (transition.state === "loading" && actionData?.response) {
      context.pushToast({
        id: uuidv4(),
        title: "New source added",
        color: "success",
        text: (
          <>
            Source <EuiCode>{actionData.response.id}</EuiCode> added. Remixing will start soon. You can check the{" "}
            <Link to="/history">history page</Link> for status.
          </>
        ),
      });
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
      <input type="hidden" name="mode" value={selectedMode} />

      <EuiPanel hasBorder={true}>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={4}>
            <EuiRadioGroup
              options={[
                {
                  id: modeIdZip,
                  label: (
                    <EuiFilePicker
                      fullWidth
                      name="file"
                      display="default"
                      accept=".zip"
                      autoComplete="off"
                      required={selectedModeId === modeIdZip}
                      multiple={false}
                      onChange={() => {
                        setSelectedModeId(modeIdZip);
                        setSelectedMode("zip");
                      }}
                    />
                  ),
                  labelProps: {
                    id: `${modeIdZip}-label`,
                    style: {
                      width: "100%",
                    },
                  },
                },
                {
                  id: modeIdGit,
                  label: (
                    <EuiFieldText
                      fullWidth
                      name="gitRepo"
                      required={selectedModeId === modeIdGit}
                      placeholder="https://github.com/sqlite/sqlite"
                      onChange={() => {
                        if (selectedModeId !== modeIdGit) {
                          setSelectedModeId(modeIdGit);
                          setSelectedMode("git");
                        }
                      }}
                    />
                  ),
                  labelProps: {
                    id: `${modeIdGit}-label`,
                    style: {
                      width: "100%",
                    },
                  },
                },
              ]}
              idSelected={selectedModeId}
              onChange={(id) => {
                setSelectedModeId(id);
                setSelectedMode(modeIdToMode[id]);
              }}
            />
          </EuiFlexItem>

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
              />
            </EuiFormRow>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiFormRow hasEmptyLabelSpace>
              <EuiButton type="submit" fill disabled={transition.state === "submitting"}>
                {transition.state === "submitting" ? "Sending..." : "Remix!"}
              </EuiButton>
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </EuiForm>
  );
}
