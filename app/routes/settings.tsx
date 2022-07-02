import {
  AppShell,
  Burger,
  Group,
  Header,
  MediaQuery,
  Navbar,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { Link, Outlet, useMatches, useOutletContext } from "@remix-run/react";
import { useState } from "react";
import { ReportMoney, ShieldLock, Table, User } from "tabler-icons-react";
import { Page } from "~/components/Page";
import type { TereusContext } from "~/root";
import { authGuard } from "~/utils/authGuard.server";

export const loader: LoaderFunction = async ({ request }) => {
  await authGuard(request);
  return null;
};

export default function AccountSettings() {
  const context = useOutletContext<TereusContext>();

  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);

  const items = [
    { icon: <User size={16} />, color: "teal", label: "Profile", to: "/settings/profile" },
    { icon: <ShieldLock size={16} />, color: "grape", label: "Security", to: "/settings/security" },
    { icon: <ReportMoney size={16} />, color: "indigo", label: "Billing", to: "/settings/billing" },
    { icon: <Table size={16} />, color: "violet", label: "Data", to: "/settings/data" },
  ];

  const matches = useMatches();

  return (
    <Page title="Settings">
      <AppShell
        navbar={
          <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 200 }}>
            <Navbar.Section>
              {items.map((item) => (
                <UnstyledButton
                  component={Link}
                  to={item.to}
                  key={item.label}
                  sx={(theme) => ({
                    display: "block",
                    width: "100%",
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
                    fontWeight: matches[2].pathname === item.to ? "bold" : "normal",

                    "&:hover": {
                      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
                      cursor: "pointer",
                    },
                  })}
                >
                  <Group>
                    <ThemeIcon color={item.color} variant="light">
                      {item.icon}
                    </ThemeIcon>

                    <Text size="sm">{item.label}</Text>
                  </Group>
                </UnstyledButton>
              ))}
            </Navbar.Section>
          </Navbar>
        }
        header={
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Header height={70} p="md">
              <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </div>
            </Header>
          </MediaQuery>
        }
      >
        <Outlet context={context} />
      </AppShell>
    </Page>
  );
}
