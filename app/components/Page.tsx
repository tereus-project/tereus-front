import { EuiAvatar, EuiHeader, EuiHeaderLink, EuiHeaderLinks, EuiHeaderLogo, EuiHeaderSectionItem, EuiHeaderSectionItemButton, EuiIcon, EuiPage, EuiPageBody, EuiPageContent, EuiPageContentBody, EuiPageHeader, EuiToolTip, IconType } from "@elastic/eui";

export type PageProps = React.PropsWithChildren<{
  title?: string;
  icon?: IconType;
}>


export function Page({ children, title, icon = '' }: PageProps) {
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
            <EuiHeaderLink href="/remixer">
              Remixer
            </EuiHeaderLink>

            <EuiHeaderLink href="/login">
              Login
            </EuiHeaderLink>

            <EuiHeaderLink href="">
              Docs
            </EuiHeaderLink>
          </EuiHeaderLinks>

          <EuiToolTip
            content="History"
            position="bottom"
          >
            <EuiHeaderSectionItemButton aria-label="History">
              <EuiIcon type="/icons/history.svg" size="m" />
            </EuiHeaderSectionItemButton>
          </EuiToolTip>

          <EuiToolTip
            content="GitHub"
            position="bottom"
          >
            <EuiHeaderSectionItemButton aria-label="GitHub" href="https://github.com/tereus-project" target="_blank">
              <EuiIcon type="/icons/github.svg" size="m" />
            </EuiHeaderSectionItemButton>
          </EuiToolTip>

          <EuiHeaderSectionItemButton aria-label="Account menu">
            <EuiAvatar name="Nathanel Demacon" size="s" />
          </EuiHeaderSectionItemButton>
        </EuiHeaderSectionItem>
      </EuiHeader>

      <EuiPage>
        <EuiPageBody>
          {title &&
            <EuiPageHeader
              iconType={icon}
              pageTitle={title}
            />
          }

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
  )
}
