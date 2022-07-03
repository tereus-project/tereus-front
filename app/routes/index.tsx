import {
  Button,
  Card,
  Container,
  createStyles,
  Group,
  Image,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { Link } from "@remix-run/react";
import { AnimatedTerminal } from "~/components/AnimatedTerminal";

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

const OPINIONS = [
  {
    name: "Frédéric Sananes",
    avatar: "/images/opinions/frederic.png",
    content: "20/20",
  },
  {
    name: "Thomas Ecalle",
    avatar: "/images/opinions/thomas.jpg",
    content: "An amazing tool. I love it!",
  },
  {
    name: "Martijn van Duijneveldt",
    avatar: "/images/opinions/martijn.jpg",
    content: "Tested to the extreme and works flawlessly.",
  },
  {
    name: "Christophe Delon",
    avatar: "/images/opinions/christophe.jpg",
    content: "I use this tool daily for my courses. If it's not a 20/20, I don't know what it is.",
  },
  {
    name: "Kamal Hennou",
    avatar: "/images/opinions/kamal.png",
    content: "You can welcome a new shareholder to the team.",
  },
  {
    name: "Antonin Texier",
    avatar: "/images/opinions/antonin.jpg",
    content: "What an amazing tool! Very fast response when transpiling code!",
  },
  {
    name: "Stéphane Rabenarisoa",
    avatar: "/images/opinions/stephane.jpg",
    content: "개발자로 테레우스가 너무 좋아서 우리 한국 회사에서 매일 씁니다!",
  },
  {
    name: "Khalida Ouamar",
    avatar: "/images/opinions/khalida.png",
    content: "I'll invest all my money in this project when it's going on the market!",
  },
  {
    name: "Noé Larieu Lacoste",
    avatar: "/images/opinions/noe.jpg",
    content: "It's been a while since I started using it and it's the best tool I've ever used.",
  },
  {
    name: "Rémy Machavoine",
    avatar: "/images/opinions/remy.jpg",
    content: "It's going to be a great tool for the future of software development!",
  },
  {
    name: "William Quach",
    avatar: "/images/opinions/william.jpg",
    content: "With this tool, I can now write C code and transpile it to a language I don't know!",
  },
  {
    name: "Réda Maizate",
    avatar: "/images/opinions/reda.jpg",
    content: "During my work, I cannot imagine a more useful tool than Tereus.",
  },
  {
    name: "Maxime d'Harboullé",
    avatar: "/images/opinions/maxime.jpg",
    content: "Fast and easy to use, I can only recommend Tereus for your projects!",
  },
  {
    name: "Gwendal Siwiorek",
    avatar: "/images/opinions/gwendal.jpg",
    content: "Between two lines of code, I sometimes feel like I'm in the middle of a movie.",
  },
];

export default function Index() {
  const { classes } = useStyles();
  const theme = useMantineTheme();

  return (
    <main>
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
              Start transpiling
            </Button>
            <Button component={Link} to="/pricing" className={classes.control} size="lg">
              Upgrade to Pro
            </Button>
          </Group>
        </div>
      </Container>

      <Container
        sx={{
          height: "500px",
        }}
      >
        <AnimatedTerminal />
      </Container>

      <Group
        position="center"
        p={32}
        sx={{
          backgroundColor: theme.colors.gray[0],
        }}
        spacing={24}
      >
        {OPINIONS.map((opinion) => (
          <Card
            shadow="sm"
            key={opinion.name}
            sx={{
              maxWidth: "100%",
              width: "450px",
            }}
          >
            <Group sx={{ width: "100%" }} align="start">
              <Image src={opinion.avatar} height={64} width={64} radius={50} alt={opinion.name} />

              <Stack spacing={0} sx={{ flex: 1 }}>
                <Text weight={500}>{opinion.name}</Text>
                <Text size="sm" color="gray">
                  {opinion.content}
                </Text>
              </Stack>
            </Group>
          </Card>
        ))}
      </Group>
    </main>
  );
}
