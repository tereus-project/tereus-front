import {
  Anchor,
  Box,
  Burger,
  Button,
  createStyles,
  Divider,
  Group,
  Header,
  Image,
  Menu,
  Paper,
  Transition,
  UnstyledButton,
} from "@mantine/core";
import { useBooleanToggle } from "@mantine/hooks";
import { Link, useFetcher } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import type { To } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuthenticityToken } from "remix-utils";
import { ChevronDown, Logout, PlayerPause, Settings, SwitchHorizontal, Trash } from "tabler-icons-react";
import type { GetCurrentUserResponseDTO } from "~/api.server";
import { UserAvatar } from "./UserAvatar";

const HEADER_HEIGHT = 60;

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
    zIndex: 1,
  },

  userMenu: {
    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },

  dropdown: {
    position: "absolute",
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: "hidden",

    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    marginRight: "32px",
    marginLeft: "32px",
  },

  links: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[1],
    },

    [theme.fn.smallerThan("sm")]: {
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.fn.rgba(theme.colors[theme.primaryColor][9], 0.25)
          : theme.colors[theme.primaryColor][0],
      color: theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 3 : 7],
    },
  },
}));

export interface ResponsiveHeaderProps {
  user?: GetCurrentUserResponseDTO | null;
  links: {
    to?: To;
    href?: string;
    label: React.ReactNode;
    target?: React.HTMLAttributeAnchorTarget;
    leftIcon?: React.ReactNode;
    hidden?: boolean;
  }[];
}

export function ResponsiveHeader({ user, links }: ResponsiveHeaderProps) {
  const { classes, cx } = useStyles();

  const csrf = useAuthenticityToken();
  const navigate = useNavigate();

  const [opened, toggleOpened] = useBooleanToggle(false);
  const [, setUserMenuOpened] = useState(false);

  const logoutFetcher = useFetcher();
  const logout = () => logoutFetcher.submit({ csrf }, { method: "post", action: "/auth/logout" });
  useEffect(() => {
    if (logoutFetcher.type === "done") {
      navigate("/login", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoutFetcher]);

  const Items = links.map(({ to, href, label, target, leftIcon, hidden = false }) => {
    if (hidden) {
      return null;
    }

    return (
      <Button<typeof Link | "a">
        key={`header-link-${to ?? href}`}
        variant="subtle"
        component={to ? Link : "a"}
        to={to!}
        href={href!}
        target={target}
        className={cx(classes.link)}
        leftIcon={leftIcon}
        onClick={() => {
          toggleOpened(false);
        }}
      >
        {label}
      </Button>
    );
  });

  return (
    <Header height={HEADER_HEIGHT} className={classes.root}>
      <div className={classes.header}>
        <Anchor variant="text" component={Link} to="/">
          <Group>
            <Image height="40px" width="40px" src="/images/logo.png" />
            <Box>Tereus</Box>
          </Group>
        </Anchor>

        <Group spacing={5} className={classes.links}>
          {Items}

          {user && (
            <Menu
              size={260}
              placement="end"
              transition="pop-top-right"
              className={classes.userMenu}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              control={
                <UnstyledButton className={cx(classes.link)}>
                  <Group spacing={7}>
                    <UserAvatar email={user.email} size={20} />
                    <ChevronDown size={12} />
                  </Group>
                </UnstyledButton>
              }
            >
              <Menu.Label>Settings</Menu.Label>
              <Menu.Item icon={<Settings size={14} />} component={Link} to="/settings/profile">
                Account settings
              </Menu.Item>
              <Menu.Item icon={<Logout size={14} />} onClick={logout}>
                Logout
              </Menu.Item>
              <Divider />

              <Menu.Label>Danger zone</Menu.Label>
              {user.subscription ? (
                <Menu.Item icon={<PlayerPause size={14} />} component={Link} to="/pricing">
                  Manage subscription
                </Menu.Item>
              ) : (
                <Menu.Item icon={<SwitchHorizontal size={14} />} component={Link} to="/pricing">
                  Upgrade
                </Menu.Item>
              )}
              <Menu.Item color="red" icon={<Trash size={14} />} component={Link} to="/settings/data">
                Delete account
              </Menu.Item>
            </Menu>
          )}
        </Group>
        <Burger opened={opened} onClick={() => toggleOpened()} className={classes.burger} size="sm" />
        <Transition transition="pop-top-right" duration={200} mounted={opened}>
          {(styles) => (
            <Paper className={classes.dropdown} withBorder style={styles}>
              {Items}
            </Paper>
          )}
        </Transition>
      </div>
    </Header>
  );
}
