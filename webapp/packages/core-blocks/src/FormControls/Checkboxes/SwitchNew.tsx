/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observer } from 'mobx-react-lite';
import styled, { css } from 'reshadow';

import { useStyles, composes } from '@cloudbeaver/core-theming';

import { filterLayoutFakeProps } from '../../Containers/filterLayoutFakeProps';
import { baseFormControlStylesNew } from '../baseFormControlStylesNew';
import { isControlPresented } from '../isControlPresented';
import type { ICheckboxControlledProps, ICheckboxObjectProps } from './Checkbox';
import { useCheckboxState } from './useCheckboxState';

const switchStyles = composes(
  css`
  switch-control {
    composes: theme-switch from global;
  }
  switch-control-track {
    composes: theme-switch__track from global;
  }
  switch-input {
    composes: theme-switch_native-control from global;
  }
  switch-control-underlay {
    composes: theme-switch__thumb-underlay from global;
  }
  switch-control-thumb {
    composes: theme-switch__thumb from global;
  }
  radio-ripple {
    composes: theme-radio_ripple from global;
  }
  `,
  css`
    switch-body {
      display: flex;
      align-items: center;
    }
    field-label {
      composes: theme-typography--body1 from global;
      cursor: pointer;
      user-select: none;
      display: block;
      padding-left: 18px;
      min-width: 50px;
      white-space: pre-wrap;
      font-weight: 500;
    }
  `
);

const switchMod = {
  primary: composes(
    css`
      switch-control {
        composes: theme-switch_primary from global;
      }
    `
  ),
};

const switchState = {
  disabled: composes(
    css`
      switch-control {
        composes: theme-switch--disabled from global;
      }
    `
  ),
  checked: composes(
    css`
      switch-control {
        composes: theme-switch--checked from global;
      }
    `
  ),
};

interface IBaseProps {
  mod?: Array<keyof typeof switchMod>;
  description?: React.ReactNode;
}

interface SwitchType {
  (props: IBaseProps & ICheckboxControlledProps): React.ReactElement<any, any> | null;
  <TKey extends string>(props: IBaseProps & ICheckboxObjectProps<TKey>): React.ReactElement<any, any> | null;
}

export const SwitchNew: SwitchType = observer(function SwitchNew({
  name,
  value,
  defaultValue,
  description,
  state,
  checked,
  defaultChecked,
  className,
  children,
  onChange,
  mod = [],
  autoHide,
  disabled,
  ...rest
}: IBaseProps & (ICheckboxControlledProps | ICheckboxObjectProps<any>)) {
  const checkboxState = useCheckboxState({
    value,
    defaultValue,
    checked,
    defaultChecked,
    state,
    name,
    onChange,
  });
  rest = filterLayoutFakeProps(rest);
  const styles = useStyles(
    baseFormControlStylesNew,
    switchStyles,
    ...mod.map(mod => switchMod[mod]),
    disabled && switchState.disabled,
    checkboxState.checked && switchState.checked
  );

  if (autoHide && !isControlPresented(name, state)) {
    return null;
  }

  return styled(styles)(
    <field className={className}>
      <switch-body>
        <switch-control>
          <switch-control-track />
          <switch-control-underlay>
            <switch-control-thumb />
            <switch-input
              as='input'
              {...rest}
              type="checkbox"
              id={value || name}
              role="switch"
              aria-checked={checkboxState.checked}
              checked={checkboxState.checked}
              disabled={disabled}
              onChange={checkboxState.change}
            />
          </switch-control-underlay>
        </switch-control>
        <field-label as="label" htmlFor={value || name}>{children}</field-label>
      </switch-body>
      <field-description>{description}</field-description>
    </field>
  );
});
