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
import type { ShouldReloadFunction } from "@remix-run/react";
import { useFetcher, useLocation, useNavigate, useSearchParams } from "@remix-run/react";
import type { FieldProps } from "formik";
import { Field, Form, Formik } from "formik";
import debounce from "lodash/debounce";
import uniqueId from "lodash/uniqueId";
import { compressToBase64, decompressFromBase64 } from "lz-string";
import { useEffect, useState } from "react";
import { useAuthenticityToken } from "remix-utils";
import { Exchange } from "tabler-icons-react";
import type { ActionFormData } from "~/api.server";
import * as api from "~/api.server";
import { authGuard } from "~/utils/authGuard.server";
import { realisticConfettis } from "~/utils/confetti.client";
import { csrfGuard } from "~/utils/csrfGuard.server";
import type { DownloadSubmissionMainOutputLoaderResponse } from "../download.$id.main";
import { TRANSPILER_MAP } from "../transpiler";

export const action: ActionFunction = async ({ request }) => {
  const { token, session } = await authGuard(request);
  await csrfGuard(request, session);

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
    token
  );
  return json({ response, errors });
};

export const unstable_shouldReload: ShouldReloadFunction = ({ url, prevUrl }) => {
  if (
    url.searchParams.get("i") !== prevUrl.searchParams.get("i") ||
    url.searchParams.get("lang-src") !== prevUrl.searchParams.get("lang-src") ||
    url.searchParams.get("lang-out") !== prevUrl.searchParams.get("lang-out")
  ) {
    return false;
  }

  return false;
};

const DEFAULT_SOURCE_CODES: Record<keyof typeof TRANSPILER_MAP, string> = {
  c: `
int main() {
    printf("Hello, World!");
}
`.trimStart(),
  lua: `
a = 1 + 2
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

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isTranspiling, setIsTranspiling] = useState(false);
  const [transpilationNotificationId, setTranspilationNotificationId] = useState<string>("");
  const [outputCode, setOutputCode] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<api.SubmissionStatus>("pending");

  const updateInputQueryParam = debounce((value: string | undefined) => {
    searchParams.set("i", encodeURIComponent(compressToBase64(value ?? "")));
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true, state: { scroll: false } });
  }, 1000);

  const updateSourceLanguageQueryParam = debounce((value: string | undefined) => {
    searchParams.set("lang-src", encodeURIComponent(value ?? ""));
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true, state: { scroll: false } });
  }, 1000);

  const updateTargetLanguageQueryParam = debounce((value: string | undefined) => {
    searchParams.set("lang-out", encodeURIComponent(value ?? ""));
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

        const startDate = new Date(submissionData.processing_started_at);
        const endDate = new Date(submissionData.processing_finished_at);

        if (submissionData.status === "done") {
          const outputCode = atob(submissionData.data);
          setOutputCode(outputCode);

          updateNotification({
            id: transpilationNotificationId,
            autoClose: true,
            disallowClose: false,
            color: "green",
            title: "Transpilation success!",
            message: `It took ${(endDate.getTime() - startDate.getTime()) / 1000} seconds`,
          });

          if (/(sananes)|(ecalle)|(20\/20)/gi.test(outputCode ?? "")) {
            realisticConfettis();
          }
        } else if (submissionData.status === "failed") {
          setOutputCode(submissionData.reason);

          updateNotification({
            id: transpilationNotificationId,
            autoClose: true,
            disallowClose: false,
            color: "red",
            title: "An error occured!",
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
    sourceLanguage: keyof typeof TRANSPILER_MAP;
    targetLanguage: string;
    sourceCode: string;
  };

  let sourceLanguage = (searchParams.get("lang-src") ?? "c") as keyof typeof TRANSPILER_MAP;
  let targetLanguage = searchParams.get("lang-out") ?? "go";

  if (!(sourceLanguage in TRANSPILER_MAP)) {
    sourceLanguage = "c";
  }

  if (!(targetLanguage in TRANSPILER_MAP[sourceLanguage])) {
    targetLanguage = TRANSPILER_MAP[sourceLanguage].targets[0].value;
  }

  let sourceCode = searchParams.get("i");
  if (sourceCode) {
    try {
      sourceCode = decompressFromBase64(decodeURIComponent(sourceCode));
    } catch {}
  }

  if (!sourceCode) {
    sourceCode = DEFAULT_SOURCE_CODES[sourceLanguage];
  }

  return (
    <Formik<FormValues>
      initialValues={{
        sourceLanguage,
        targetLanguage,
        sourceCode,
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
                  <Select
                    {...field}
                    label="Source language"
                    data={Object.entries(TRANSPILER_MAP).map(([value, { label }]) => ({ value, label }))}
                    error={meta.error}
                    onChange={(sourceLanguage: keyof typeof TRANSPILER_MAP) => {
                      props.setFieldValue("sourceLanguage", sourceLanguage);
                      updateSourceLanguageQueryParam(sourceLanguage);

                      const isCurrentTargetLanguageAvailable = TRANSPILER_MAP[sourceLanguage].targets.some(
                        (target) => target.value === props.values.targetLanguage
                      );

                      if (!isCurrentTargetLanguageAvailable) {
                        const targetLanguage = TRANSPILER_MAP[sourceLanguage].targets[0].value;

                        props.setFieldValue("targetLanguage", targetLanguage);
                        props.setFieldValue("sourceCode", DEFAULT_SOURCE_CODES[sourceLanguage]);

                        updateTargetLanguageQueryParam(targetLanguage);
                      }
                    }}
                  />
                )}
              </Field>

              <br />

              <Field name="targetLanguage" isRequired>
                {({ field, meta }: FieldProps<FormValues["targetLanguage"]>) => (
                  <Select
                    {...field}
                    label="Target language"
                    data={TRANSPILER_MAP[props.values.sourceLanguage].targets}
                    error={meta.error}
                    onChange={(targetLanguage: string) => {
                      props.setFieldValue("targetLanguage", targetLanguage);

                      updateTargetLanguageQueryParam(targetLanguage);
                    }}
                  />
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
