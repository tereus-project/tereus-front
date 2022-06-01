import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Kbd,
  Select,
  Stack,
  useToast,
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLocation, useNavigate } from "@remix-run/react";
import type { FieldProps } from "formik";
import { Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { useAuthenticityToken, verifyAuthenticityToken } from "remix-utils";
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

export default function RemixerInline() {
  const csrf = useAuthenticityToken();

  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

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

          toast({
            isClosable: true,
            title: "An error occured",
            status: "error",
            description: remixingInlineResultFetcher.data.errors.join("\n"),
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

        toast({
          isClosable: true,
          title: "Remixing success!",
          status: "success",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remixingInlineResultFetcher]);

  const remixingFetcher = useFetcher<ActionFormData<api.RemixResponseDTO>>();
  useEffect(() => {
    if (remixingFetcher.type === "done") {
      if (remixingFetcher.data?.response) {
        toast({
          isClosable: true,
          title: "Remixing started!",
          status: "info",
        });

        setTimeout(() => remixingInlineResultFetcher.load(`/download/${remixingFetcher.data.response!.id}/main`), 600);
      } else if (remixingFetcher.data?.errors) {
        toast({
          isClosable: true,
          title: "An error occured",
          status: "error",
          description: remixingFetcher.data.errors.join("\n"),
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
        sourceCode: sourceCode ?? "",
      }}
      onSubmit={(values, actions) => {
        remixingFetcher.submit({ csrf, ...values }, { replace: true, method: "post" });
        actions.setSubmitting(false);
      }}
    >
      {(props) => (
        <Form>
          <Container>
            <Box borderWidth="1px" borderRadius="lg" p={4} shadow="md">
              <Field name="sourceLanguage" isRequired>
                {({ field, meta }: FieldProps<FormValues["sourceLanguage"]>) => (
                  <FormControl isInvalid={!!meta.error && meta.touched}>
                    <FormLabel htmlFor="sourceLanguage">Source language</FormLabel>
                    <Select {...field} id="sourceLanguage">
                      <option value="c">C</option>
                    </Select>
                    <FormErrorMessage>{meta.error}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <br />

              <Field name="targetLanguage" isRequired>
                {({ field, meta }: FieldProps<FormValues["targetLanguage"]>) => (
                  <FormControl isInvalid={!!meta.error && meta.touched}>
                    <FormLabel htmlFor="targetLanguage">Target language</FormLabel>
                    <Select {...field} id="targetLanguage">
                      <option value="go">Go</option>
                    </Select>
                    <FormErrorMessage>{meta.error}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
            </Box>
          </Container>

          <br />

          <Stack direction={["column", "column", "column", "row"]}>
            <Box borderWidth="1px" borderRadius="lg" p={4} shadow="md" width="full">
              <Field name="sourceCode" isRequired>
                {({ field, meta }: FieldProps<FormValues["sourceCode"]>) => (
                  <FormControl isInvalid={!!meta.error && meta.touched} isRequired>
                    <FormLabel htmlFor="sourceCode">Source Code</FormLabel>
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
                  </FormControl>
                )}
              </Field>
            </Box>

            <Button paddingX={10} colorScheme="teal" isLoading={props.isSubmitting || isRemixing} type="submit">
              Submit (
              <Kbd backgroundColor="gray.700" borderColor="gray.800">
                ⌘
              </Kbd>{" "}
              +{" "}
              <Kbd backgroundColor="gray.700" borderColor="gray.800">
                ↵
              </Kbd>
              )
            </Button>

            <Box borderWidth="1px" borderRadius="lg" p={4} shadow="md" width="full">
              <FormLabel as="div">Output code</FormLabel>
              <Editor
                language={props.values.targetLanguage}
                height="500px"
                options={{
                  readOnly: true,
                }}
                value={outputCode}
              />
            </Box>
          </Stack>
        </Form>
      )}
    </Formik>
  );
}
