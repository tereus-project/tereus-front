import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Kbd,
  Loader,
  LoadingOverlay,
  Select,
  Stack,
} from "@mantine/core";
import { showNotification, updateNotification } from "@mantine/notifications";
import Editor from "@monaco-editor/react";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLocation, useNavigate } from "@remix-run/react";
import type { FieldProps } from "formik";
import { Field, Form, Formik } from "formik";
import debounce from "lodash/debounce";
import uniqueId from "lodash/uniqueId";
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

  const [response, errors] = await api.transpile.inline(
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

const SUBMISSION_STATUS_MAP: Record<api.SubmissionStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  failed: "Failed",
  done: "Done",
  cleaned: "Cleaned",
};

export default function RemixerInline() {
  const csrf = useAuthenticityToken();

  const location = useLocation();
  const navigate = useNavigate();

  const [isTranspiling, setIsTranspiling] = useState(false);
  const [transpilationNotificationId, setTranspilationNotificationId] = useState<string>("");
  const [outputCode, setOutputCode] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<api.SubmissionStatus>("pending");

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

  const pollTranspilationCompletion = (submissionId: string, ms = 600) => {
    setTimeout(() => inlineTranspilationResultFetcher.load(`/download/${submissionId}/main`), ms);
  };

  const inlineTranspilationResultFetcher = useFetcher<DownloadSubmissionMainOutputLoaderResponse>();
  useEffect(() => {
    if (inlineTranspilationResultFetcher.type === "done") {
      const { submissionId, submissionData, isTerminal } = inlineTranspilationResultFetcher.data.response;

      if (inlineTranspilationResultFetcher.data.errors) {
        if (isTerminal) {
          updateNotification({
            id: transpilationNotificationId,
            autoClose: true,
            disallowClose: false,
            color: "red",
            title: "An error occured",
            message: inlineTranspilationResultFetcher.data.errors.join("\n"),
          });
        }
      } else if (submissionData) {
        setSubmissionStatus(submissionData.status);

        if (submissionData.status === "done") {
          setOutputCode(atob(submissionData.data));

          const startDate = new Date(submissionData.processing_started_at);
          const endDate = new Date(submissionData.processing_finished_at);

          updateNotification({
            id: transpilationNotificationId,
            autoClose: true,
            disallowClose: false,
            color: "green",
            title: "Transpilation success!",
            message: `It took ${(endDate.getTime() - startDate.getTime()) / 1000} seconds`,
          });
        }
      }

      if (!isTerminal) {
        pollTranspilationCompletion(submissionId);
      } else {
        setIsTranspiling(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inlineTranspilationResultFetcher]);

  const transpilationFetcher = useFetcher<ActionFormData<api.TranspileResponseDTO>>();
  useEffect(() => {
    if (transpilationFetcher.type === "done") {
      if (transpilationFetcher.data?.response) {
        const randomId = uniqueId("transpilation-notification-");
        setTranspilationNotificationId(randomId);

        showNotification({
          id: randomId,
          loading: true,
          title: "Transpilation started!",
          message: "",
          autoClose: false,
          disallowClose: true,
        });

        pollTranspilationCompletion(transpilationFetcher.data.response.id, 50);
      } else if (transpilationFetcher.data?.errors) {
        showNotification({
          color: "red",
          title: "An error occured",
          message: transpilationFetcher.data.errors.join("\n"),
        });

        setIsTranspiling(false);
      }
    } else if (transpilationFetcher.type === "actionSubmission") {
      setIsTranspiling(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transpilationFetcher]);

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
        setSubmissionStatus("pending");
        transpilationFetcher.submit({ csrf, ...values }, { replace: true, method: "post" });
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
                loading={props.isSubmitting || isTranspiling}
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
              <LoadingOverlay
                visible={props.isSubmitting || isTranspiling}
                loader={
                  <Group>
                    <Loader /> {SUBMISSION_STATUS_MAP[submissionStatus]}...
                  </Group>
                }
              />
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
