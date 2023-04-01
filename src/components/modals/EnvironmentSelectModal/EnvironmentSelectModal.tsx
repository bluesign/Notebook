import React from 'react';
import { CompoundButton } from '@fluentui/react/lib/Button';
import { Modal } from '@fluentui/react/lib/Modal';
import {
  Stack, IStackTokens, IconButton, mergeStyleSets, useTheme
} from '@fluentui/react';
import { VscCloud, VscBeaker } from 'react-icons/vsc';
import { SiWebassembly } from 'react-icons/si';
import { getContentStyles, getIconButtonStyles } from '~/styles/modal';
import {RuntimeType} from '~/services/config';
import './EnvironmentSelectModal.css';

const options = [
  {
    label: 'Flow Mainnet',
    description: 'Run scripts and transactions on Flow Mainnet.',
    type: RuntimeType.FlowMainnet,
    icon: <VscCloud />
  },
  {
    label: 'Flow Testnet',
    description: 'Run scripts and transactions on Flow Testnet.',
    type: RuntimeType.FlowTestnet,
    icon: <VscBeaker />
  },
  {
    label: 'Local Emulator',
    description: 'Run scripts and transactions on the local Flow Emulator.',
    type: RuntimeType.FlowEmulator,
    icon: <SiWebassembly />
  }
]

const buttonStyles = mergeStyleSets({
  button: {
    maxWidth: 'initial'
  }
});

interface Props {
  isOpen?: boolean
  value: RuntimeType
  onClose?: (v?: RuntimeType) => void
}

const EnvironmentSelectModal: React.FC<Props> = ({
  isOpen, onClose, value
}) => {
  const theme = useTheme();
  const contentStyles = getContentStyles(theme);
  const iconButtonStyles = getIconButtonStyles(theme);
  const stackTokens: IStackTokens = { childrenGap: 10 };

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={() => onClose?.()}
      topOffsetFixed={true}
      containerClassName={contentStyles.container}
    >
      <div className={contentStyles.header}>
        <span>Select Environment</span>
        <IconButton
          iconProps={{ iconName: 'Cancel' }}
          styles={iconButtonStyles}
          ariaLabel='Close popup modal'
          onClick={() => onClose?.()}
        />
      </div>
      <div className={contentStyles.body}>
        <Stack tokens={stackTokens}>
          {
            options.map(({label, description, type, icon}) => (
              <CompoundButton
                key={type}
                secondaryText={description}
                checked={type === value}
                className={buttonStyles.button}
                onClick={() => onClose?.(type)}
                onRenderIcon={() => (
                  <div className="EnvironmentSelectButton__icon">
                    {icon}
                  </div>
                )}
              >
                {label}
              </CompoundButton>
            ))
          }
        </Stack>
      </div>
    </Modal>
  );
}

export default EnvironmentSelectModal;
