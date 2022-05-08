import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Select,
  Stack,
  useToast,
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useSubmit, useTransition } from "@remix-run/react";
import type { FieldProps } from "formik";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import type { ActionFormData } from "~/api";
import * as api from "~/api";
import { sessionCookie } from "~/cookie";

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
  const submit = useSubmit();
  const transition = useTransition();
  const actionData = useActionData<ActionFormData<api.RemixResponseDTO>>();

  const toast = useToast();

  const [isRemixing, setIsRemixing] = useState(false);
  const [outputCode, setOutputCode] = useState("");

  const poll = async (id: string) => {
    const res = await fetch(`/download/${id}/main`);

    if (res.ok && res.status !== 204) {
      setIsRemixing(false);
      setOutputCode(await res.text());

      toast({
        title: "Remixing success!",
        status: "success",
      });
    } else if (res.status === 204) {
      setIsRemixing(false);

      toast({
        isClosable: true,
        title: "No main file found",
        status: "error",
        description: "This might be a server error. Please try again later.",
      });
    } else if (res.status !== 404) {
      setIsRemixing(false);
      const data = await res.json();

      toast({
        isClosable: true,
        title: "An error occured",
        status: "error",
        description: data?.errors?.join("\n") ?? res.statusText,
      });
    } else {
      setTimeout(() => poll(id), 400);
    }
  };

  useEffect(() => {
    if (transition.state === "loading") {
      if (actionData?.response) {
        toast({
          isClosable: true,
          title: "Remixing started!",
          status: "info",
        });

        setIsRemixing(true);
        setTimeout(() => poll(actionData.response.id), 400);
      } else if (actionData?.errors) {
        toast({
          isClosable: true,
          title: "An error occured",
          status: "error",
          description: actionData.errors.join("\n"),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition]);

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
        sourceCode: "",
      }}
      onSubmit={(values, actions) => {
        const formData = new FormData();
        formData.append("sourceLanguage", values.sourceLanguage);
        formData.append("targetLanguage", values.targetLanguage);
        formData.append("sourceCode", values.sourceCode);

        submit(formData, { method: "post", encType: "multipart/form-data" });
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
                      }}
                      language={props.values.sourceLanguage}
                      height="500px"
                    />
                  </FormControl>
                )}
              </Field>
            </Box>

            <Button paddingX={10} colorScheme="teal" isLoading={props.isSubmitting || isRemixing} type="submit">
              Submit
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
