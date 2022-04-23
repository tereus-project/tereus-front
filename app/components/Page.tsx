import {
  EuiAvatar,
  EuiHeader,
  EuiHeaderLink,
  EuiHeaderLinks,
  EuiHeaderLogo,
  EuiHeaderSectionItem,
  EuiHeaderSectionItemButton,
  EuiIcon,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiToolTip,
  IconType,
} from "@elastic/eui";
import md5 from "md5";

export type PageProps = React.PropsWithChildren<{
  title?: string;
  icon?: IconType;
  user?: {
    email: string;
  };
}>;

export function Page({ children, title, icon = "", user }: PageProps) {
  return (
    <main>
      <EuiHeader theme="dark">
        <EuiHeaderSectionItem border="right">
          <EuiHeaderLogo
            // iconType="compute"
            href="/"
          >
            Tereus
          </EuiHeaderLogo>
        </EuiHeaderSectionItem>

        <EuiHeaderSectionItem>
          <EuiHeaderLinks>
            {user && <EuiHeaderLink href="/remixer">Remixer</EuiHeaderLink>}

            {!user && <EuiHeaderLink href="/login">Login</EuiHeaderLink>}

            <EuiHeaderLink href="">Docs</EuiHeaderLink>
          </EuiHeaderLinks>

          {user && (
            <EuiHeaderLink href="/history">
              <EuiToolTip content="History" position="bottom">
                <EuiHeaderSectionItemButton aria-label="History">
                  <EuiIcon type="/icons/history.svg" size="m" />
                </EuiHeaderSectionItemButton>
              </EuiToolTip>
            </EuiHeaderLink>
          )}

          <EuiToolTip content="GitHub" position="bottom">
            <EuiHeaderSectionItemButton
              aria-label="GitHub"
              href="https://github.com/tereus-project"
              target="_blank"
            >
              <EuiIcon type="/icons/github.svg" size="m" />
            </EuiHeaderSectionItemButton>
          </EuiToolTip>

          {user && (
            <EuiHeaderSectionItemButton aria-label="Account menu">
              <EuiAvatar
                name="Your account"
                size="m"
                imageUrl={`https://www.gravatar.com/avatar/${md5(user.email)}`}
              />
            </EuiHeaderSectionItemButton>
          )}
        </EuiHeaderSectionItem>
      </EuiHeader>

      <EuiPage>
        <EuiPageBody>
          {title && <EuiPageHeader iconType={icon} pageTitle={title} />}

          <EuiPageContent
            hasBorder={false}
            hasShadow={false}
            paddingSize="none"
            color="transparent"
            borderRadius="none"
          >
            <EuiPageContentBody>{children}</EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    </main>
  );
}
