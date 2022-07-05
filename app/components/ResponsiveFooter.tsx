import { Box, Container, createStyles, Group, Text } from "@mantine/core";
import { Link } from "@remix-run/react";
import type { HTMLAttributeAnchorTarget } from "react";
import type { To } from "react-router-dom";
import Image from "remix-image";

const useStyles = createStyles((theme) => ({
  footer: {
    marginTop: 0,
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.xl * 2,
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[1],
    borderTop: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]}`,
  },

  logo: {
    maxWidth: 200,

    [theme.fn.smallerThan("sm")]: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
  },

  description: {
    marginTop: 5,

    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.xs,
      textAlign: "center",
    },
  },

  inner: {
    display: "flex",
    justifyContent: "space-between",

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
      alignItems: "center",
    },
  },

  groups: {
    display: "flex",
    flexWrap: "wrap",

    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  wrapper: {
    width: 160,
  },

  link: {
    display: "block",
    color: theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[6],
    fontSize: theme.fontSizes.sm,
    paddingTop: 3,
    paddingBottom: 3,

    "&:hover": {
      textDecoration: "underline",
    },
  },

  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 700,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    marginBottom: theme.spacing.xs / 2,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
  },

  afterFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    borderTop: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]}`,

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
    },
  },
}));

interface ResponsiveFooterProps {
  data: {
    title: string;
    links: {
      label: string;
      href?: string;
      to?: To;
      target?: HTMLAttributeAnchorTarget;
    }[];
  }[];
}

export function ResponsiveFooter({ data }: ResponsiveFooterProps) {
  const { classes } = useStyles();

  const groups = data.map((group) => {
    const links = group.links.map(({ label, href, to, target }, index) => (
      <Text<typeof Link | "a">
        key={index}
        className={classes.link}
        component={to ? Link : "a"}
        to={to!}
        href={href!}
        target={target}
      >
        {label}
      </Text>
    ));

    return (
      <div className={classes.wrapper} key={group.title}>
        <Text className={classes.title}>{group.title}</Text>
        {links}
      </div>
    );
  });

  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <Group>
            <Image
              src="/images/logo.png"
              style={{
                borderRadius: "50%",
                minWidth: "40px !important",
                minHeight: "40px !important",
                maxWidth: "40px !important",
                maxHeight: "40px !important",
              }}
              responsive={[
                {
                  size: {
                    width: 80,
                    height: 80,
                  },
                },
              ]}
              options={{
                quality: 80,
                compressionLevel: 9,
              }}
            />
            <Box>Tereus</Box>
          </Group>
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>
      <Container className={classes.afterFooter}>
        <Text color="dimmed" size="sm">
          © 2022 tereus.dev. All rights reserved.
        </Text>
      </Container>
    </footer>
  );
}
