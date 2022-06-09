import type { MantineNumberSize } from "@mantine/core";
import { Container, Stack, Title } from "@mantine/core";
import { ArrowBigUpLines, BrandGithub, Cpu, History, Home } from "tabler-icons-react";
import type { GetCurrentUserResponseDTO } from "~/api";
import { ResponsiveHeader } from "./Header";

export type PageProps = React.PropsWithChildren<{
  title?: string;
  subtitle?: string;
  user?: GetCurrentUserResponseDTO;
  containerSize?: MantineNumberSize;
  containerFluid?: boolean;
  headerSize?: MantineNumberSize;
  headerFluid?: boolean;
}>;

export function Page({
  children,
  title,
  subtitle,
  user,
  containerSize,
  containerFluid,
  headerSize,
  headerFluid,
}: PageProps) {
  return (
    <Stack>
      <ResponsiveHeader
        user={user}
        links={[
          { to: "/", label: "Home", leftIcon: <Home size={16} /> },
          { to: "/pricing", label: user ? "Subscription" : "Pricing", leftIcon: <ArrowBigUpLines size={16} /> },
          { to: "/remixer/inline", label: "Transpilers", leftIcon: <Cpu size={16} /> },
          { to: "/history", label: "History", leftIcon: <History size={16} /> },
          { href: "https://github.com/tereus-project", label: <BrandGithub size={16} />, target: "_blank" },
        ]}
      />

      <main>
        <Container size={containerSize} fluid={containerFluid} mb={18}>
          <Container size={headerSize ?? containerSize} px={0} fluid={headerFluid}>
            <Stack mb={14} spacing={2}>
              <Title order={1}>{title}</Title>
              {subtitle && (
                <Title
                  order={2}
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
      {/* <VStack>
        <Box as="main" width="full" padding={4}>
          <Container maxW={headingMaxW} as="header" mb={4}>
            <Stack spacing={{ base: "2", md: "3" }} textAlign="center">
              <Heading>{title}</Heading>
              <HStack spacing="1" justify="center">
                <Text color="muted">{subtitle}</Text>
              </HStack>
            </Stack>
          </Container>

          {children}
        </Box>
      </VStack> */}
    </Stack>
  );
}
