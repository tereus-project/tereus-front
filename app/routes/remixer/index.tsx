import { CriteriaWithPagination, EuiBasicTable, EuiFieldText, EuiFilePicker, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiProgress, EuiSelect, EuiSpacer } from "@elastic/eui";
import { useState } from "react";
import { useLoaderData } from "remix";
import { Page } from "~/components/Page";

interface Source {
  id: string;
  name: string;
  sourceLanguage: string;
  targetLanguage: string;
  progress: number;
}

export const loader = async () => {
  return [
    {
      id: '2e7d5e7d-18a1-49fe-93f0-52951e0ec93a',
      name: 'Test 1',
      sourceLanguage: 'c',
      targetLanguage: 'go',
      progress: 0.5,
    },
    {
      id: '6d92c9d7-b74c-42fd-8f24-128c99608d30',
      name: 'Test 2',
      sourceLanguage: 'c',
      targetLanguage: 'c',
      progress: 0.5,
    },
  ] as Source[];
};

export default function Remixer() {
  const sources = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('');

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number | 'all'>(10);

  const updateSourceFile = (files: FileList | null) => {
    if (files === null || files.length === 0) {
      setSourceFile(null);
      return;
    }

    setSourceFile(files[0]);
    setSourceName(files[0].name);
  };

  const onTableChange = ({ page }: CriteriaWithPagination<Source>) => {
    const { index: pageIndex, size: pageSize } = page;

    setPageIndex(pageIndex);
    setPageSize(pageSize);
  };

  return (
    <Page title="Remixer" icon="compute">
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiFormRow label="Source name">
            <EuiFieldText
              placeholder="Source name"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
            />
          </EuiFormRow>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiFormRow label="Source files">
            <EuiFilePicker
              display="default"
              onChange={updateSourceFile}
              accept=".zip"
            />
          </EuiFormRow>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiFormRow label="Source language">
            <EuiSelect
              options={[
                {
                  value: 'c',
                  text: 'C',
                },
              ]}
              placeholder="Example: C, C++, Fortran"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
            />
          </EuiFormRow>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiFormRow label="Target language">
            <EuiSelect
              options={[
                {
                  value: 'go',
                  text: 'Go',
                },
              ]}
              placeholder="Example: Go, Python, TypeScript"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />

      <EuiBasicTable
        tableCaption="Demo for EuiBasicTable with pagination"
        items={sources}
        columns={[
          {
            field: 'name',
            name: 'Name',
            truncateText: true,
          },
          {
            field: 'sourceLanguage',
            name: 'Source language',
            truncateText: true,
          },
          {
            field: 'targetLanguage',
            name: 'Target language',
            truncateText: true,
          },
          {
            field: 'progress',
            name: 'Progress',
            render: (_, item) => {
              return <EuiProgress value={item.progress * 100} max={100} size="m" />
            },
          },
        ]}
        // pagination={{
        //   pageIndex,
        //   pageSize,
        //   totalItemCount: sources.length,
        //   pageSizeOptions: [10, 20, 50, 100, 'all'],
        //   showPerPageOptions: true,
        // }}
        // onChange={onTableChange}
      />
    </Page>
  );
}
