import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  List,
  ListIcon,
  ListItem,
  useToast,
} from "@chakra-ui/react";
import { useFetcher, useOutletContext, useSearchParams } from "@remix-run/react";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { ImCheckmark, ImCross } from "react-icons/im";
import { useDataRefresh } from "remix-utils";
import type { ActionFormData, CreateBillingPortalResponseDTO, CreateSubscriptionCheckoutResponseDTO } from "~/api";
import { Page } from "~/components/Page";
import type { TereusContext } from "~/root";

type PlanTier = "free" | "pro" | "enterprise";

interface Plan {
  tier: PlanTier;
  name: string;
  usdPrice: number;
  features: Record<string, boolean>;
}

const plans: Plan[] = [
  {
    tier: "free",
    name: "Free",
    usdPrice: 0,
    features: {
      "Inline remixing": true,
      "Zip remixing": false,
      "Git repository remixing": false,
      "Data retention": false,
      "Active support": false,
    },
  },
  {
    tier: "pro",
    name: "Pro",
    usdPrice: 49,
    features: {
      "Inline remixing": true,
      "Zip remixing (<= 1MB)": true,
      "Git repository remixing": false,
      "Data retention ($0.20/MB)": true,
      "Active support": true,
    },
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    usdPrice: 279,
    features: {
      "Inline remixing": true,
      "Zip remixing": true,
      "Git repository remixing": true,
      "Data retention (2GB free then $0.10/MB)": true,
      "Active support": true,
    },
  },
];

export default function Pricing() {
  const context = useOutletContext<TereusContext>();
  const [searchParams] = useSearchParams();

  const { refresh } = useDataRefresh();
  const toast = useToast();

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const subscriptionCheckoutFetcher = useFetcher<ActionFormData<CreateSubscriptionCheckoutResponseDTO>>();
  useEffect(() => {
    if (subscriptionCheckoutFetcher.type === "done") {
      setIsCheckoutLoading(false);

      if (subscriptionCheckoutFetcher.data?.response) {
        const { redirect_url } = subscriptionCheckoutFetcher.data.response;

        if (!redirect_url) {
          refresh();
        } else {
          window.location.href = redirect_url;
        }
      } else if (subscriptionCheckoutFetcher.data?.errors) {
        toast({
          isClosable: true,
          title: "An error occured",
          status: "error",
          description: subscriptionCheckoutFetcher.data.errors.join("\n"),
        });
      }
    } else if (subscriptionCheckoutFetcher.type === "actionSubmission") {
      setIsCheckoutLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionCheckoutFetcher]);

  const billingPortalFetcher = useFetcher<ActionFormData<CreateBillingPortalResponseDTO>>();
  useEffect(() => {
    if (billingPortalFetcher.type === "done") {
      setIsCheckoutLoading(false);

      if (billingPortalFetcher.data?.response) {
        const { redirect_url } = billingPortalFetcher.data.response;
        window.location.href = redirect_url;
      } else if (billingPortalFetcher.data?.errors) {
        toast({
          isClosable: true,
          title: "An error occured",
          status: "error",
          description: billingPortalFetcher.data.errors.join("\n"),
        });
      }
    } else if (subscriptionCheckoutFetcher.type === "actionSubmission") {
      setIsCheckoutLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingPortalFetcher]);

  const currentTier = useMemo(() => context.user?.subscription?.tier ?? "free", [context.user]);
  const expiresAt = useMemo(() => {
    if (context.user?.subscription?.expires_at) {
      const data = new Date(context.user.subscription.expires_at);
      return format(data, "PPpp");
    }

    return null;
  }, [context.user]);

  const currentPlanIndex = plans.findIndex((plan) => plan.tier === currentTier);

  const ManagePlanButton: React.FC<{ planIndex: number; plan: Plan }> = ({ planIndex, plan }) => {
    if (planIndex === currentPlanIndex && !context.user?.subscription?.cancelled) {
      if (plan.tier === "free") {
        return null;
      }

      return (
        <Button
          onClick={() => {
            const formData = new FormData();
            formData.append("return_url", window.location.href);
            billingPortalFetcher.submit(formData, {
              method: "post",
              action: "/subscription/portal",
              encType: "multipart/form-data",
            });
          }}
          variant="solid"
          disabled={isCheckoutLoading}
          colorScheme="blue"
        >
          Manage
        </Button>
      );
    }

    if (plan.tier === "free" && context.user?.subscription?.cancelled) {
      return null;
    }

    return (
      <subscriptionCheckoutFetcher.Form method="post" action="/subscription/checkout" encType="multipart/form-data">
        <input hidden readOnly name="tier" value={plan.tier} />

        {planIndex < currentPlanIndex && !context.user?.subscription?.cancelled ? (
          <Button type="submit" variant="solid" disabled={isCheckoutLoading}>
            Downgrade to {plan.name}
          </Button>
        ) : (
          <Button type="submit" variant="solid" disabled={isCheckoutLoading} colorScheme="green">
            Upgrade to {plan.name}
          </Button>
        )}
      </subscriptionCheckoutFetcher.Form>
    );
  };

  return (
    <Page title="Pricing" user={context.user} headingMaxW="7xl">
      <Container maxW="7xl">
        {searchParams.get("success") === "true" && (
          <Alert status="success" mb={6}>
            <AlertIcon />
            Successfully subscribed to the {plans[currentPlanIndex].name} plan. Enjoy your new features!
          </Alert>
        )}

        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
          {plans.map((plan, planIndex) => (
            <GridItem
              key={`plan-${plan.tier}`}
              w="full"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              shadow="md"
            >
              <Box borderBottomWidth="1px" py={4} px={6}>
                <HStack>
                  <Heading as="h3" size="lg">
                    {plan.name}
                  </Heading>
                  {plan.tier === currentTier && (
                    <>
                      <Badge variant="solid" colorScheme="green">
                        {!context.user?.subscription?.cancelled ? (
                          <Box>Current</Box>
                        ) : (
                          <Box>Expires at {expiresAt}</Box>
                        )}
                      </Badge>
                    </>
                  )}
                </HStack>
                <Heading as="h4" size="md" color="gray.400">
                  ${plan.usdPrice} / month
                </Heading>
              </Box>
              <List spacing={3} p={6}>
                {Object.entries(plan.features).map(([feature, isIncluded], i) => (
                  <ListItem key={`plan-${plan.tier}-feature-${i}`}>
                    <ListIcon as={isIncluded ? ImCheckmark : ImCross} color={isIncluded ? "green.500" : "red.500"} />
                    {feature}
                  </ListItem>
                ))}
              </List>
              <Box pb={4} px={6}>
                <ManagePlanButton planIndex={planIndex} plan={plan} />
              </Box>
            </GridItem>
          ))}
        </Grid>
      </Container>
    </Page>
  );
}
