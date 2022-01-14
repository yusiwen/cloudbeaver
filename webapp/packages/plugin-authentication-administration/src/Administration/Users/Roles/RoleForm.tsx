/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import styled, { css } from 'reshadow';

import type { RoleInfo } from '@cloudbeaver/core-authentication';
import { TabsState, TabList, UNDERLINE_TAB_STYLES, TabPanelList, } from '@cloudbeaver/core-ui';
import { Placeholder, useObjectRef, useExecutor, BASE_CONTAINERS_STYLES, IconOrImage } from '@cloudbeaver/core-blocks';
import { useService } from '@cloudbeaver/core-di';
import { useTranslate } from '@cloudbeaver/core-localization';
import { useStyles, composes } from '@cloudbeaver/core-theming';

import { roleContext } from './Contexts/roleContext';
import type { IRoleFormState } from './IRoleFormProps';
import { RoleFormService } from './RoleFormService';

const tabsStyles = css`
  TabList {
    position: relative;
    flex-shrink: 0;
    align-items: center;
  }
  Tab {
    height: 46px!important;
    text-transform: uppercase;
    font-weight: 500 !important;
  }
`;

const topBarStyles = composes(
  css`
    role-top-bar {
      composes: theme-border-color-background theme-background-secondary theme-text-on-secondary from global;
    }
  `,
  css`
    role-top-bar {
      position: relative;
      display: flex;
      padding-top: 16px;

      &:before {
        content: '';
        position: absolute;
        bottom: 0;
        width: 100%;
        border-bottom: solid 2px;
        border-color: inherit;
      }
    }
    role-top-bar-tabs {
      flex: 1;
    }

    role-top-bar-actions {
      display: flex;
      align-items: center;
      padding: 0 24px;
      gap: 16px;
    }

    role-status-message {
      composes: theme-typography--caption from global;
      height: 24px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      gap: 8px;

      & IconOrImage {
        height: 24px;
        width: 24px;
      }
    }
  `
);

const formStyles = composes(
  css`
    box {
      composes: theme-background-secondary theme-text-on-secondary from global;
    }

    content-box {
      composes: theme-background-secondary theme-border-color-background from global;
    }
  `,
  css`
    box {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
      overflow: auto;
    }
    content-box {
      position: relative;
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: auto;
    }
  `
);

interface Props {
  state: IRoleFormState;
  onCancel?: () => void;
  onSave?: (role: RoleInfo) => void;
  className?: string;
}

export const RoleForm = observer<Props>(function RoleForm({
  state,
  onCancel,
  onSave = () => { },
  className,
}) {
  const translate = useTranslate();
  const props = useObjectRef({ onSave });
  const style = [tabsStyles, UNDERLINE_TAB_STYLES];
  const styles = useStyles(style, BASE_CONTAINERS_STYLES, topBarStyles, formStyles);
  const service = useService(RoleFormService);

  useExecutor({
    executor: state.submittingTask,
    postHandlers: [function save(data, contexts) {
      const validation = contexts.getContext(service.configurationValidationContext);
      const state = contexts.getContext(service.configurationStatusContext);
      const config = contexts.getContext(roleContext);

      if (validation.valid && state.saved) {
        props.onSave(config);
      }
    }],
  });

  useEffect(() => {
    state.loadRoleInfo();
  }, []);

  return styled(styles)(
    <TabsState
      container={service.tabsContainer}
      localState={state.partsState}
      state={state}
      onCancel={onCancel}
    >
      <box className={className}>
        <role-top-bar>
          <role-top-bar-tabs>
            <role-status-message>
              {state.statusMessage && (
                <>
                  <IconOrImage icon='/icons/info_icon.svg' />
                  {translate(state.statusMessage)}
                </>
              )}
            </role-status-message>
            <TabList style={style} disabled={false} />
          </role-top-bar-tabs>
          <role-top-bar-actions>
            <Placeholder container={service.actionsContainer} state={state} onCancel={onCancel} />
          </role-top-bar-actions>
        </role-top-bar>
        <content-box>
          <TabPanelList style={style} />
        </content-box>
      </box>
    </TabsState>
  );
});
