import { Alert, List } from "@mantine/core";
import { AlertCircle } from "tabler-icons-react";

export interface ErrorListProps {
  title?: string;
  errors?: string[] | null;
}

export function ErrorList({ title = "An error occured!", errors }: ErrorListProps) {
  if (!errors) {
    return null;
  }

  return (
    <Alert icon={<AlertCircle size={16} />} title={title} color="red" mb={12}>
      <List>
        {errors.map((error) => (
          <List.Item key={error}>{error}</List.Item>
        ))}
      </List>
    </Alert>
  );
}
