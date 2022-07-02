import { Alert, Badge, Button, Card, Grid, Group, List, Stack, Title, useMantineTheme } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Link, useFetcher, useOutletContext, useSearchParams } from "@remix-run/react";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useDataRefresh } from "remix-utils";
import { AlertCircle, Check, CircleDotted, X } from "tabler-icons-react";
import type {
  ActionFormData,
  CreateBillingPortalResponseDTO,
  CreateSubscriptionCheckoutResponseDTO,
} from "~/api.server";
import { Page } from "~/components/Page";
import type { TereusContext } from "~/root";

type PlanTier = "free" | "pro" | "enterprise";

interface Plan {
  tier: PlanTier;
  name: string;
  usdPrice: number;
  features: Record<string, "full" | "partial" | "no">;
}

const plans: Plan[] = [
  {
    tier: "free",
    name: "Free",
    usdPrice: 0,
    features: {
      "Inline transpilation": "full",
      "Zip transpilation": "no",
      "Git repository transpilation": "no",
      "Data retention (24h only)": "partial",
      "Active support": "no",
    },
  },
  {
    tier: "pro",
    name: "Pro",
    usdPrice: 49,
    features: {
      "Inline transpilation": "full",
      "Zip transpilation (<= 1MB)": "partial",
      "Git repository transpilation": "no",
      "Data retention ($0.20/MB)": "full",
      "Active support": "full",
    },
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    usdPrice: 279,
    features: {
      "Inline transpilation": "full",
      "Zip transpilation": "full",
      "Git repository transpilation": "full",
      "Data retention (2GB free then $0.10/MB)": "full",
      "Active support": "full",
    },
  },
];

export default function Pricing() {
  const context = useOutletContext<TereusContext>();
  const [searchParams] = useSearchParams();

  const theme = useMantineTheme();

  const { refresh } = useDataRefresh();

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
        showNotification({
          color: "red",
          title: "An error occured",
          message: subscriptionCheckoutFetcher.data.errors.join("\n"),
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
        showNotification({
          color: "red",
          title: "An error occured",
          message: billingPortalFetcher.data.errors.join("\n"),
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
    if (!context.user) {
      if (plan.tier === "free") {
        return null;
      }

      return (
        <Link to="/login?to=/pricing">
          <Button color="green">Upgrade to {plan.name}</Button>
        </Link>
      );
    }

    if (planIndex === currentPlanIndex && !context.user?.subscription?.cancelled) {
      if (plan.tier === "free") {
        return null;
      }

      return (
        <div>
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
            color="blue"
            disabled={isCheckoutLoading}
            loading={billingPortalFetcher.state === "submitting"}
          >
            Manage
          </Button>
        </div>
      );
    }

    if (plan.tier === "free" && context.user?.subscription?.cancelled) {
      return null;
    }

    return (
      <subscriptionCheckoutFetcher.Form method="post" action="/subscription/checkout" encType="multipart/form-data">
        <input hidden readOnly name="tier" value={plan.tier} />

        {planIndex < currentPlanIndex && !context.user?.subscription?.cancelled ? (
          <Button type="submit" disabled={isCheckoutLoading} color="gray">
            Downgrade to {plan.name}
          </Button>
        ) : (
          <Button type="submit" disabled={isCheckoutLoading} color="teal">
            Upgrade to {plan.name}
          </Button>
        )}
      </subscriptionCheckoutFetcher.Form>
    );
  };

  return (
    <Page title="Pricing" containerSize="lg">
      {searchParams.get("success") === "true" && (
        <Alert icon={<AlertCircle size={16} />} title="Success!" color="green" mb={12}>
          Successfully subscribed to the {plans[currentPlanIndex].name} plan. Enjoy your new features!
        </Alert>
      )}

      <Grid>
        {plans.map((plan, planIndex) => (
          <Grid.Col sm={12 / plans.length} xs={12} key={`plan-${plan.tier}`}>
            <Card shadow="sm" p={0} withBorder style={{ height: "100%" }}>
              <Stack
                mb={12}
                p="lg"
                sx={() => ({
                  gap: 0,
                  borderBottom: `1px solid ${theme.colors.gray[2]}`,
                })}
              >
                <Group>
                  <Title order={3}>{plan.name}</Title>
                  {plan.tier === currentTier && (
                    <Badge color="green">
                      {!context.user?.subscription?.cancelled ? <div>Current</div> : <div>Expires at {expiresAt}</div>}
                    </Badge>
                  )}
                </Group>
                <Title order={4} style={{ color: theme.colors.gray[5] }}>
                  ${plan.usdPrice} / month
                </Title>
              </Stack>

              <Stack p="lg">
                <List spacing={8}>
                  {Object.entries(plan.features).map(([feature, isIncluded], i) => (
                    <List.Item
                      key={`plan-${plan.tier}-feature-${i}`}
                      icon={
                        isIncluded === "full" ? (
                          <Check size={16} strokeWidth={3} color="teal" />
                        ) : isIncluded === "partial" ? (
                          <CircleDotted size={16} strokeWidth={3} color="blue" />
                        ) : (
                          <X size={16} strokeWidth={3} color="red" />
                        )
                      }
                    >
                      {feature}
                    </List.Item>
                  ))}
                </List>

                <ManagePlanButton planIndex={planIndex} plan={plan} />
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Page>
  );
}
