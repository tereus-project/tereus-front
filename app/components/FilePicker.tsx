import type { MantineTheme } from "@mantine/core";
import { ActionIcon, Group, Stack, Text, useMantineTheme } from "@mantine/core";
import type { DropzoneStatus } from "@mantine/dropzone";
import { Dropzone } from "@mantine/dropzone";
import { useState } from "react";
import type { Icon } from "tabler-icons-react";
import { FileZip, Upload, X } from "tabler-icons-react";

function UploadIcon({ status, ...props }: React.ComponentProps<Icon> & { status: DropzoneStatus }) {
  if (status.accepted) {
    return <Upload {...props} />;
  }

  if (status.rejected) {
    return <X {...props} />;
  }

  return <FileZip {...props} />;
}

function getIconColor(status: DropzoneStatus, theme: MantineTheme) {
  return status.accepted
    ? theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 4 : 6]
    : status.rejected
    ? theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]
    : theme.colorScheme === "dark"
    ? theme.colors.dark[0]
    : theme.colors.gray[7];
}

export interface FilePickerProps {
  onChange: (files: File[]) => void;
  multiple?: boolean;
}

export function FilePicker({ onChange, multiple = false }: FilePickerProps) {
  const theme = useMantineTheme();
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = (dropped: File[]) => {
    if (!multiple) {
      setFiles(dropped);
      onChange(dropped);
    } else {
      const newFiles = [...files, ...dropped];
      setFiles(newFiles);
      onChange(newFiles);
    }
  };

  return (
    <Stack>
      {(multiple || files.length === 0) && (
        <Dropzone multiple={multiple} onDrop={onDrop} maxSize={20 * 1024 ** 2} accept={[".zip"]}>
          {(status) => (
            <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: "none" }}>
              <UploadIcon status={status} style={{ color: getIconColor(status, theme) }} size={80} />

              <div>
                <Text size="xl" inline>
                  Drag a zip file or click to select file
                </Text>
                <Text size="sm" color="dimmed" inline mt={7}>
                  File should not exceed 20MB
                </Text>
              </div>
            </Group>
          )}
        </Dropzone>
      )}

      <Stack>
        {files.map((file, i) => (
          <div key={`file-${i}`}>
            <Group>
              <ActionIcon
                onClick={() => {
                  setFiles(files.slice(0, i).concat(files.slice(i + 1)));
                }}
              >
                <X size={16} color="red" />
              </ActionIcon>
              <Text>{file.name}</Text>
            </Group>
          </div>
        ))}
      </Stack>
    </Stack>
  );
}
