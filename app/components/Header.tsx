import {
  Avatar,
  Box,
  Burger,
  Button,
  createStyles,
  Divider,
  Group,
  Header,
  Menu,
  Paper,
  Transition,
  UnstyledButton,
} from "@mantine/core";
import { useBooleanToggle } from "@mantine/hooks";
import { Link } from "@remix-run/react";
import md5 from "md5";
import React, { useState } from "react";
import type { To } from "react-router-dom";
import { ChevronDown, Logout, PlayerPause, Settings, SwitchHorizontal, Trash } from "tabler-icons-react";
import type { GetCurrentUserResponseDTO } from "~/api";

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
  user?: GetCurrentUserResponseDTO;
  links: {
    to?: To;
    href?: string;
    label: React.ReactNode;
    target?: React.HTMLAttributeAnchorTarget;
    leftIcon?: React.ReactNode;
  }[];
}

export function ResponsiveHeader({ user, links }: ResponsiveHeaderProps) {
  const { classes, cx } = useStyles();

  const [opened, toggleOpened] = useBooleanToggle(false);
  const [, setUserMenuOpened] = useState(false);

  const Items = links.map(({ to, href, label, target, leftIcon }) => {
    if (to) {
      return (
        <Button<typeof Link>
          key={`header-link-${to}`}
          variant="subtle"
          component={Link}
          to={to}
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
    }

    return (
      <a key={`header-link-${href}`} href={href} target={target} className={cx(classes.link)}>
        {label}
      </a>
    );
  });

  return (
    <Header height={HEADER_HEIGHT} className={classes.root}>
      <div className={classes.header}>
        <Box>Tereus</Box>
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
                    <Avatar
                      src={`https://www.gravatar.com/avatar/${md5(user?.email ?? "")}`}
                      alt="avater"
                      radius="xl"
                      size={20}
                    />
                    <ChevronDown size={12} />
                  </Group>
                </UnstyledButton>
              }
            >
              <Menu.Label>Settings</Menu.Label>
              <Menu.Item icon={<Settings size={14} />} component={Link} to="/account/profile">
                Account settings
              </Menu.Item>
              <Link to="/auth/logout">
                <Menu.Item icon={<Logout size={14} />}>Logout</Menu.Item>
              </Link>
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
              <Menu.Item color="red" icon={<Trash size={14} />} component={Link} to="/account/profile">
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
