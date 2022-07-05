import { Button, Card, Code, Container, Select, Tabs, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { json, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";
import type { FieldProps } from "formik";
import { Field, Form, Formik } from "formik";
import { useEffect } from "react";
import { BrandGit, FileZip } from "tabler-icons-react";
import type { ActionFormData } from "~/api.server";
import * as api from "~/api.server";
import { FilePicker } from "~/components/FilePicker";
import { getSession } from "~/sessions.server";
import { TRANSPILER_MAP } from "../transpiler";

export const meta: MetaFunction = () => ({
  title: "Zip / Git | Transpiler | Tereus",
});

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request);

  if (!session.has("token")) {
    return json({ errors: ["Not logged in"] });
  }

  const values = await unstable_parseMultipartFormData(
    request,
    unstable_createMemoryUploadHandler({
      maxPartSize: 20 * 1024 ** 2,
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
    const [response, errors] = await api.transpile.zip(sourceLanguage, targetLanguage, values, session.get("token"));
    return json({ response, errors });
  } else if (mode === "git") {
    const gitRepo = values.get("gitRepo")?.toString();

    if (!gitRepo) {
      return json({ errors: ["Missing git repo"] });
    }

    const [response, errors] = await api.transpile.git(
      sourceLanguage,
      targetLanguage,
      {
        git_repo: gitRepo,
      },
      session.get("token")
    );

    return json({ response, errors });
  }

  return json({ errors: ["Unknown mode"] });
};

export default function RemixerZip() {
  const fetcher = useFetcher<ActionFormData<api.TranspileResponseDTO>>();

  const modes = ["zip", "git"];

  useEffect(() => {
    if (fetcher.state === "loading" && fetcher.data?.response) {
      showNotification({
        color: "green",
        title: "New source added",
        message: (
          <>
            Source <Code>{fetcher.data.response.id}</Code> added. Remixing will start soon. You can check the{" "}
            <Link to="/history">history page</Link> for status.
          </>
        ),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher]);

  type FormValues = {
    sourceLanguage: keyof typeof TRANSPILER_MAP;
    targetLanguage: string;
    mode: string;
    gitRepo: string;
    file: File | null;
  };

  return (
    <Container size="sm">
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

          fetcher.submit(formData, { replace: true, method: "post", encType: "multipart/form-data" });
          actions.setSubmitting(false);
        }}
      >
        {(props) => (
          <Form>
            <Card shadow="sm" withBorder>
              <Field name="sourceLanguage" isRequired>
                {({ field, meta }: FieldProps<FormValues["sourceLanguage"]>) => (
                  <Select
                    {...field}
                    label="Source language"
                    data={Object.entries(TRANSPILER_MAP).map(([value, { label }]) => ({ value, label }))}
                    error={meta.error}
                    onChange={(value: keyof typeof TRANSPILER_MAP) => {
                      props.setFieldValue("sourceLanguage", value);

                      const isCurrentTargetLanguageAvailable = TRANSPILER_MAP[value].targets.some(
                        (target) => target.value === props.values.targetLanguage
                      );

                      if (!isCurrentTargetLanguageAvailable) {
                        props.setFieldValue("targetLanguage", TRANSPILER_MAP[value].targets[0].value);
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
                  />
                )}
              </Field>
            </Card>

            <br />

            <Tabs
              variant="outline"
              onTabChange={(index: number) => props.setFieldValue("mode", modes[index])}
              styles={{
                tabsListWrapper: {
                  zIndex: 1,
                  backgroundColor: "white",
                  position: "relative",
                },
                body: {
                  paddingTop: 0,
                },
              }}
            >
              <Tabs.Tab label="Zip" icon={<FileZip size={16} />}>
                <Card
                  shadow="sm"
                  withBorder
                  sx={() => ({
                    borderTop: 0,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                  })}
                >
                  <Field name="file">
                    {({ field, meta }: FieldProps<FormValues["file"]>) => (
                      <FilePicker
                        onChange={(files) => {
                          props.setFieldValue("file", files[0]);
                        }}
                      />
                    )}
                  </Field>

                  <Button
                    mt={16}
                    color="blue"
                    loading={props.isSubmitting || fetcher.state === "submitting"}
                    type="submit"
                  >
                    Send to queue
                  </Button>
                </Card>
              </Tabs.Tab>
              <Tabs.Tab label="Git" icon={<BrandGit size={16} />}>
                <Card
                  shadow="sm"
                  withBorder
                  sx={() => ({
                    borderTop: 0,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                  })}
                >
                  <Field name="gitRepo">
                    {({ field, meta }: FieldProps<FormValues["gitRepo"]>) => (
                      <TextInput
                        {...field}
                        placeholder="https://github.com/sqlite/sqlite"
                        label="Git repository"
                        required={props.values.mode === "git"}
                        error={meta.error}
                      />
                    )}
                  </Field>

                  <Button
                    mt={16}
                    color="blue"
                    loading={props.isSubmitting || fetcher.state === "submitting"}
                    type="submit"
                  >
                    Send to queue
                  </Button>
                </Card>
              </Tabs.Tab>
            </Tabs>
            {/* <Box borderWidth="1px" borderRadius="lg" p={4} shadow="md">
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
                    isLoading={props.isSubmitting || fetcher.state === "submitting"}
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
                    isLoading={props.isSubmitting || fetcher.state === "submitting"}
                    type="submit"
                  >
                    Submit
                  </Button>
                </TabPanel>
              </TabPanels>
            </Box>
          </Tabs> */}
          </Form>
        )}
      </Formik>
    </Container>
  );
}
