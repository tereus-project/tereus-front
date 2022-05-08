import { Icon, Input, InputGroup, InputLeftElement, InputProps } from "@chakra-ui/react";
import { useRef } from "react";
import { FiFile } from "react-icons/fi";

export type FileUploadProps = Omit<InputProps, "value"> & {
  value: File | null;
  setFieldValue: (file: File | undefined) => void;
};

export function FileUpload({
  id,
  name,
  value,
  onChange,
  onBlur,
  onClick,
  multiple,
  setFieldValue,
  ...props
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <Icon as={FiFile} />
      </InputLeftElement>

      <input
        id={id}
        type="file"
        multiple={multiple}
        ref={inputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          setFieldValue(e.target.files?.[0]);
        }}
        onBlur={onBlur}
      />

      <Input
        onClick={(e) => {
          onClick?.(e);

          if (!e.defaultPrevented) {
            inputRef.current?.click();
          }
        }}
        readOnly={true}
        value={value?.name ?? ""}
        cursor="pointer"
        {...props}
      />
    </InputGroup>
  );
}
