import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import type { MetaFunction } from "@remix-run/node";
import { Link, useFetcher, useOutletContext } from "@remix-run/react";
import prettyBytes from "pretty-bytes";
import { useEffect, useState } from "react";
import { ReportMoney, Settings } from "tabler-icons-react";
import type { ActionFormData, CreateBillingPortalResponseDTO, SubscriptionDTO } from "~/api.server";
import type { TereusContext } from "~/root";

export const meta: MetaFunction = () => ({
  title: "Billing | Settings | Tereus",
});

export default function AccountSettingsBilling() {
  const context = useOutletContext<TereusContext>();
  const user = context.user!;

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingPortalFetcher]);

  const ManagePlanButton: React.FC<{ subscription?: SubscriptionDTO }> = ({ subscription }) => {
    if (!subscription) {
      return null;
    }

    return (
      <div>
        <Button
          variant="light"
          color="blue"
          leftIcon={<ReportMoney />}
          onClick={() => {
            const formData = new FormData();
            formData.append("return_url", window.location.href);
            billingPortalFetcher.submit(formData, {
              method: "post",
              action: "/subscription/portal",
              encType: "multipart/form-data",
            });
          }}
          disabled={isCheckoutLoading}
          loading={billingPortalFetcher.state === "submitting"}
        >
          Manage billing information
        </Button>
      </div>
    );
  };

  return (
    <Stack>
      <Group
        align="start"
        sx={() => ({
          justifyContent: "space-between",
        })}
      >
        <Stack spacing={32}>
          <Stack>
            <Title order={4}>Current usage</Title>
            <Text>Your current data usage is {prettyBytes(user.current_usage_bytes)}.</Text>
          </Stack>
        </Stack>
      </Group>
      <Group>
        <Button component={Link} to="/pricing" variant="light" color="blue" leftIcon={<Settings />}>
          Manage subscription
        </Button>
        <ManagePlanButton subscription={user.subscription} />
      </Group>
    </Stack>
  );
}
