import type { MantineNumberSize } from "@mantine/core";
import { Container, Stack, Title } from "@mantine/core";

export type PageProps = React.PropsWithChildren<{
  title?: string;
  subtitle?: string;
  containerSize?: MantineNumberSize;
  containerPadding?: MantineNumberSize;
  containerFluid?: boolean;
  headerSize?: MantineNumberSize;
  headerFluid?: boolean;
}>;

export function Page({
  children,
  title,
  subtitle,
  containerSize,
  containerFluid,
  containerPadding,
  headerSize,
  headerFluid,
}: PageProps) {
  return (
    <main>
      <Container
        size={containerSize}
        fluid={containerFluid}
        mb={18}
        px={containerPadding}
        sx={{ minHeight: "calc(100vh - 300px)" }}
      >
        <Container size={headerSize ?? containerSize} px={0} fluid={headerFluid}>
          <Stack mb={14} spacing={20}>
            <Title order={1}>{title}</Title>
            {subtitle && (
              <Title
                order={4}
                sx={(theme) => ({
                  color: theme.colors.gray[5],
                })}
              >
                {subtitle}
              </Title>
            )}
          </Stack>
        </Container>

        {children}
      </Container>
    </main>
  );
}
