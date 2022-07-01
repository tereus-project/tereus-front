import { Button, Container, createStyles, Group, Text, Title, useMantineTheme } from "@mantine/core";
import { Link } from "@remix-run/react";
import { AnimatedTerminal } from "~/components/AnimatedTerminal";
import { Page } from "~/components/Page";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    paddingTop: 120,
    paddingBottom: 80,

    "@media (max-width: 755px)": {
      paddingTop: 80,
      paddingBottom: 60,
    },
  },

  inner: {
    position: "relative",
    zIndex: 1,
  },

  title: {
    textAlign: "center",
    fontWeight: 800,
    fontSize: 40,
    letterSpacing: -1,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    marginBottom: theme.spacing.xs,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,

    "@media (max-width: 520px)": {
      fontSize: 28,
      textAlign: "left",
    },
  },

  description: {
    textAlign: "center",

    "@media (max-width: 520px)": {
      textAlign: "left",
      fontSize: theme.fontSizes.md,
    },
  },

  controls: {
    marginTop: theme.spacing.lg,
    display: "flex",
    justifyContent: "center",

    "@media (max-width: 520px)": {
      flexDirection: "column",
    },
  },

  control: {
    "&:not(:first-of-type)": {
      marginLeft: theme.spacing.md,
    },

    "@media (max-width: 520px)": {
      height: 42,
      fontSize: theme.fontSizes.md,

      "&:not(:first-of-type)": {
        marginTop: theme.spacing.md,
        marginLeft: 0,
      },
    },
  },
}));

export default function Index() {
  const { classes } = useStyles();
  const theme = useMantineTheme();

  return (
    <Page containerFluid headerFluid>
      <Container className={classes.wrapper} size={1400}>
        <div className={classes.inner}>
          <Title className={classes.title}>
            Automated{" "}
            <Text component="span" color={theme.primaryColor} inherit>
              code transpilation
            </Text>{" "}
          </Title>

          <Container p={0} size={600}>
            <Text size="lg" color="dimmed" className={classes.description}>
              Transform legacy code to the most modern programming languages and improve your codebase maintainability
              with just a click.
            </Text>
          </Container>

          <Group className={classes.controls}>
            <Button
              component={Link}
              to="/transpiler/inline"
              className={classes.control}
              size="lg"
              variant="default"
              color="gray"
            >
              Get started
            </Button>
            <Button component={Link} to="/pricing" className={classes.control} size="lg">
              Upgrade to Pro
            </Button>
          </Group>
        </div>
      </Container>

      <Container>
        <AnimatedTerminal />
      </Container>
    </Page>
  );
}
