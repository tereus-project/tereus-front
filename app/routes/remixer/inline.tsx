import { Box, Button, Card, Container, Divider, Group, Kbd, Select, Stack } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import Editor from "@monaco-editor/react";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLocation, useNavigate } from "@remix-run/react";
import type { FieldProps } from "formik";
import { Field, Form, Formik } from "formik";
import debounce from "lodash/debounce";
import { useEffect, useState } from "react";
import { useAuthenticityToken, verifyAuthenticityToken } from "remix-utils";
import { Exchange } from "tabler-icons-react";
import type { ActionFormData } from "~/api";
import * as api from "~/api";
import { getSession } from "~/sessions.server";
import type { DownloadSubmissionMainOutputLoaderResponse } from "../download.$id.main";

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request);
  await verifyAuthenticityToken(request, session);

  if (!session.has("token")) {
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
    session.get("token")
  );
  return json({ response, errors });
};

const DEFAULT_SOURCE_CODES = {
  c: `
int main() {
    printf("Hello, World!");
}
`.trimStart(),
};

export default function RemixerInline() {
  const csrf = useAuthenticityToken();

  const location = useLocation();
  const navigate = useNavigate();

  const [isRemixing, setIsRemixing] = useState(false);
  const [outputCode, setOutputCode] = useState("");

  let sourceCode = new URLSearchParams(location.search).get("i");
  if (sourceCode) {
    try {
      sourceCode = atob(decodeURIComponent(sourceCode));
    } catch {
      sourceCode = "";
    }
  }

  const updateInputQueryParam = debounce((value: string | undefined) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("i", encodeURIComponent(btoa(value ?? "")));

    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true, state: { scroll: false } });
  }, 1000);

  const remixingInlineResultFetcher = useFetcher<DownloadSubmissionMainOutputLoaderResponse>();
  useEffect(() => {
    if (remixingInlineResultFetcher.type === "done") {
      if (remixingInlineResultFetcher.data?.errors) {
        if (remixingInlineResultFetcher.data.response.isTerminal) {
          setIsRemixing(false);

          showNotification({
            color: "red",
            title: "An error occured",
            message: remixingInlineResultFetcher.data.errors.join("\n"),
          });
        } else {
          setTimeout(
            () =>
              remixingInlineResultFetcher.load(
                `/download/${remixingInlineResultFetcher.data.response.submissionId}/main`
              ),
            600
          );
        }
      } else if (remixingInlineResultFetcher.data?.response.submissionData) {
        setIsRemixing(false);
        setOutputCode(atob(remixingInlineResultFetcher.data.response.submissionData.data));

        showNotification({
          color: "green",
          title: "Remixing success!",
          message: "",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remixingInlineResultFetcher]);

  const remixingFetcher = useFetcher<ActionFormData<api.RemixResponseDTO>>();
  useEffect(() => {
    if (remixingFetcher.type === "done") {
      if (remixingFetcher.data?.response) {
        showNotification({
          color: "blue",
          title: "Remixing started!",
          message: "",
        });

        setTimeout(() => remixingInlineResultFetcher.load(`/download/${remixingFetcher.data.response!.id}/main`), 600);
      } else if (remixingFetcher.data?.errors) {
        showNotification({
          color: "red",
          title: "An error occured",
          message: remixingFetcher.data.errors.join("\n"),
        });

        setIsRemixing(false);
      }
    } else if (remixingFetcher.type === "actionSubmission") {
      setIsRemixing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remixingFetcher]);

  type FormValues = {
    sourceLanguage: string;
    targetLanguage: string;
    sourceCode: string;
  };

  return (
    <Formik<FormValues>
      initialValues={{
        sourceLanguage: "c",
        targetLanguage: "go",
        sourceCode: sourceCode ?? DEFAULT_SOURCE_CODES["c"],
      }}
      onSubmit={(values, actions) => {
        remixingFetcher.submit({ csrf, ...values }, { replace: true, method: "post" });
        actions.setSubmitting(false);
      }}
    >
      {(props) => (
        <Form>
          <Container size="sm">
            <Card shadow="sm" withBorder>
              <Field name="sourceLanguage" isRequired>
                {({ field, meta }: FieldProps<FormValues["sourceLanguage"]>) => (
                  <Select {...field} label="Source language" data={[{ value: "c", label: "C" }]} error={meta.error} />
                )}
              </Field>

              <br />

              <Field name="targetLanguage" isRequired>
                {({ field, meta }: FieldProps<FormValues["targetLanguage"]>) => (
                  <Select {...field} label="Target language" data={[{ value: "go", label: "Go" }]} error={meta.error} />
                )}
              </Field>
            </Card>
          </Container>

          <br />

          <Group mb={24} position="center" align="start">
            <Card shadow="sm" withBorder style={{ flex: 1 }}>
              <Field name="sourceCode" isRequired>
                {({ field, meta }: FieldProps<FormValues["sourceCode"]>) => (
                  <Editor
                    {...field}
                    onChange={(value) => {
                      props.setFieldValue("sourceCode", value);
                      updateInputQueryParam(value);
                    }}
                    onMount={(editor) => {
                      editor.onKeyDown((e) => {
                        if ((e.ctrlKey || e.metaKey) && e.keyCode === 3) {
                          e.preventDefault();
                          e.stopPropagation();

                          props.submitForm();
                        }
                      });
                    }}
                    language={props.values.sourceLanguage}
                    height="500px"
                  />
                )}
              </Field>
            </Card>
            <Stack align="stretch">
              <Button
                px={10}
                color="blue"
                leftIcon={<Exchange size={16} />}
                loading={props.isSubmitting || isRemixing}
                type="submit"
              >
                Transpile
              </Button>
              <Divider my="xs" label="Or" labelPosition="center" />
              <Box
                sx={() => ({
                  textAlign: "center",
                })}
              >
                <Kbd px={10}>⌘</Kbd> + <Kbd px={10}>↵</Kbd>
              </Box>
            </Stack>
            <Card shadow="sm" withBorder style={{ flex: 1 }}>
              <Editor
                language={props.values.targetLanguage}
                height="500px"
                options={{
                  readOnly: true,
                }}
                value={outputCode}
              />
            </Card>
          </Group>
        </Form>
      )}
    </Formik>
  );
}
