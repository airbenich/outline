import { useKBar } from "kbar";
import { observer } from "mobx-react";
import { EditIcon, SearchIcon, ShapesIcon, HomeIcon } from "outline-icons";
import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import Flex from "~/components/Flex";
import Scrollable from "~/components/Scrollable";
import Text from "~/components/Text";
import { inviteUser } from "~/actions/definitions/users";
import useCurrentTeam from "~/hooks/useCurrentTeam";
import useCurrentUser from "~/hooks/useCurrentUser";
import usePolicy from "~/hooks/usePolicy";
import useStores from "~/hooks/useStores";
import AccountMenu from "~/menus/AccountMenu";
import OrganizationMenu from "~/menus/OrganizationMenu";
import {
  homePath,
  draftsPath,
  templatesPath,
  searchPath,
} from "~/utils/routeHelpers";
import Avatar from "../Avatar";
import TeamLogo from "../TeamLogo";
import Sidebar from "./Sidebar";
import ArchiveLink from "./components/ArchiveLink";
import Collections from "./components/Collections";
import Section from "./components/Section";
import SidebarAction from "./components/SidebarAction";
import SidebarButton from "./components/SidebarButton";
import SidebarLink from "./components/SidebarLink";
import Starred from "./components/Starred";
import TrashLink from "./components/TrashLink";

function AppSidebar() {
  const { t } = useTranslation();
  const { ui, documents } = useStores();
  const team = useCurrentTeam();
  const user = useCurrentUser();
  const { query } = useKBar();
  const location = useLocation();
  const history = useHistory();
  const can = usePolicy(team.id);

  React.useEffect(() => {
    documents.fetchDrafts();
    documents.fetchTemplates();
  }, [documents]);

  const [dndArea, setDndArea] = React.useState();
  const handleSidebarRef = React.useCallback((node) => setDndArea(node), []);
  const html5Options = React.useMemo(
    () => ({
      rootElement: dndArea,
    }),
    [dndArea]
  );

  const handleSearch = React.useCallback(() => {
    const isSearching = location.pathname.startsWith(searchPath());
    if (isSearching) {
      history.push(searchPath());
    } else {
      ui.enableModKHint();
      query.toggle();
    }
  }, [ui, location, history, query]);

  return (
    <Sidebar ref={handleSidebarRef}>
      {dndArea && (
        <DndProvider backend={HTML5Backend} options={html5Options}>
          <OrganizationMenu>
            {(props) => (
              <SidebarButton
                {...props}
                title={team.name}
                image={
                  <StyledTeamLogo src={team.avatarUrl} width={32} height={32} />
                }
                showDisclosure
              />
            )}
          </OrganizationMenu>
          <Scrollable flex shadow>
            <Section>
              <SidebarLink
                to={homePath()}
                icon={<HomeIcon color="currentColor" />}
                exact={false}
                label={t("Home")}
              />
              <SidebarLink
                onClick={handleSearch}
                icon={<SearchIcon color="currentColor" />}
                label={t("Search")}
                exact={false}
              />
              {can.createDocument && (
                <SidebarLink
                  to={draftsPath()}
                  icon={<EditIcon color="currentColor" />}
                  label={
                    <Flex align="center" justify="space-between">
                      {t("Drafts")}
                      <Drafts size="xsmall" type="tertiary">
                        {documents.totalDrafts}
                      </Drafts>
                    </Flex>
                  }
                />
              )}
            </Section>
            <Section>
              <Starred />
            </Section>
            <Section auto>
              <Collections />
            </Section>
            <Section>
              {can.createDocument && (
                <>
                  <SidebarLink
                    to={templatesPath()}
                    icon={<ShapesIcon color="currentColor" />}
                    exact={false}
                    label={t("Templates")}
                    active={
                      documents.active
                        ? documents.active.isTemplate &&
                          !documents.active.isDeleted &&
                          !documents.active.isArchived
                        : undefined
                    }
                  />
                  <ArchiveLink />
                  <TrashLink />
                </>
              )}
              <SidebarAction action={inviteUser} />
            </Section>
          </Scrollable>
          <AccountMenu>
            {(props) => (
              <SidebarButton
                {...props}
                showMoreMenu
                title={user.name}
                image={
                  <StyledAvatar
                    src={user.avatarUrl}
                    size={24}
                    showBorder={false}
                  />
                }
              />
            )}
          </AccountMenu>
        </DndProvider>
      )}
    </Sidebar>
  );
}

const StyledTeamLogo = styled(TeamLogo)`
  margin-right: 4px;
`;

const StyledAvatar = styled(Avatar)`
  margin-left: 4px;
`;

const Drafts = styled(Text)`
  margin: 0 4px;
`;

export default observer(AppSidebar);