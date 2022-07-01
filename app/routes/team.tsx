import { ActionIcon, Box, Card, Group, Image, Stack, Text, Title } from "@mantine/core";
import { BrandGithub, BrandInstagram, BrandTwitter, World } from "tabler-icons-react";
import { Page } from "~/components/Page";

const TEAM_MEMBERS = [
  {
    name: "Stanislas Lange",
    level: "Co-Founder",
    avatar: "https://avatars.githubusercontent.com/u/11699655",
    socials: {
      website: "https://stanislas.blog",
      github: "angristan",
      twitter: "fuolpit",
      instagram: "angristan",
    },
  },
  {
    name: "Nathanael Demacon",
    level: "Co-Founder",
    avatar: "https://avatars.githubusercontent.com/u/7271496",
    socials: {
      website: "https://qtmsheep.com",
      github: "quantumsheep",
      twitter: "qtmsheep",
      instagram: "ndrand0m",
    },
  },
];

export default function Team() {
  return (
    <Page title="The team">
      <Group sx={{ width: "100%", padding: "3em" }} position="center">
        {TEAM_MEMBERS.map((member) => (
          <Card key={member.name} shadow="sm" sx={{ width: 340 }}>
            <Group sx={{ width: "100%" }}>
              <Image src={member.avatar} height={96} width={96} alt={member.name} />

              <Stack>
                <Stack spacing={0}>
                  <Text weight={500}>{member.name}</Text>
                  <Text size="xs" color="gray">
                    {member.level}
                  </Text>
                </Stack>

                <Group>
                  <ActionIcon
                    variant="light"
                    color="blue"
                    component="a"
                    href={`https://github.com/${member.socials.github}`}
                    target="_blank"
                  >
                    <BrandGithub size={18} />
                  </ActionIcon>

                  <ActionIcon variant="light" color="blue" component="a" href={member.socials.website} target="_blank">
                    <World size={18} />
                  </ActionIcon>

                  <ActionIcon
                    variant="light"
                    color="blue"
                    component="a"
                    href={`https://twitter.com/${member.socials.twitter}`}
                    target="_blank"
                  >
                    <BrandTwitter size={18} />
                  </ActionIcon>

                  <ActionIcon
                    variant="light"
                    color="blue"
                    component="a"
                    href={`https://instagram.com/${member.socials.instagram}`}
                    target="_blank"
                  >
                    <BrandInstagram size={18} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Group>
          </Card>
        ))}
      </Group>

      <Box mt={46}>
        <Title order={2} sx={{ marginBottom: "2em" }}>
          Who we are
        </Title>

        <Text>
          We are two students majoring in Computer Science, more precisely in Software Engineering. Tereus is our last
          year project made to prove our skills and technical knowledge in Computer Science.
        </Text>

        <br />

        <Text>If you want to know more about us and our works, you can find us on our social media accounts.</Text>
      </Box>
    </Page>
  );
}
