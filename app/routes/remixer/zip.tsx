import {
  Box,
  Button,
  Code,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Link as ChakraLink,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
} from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { json, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { useActionData, useSubmit, useTransition } from "@remix-run/react";
import type { FieldProps } from "formik";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import type { ActionFormData } from "~/api";
import * as api from "~/api";
import { FileUpload } from "~/components/FileUpload";
import { sessionCookie } from "~/cookie";

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
  }

  return json({ errors: ["Unknown mode"] });
};

export default function RemixerZip() {
  const submit = useSubmit();
  const transition = useTransition();
  const actionData = useActionData<ActionFormData<api.RemixResponseDTO>>();

  const toast = useToast();

  const modes = ["zip", "git"];
  const [mode, setMode] = useState(modes[0]);

  useEffect(() => {
    if (transition.state === "loading" && actionData?.response) {
      toast({
        isClosable: true,
        title: "New source added",
        status: "success",
        description: (
          <>
            Source <Code>{actionData.response.id}</Code> added. Remixing will start soon. You can check the{" "}
            <ChakraLink href="/history">history page</ChakraLink> for status.
          </>
        ),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition]);

  type FormValues = {
    sourceLanguage: string;
    targetLanguage: string;
    mode: string;
    gitRepo: string;
    file: File | null;
  };

  return (
    <Container>
      <Formik<FormValues>
        initialValues={{
          sourceLanguage: "c",
          targetLanguage: "go",
          mode: "zip" as "zip" | "git",
          gitRepo: "",
          file: null,
        }}
        onSubmit={(values, actions) => {
          const formData = new FormData();
          formData.append("mode", values.mode);
          formData.append("sourceLanguage", values.sourceLanguage);
          formData.append("targetLanguage", values.targetLanguage);

          if (values.mode === "git") {
            formData.append("gitRepo", values.gitRepo);
          } else {
            formData.append("file", values.file as File);
          }

          console.log(formData);

          submit(formData, { method: "post", encType: "multipart/form-data" });
          actions.setSubmitting(false);
        }}
      >
        {(props) => (
          <Form>
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

            <br />

            <Field name="mode">
              {({ field, meta }: FieldProps<FormValues["mode"]>) => (
                <input {...field} id="mode" type="hidden" value={mode} />
              )}
            </Field>

            <Tabs
              isFitted
              variant="enclosed"
              index={modes.findIndex((m) => m === mode)}
              onChange={(index) => setMode(modes[index])}
            >
              <TabList>
                <Tab>Zip</Tab>
                <Tab>Git</Tab>
              </TabList>

              <Box borderWidth="1px" borderRadius="lg" borderTopRadius="none" p={4} shadow="md">
                <TabPanels>
                  <TabPanel>
                    <Field name="file">
                      {({ field, meta }: FieldProps<FormValues["file"]>) => (
                        <FormControl isInvalid={!!meta.error && meta.touched} isRequired={mode === "zip"}>
                          <FormLabel htmlFor="file">Zip file</FormLabel>
                          <FileUpload
                            {...field}
                            id="file"
                            accept=".zip"
                            setFieldValue={(file) => props.setFieldValue("file", file)}
                            placeholder="Select a zip file"
                          />
                          <FormErrorMessage>{meta.error}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>

                    <Button
                      mt={4}
                      colorScheme="teal"
                      isLoading={props.isSubmitting || transition.state === "submitting"}
                      type="submit"
                    >
                      Submit
                    </Button>
                  </TabPanel>
                  <TabPanel>
                    <Field name="gitRepo">
                      {({ field, meta }: FieldProps<FormValues["gitRepo"]>) => (
                        <FormControl isInvalid={!!meta.error && meta.touched} isRequired={mode === "git"}>
                          <FormLabel htmlFor="gitRepo">Git repository</FormLabel>
                          <Input {...field} id="gitRepo" placeholder="https://github.com/sqlite/sqlite" />
                          <FormErrorMessage>{meta.error}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>

                    <Button
                      mt={4}
                      colorScheme="teal"
                      isLoading={props.isSubmitting || transition.state === "submitting"}
                      type="submit"
                    >
                      Submit
                    </Button>
                  </TabPanel>
                </TabPanels>
              </Box>
            </Tabs>
          </Form>
        )}
      </Formik>
    </Container>
  );
}
