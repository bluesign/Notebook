import React, { useCallback } from 'react';
import { useTheme } from '@fluentui/react';
import { Resizable } from 're-resizable';
import clsx from 'clsx';
import {
  VscChevronDown,
  VscChevronUp,
  VscSplitHorizontal,
  VscSplitVertical
} from 'react-icons/vsc';

import Preview from './Preview';
import PanelHeader from '~/components/core/Panel/PanelHeader';
import './ResizablePreview.css';
import {LayoutType} from "~/styles/modal";
import {appState} from "~/state";
import {update, use} from "use-minimal-state";

const MIN_HEIGHT = 36;
const MIN_WIDTH = 120;
const handleClasses = {
  top: 'ResizablePreview__handle--top',
  left: 'ResizablePreview__handle--left',
}

const ResizablePreview: React.FC = () => {

  const {palette: { accent }, semanticColors: { buttonBorder }} = useTheme();
  const UI = use(appState, "UI")


  const onResize = useCallback((e, direction, ref, size) => {
    switch (UI.panel.layout) {

      case LayoutType.Vertical:
        UI.panel.height = UI.panel.height + size.height;
        update(appState, "UI");
        return;

      case LayoutType.Horizontal:
        UI.panel.width = UI.panel.width + size.width;
        update(appState, "UI")
        return;

      default:
        return;
    }
  }, [UI.panel]);

  const size = {
    height:  UI.panel.layout === LayoutType.Vertical ? UI.panel.height : '100%',
    width:  UI.panel.layout === LayoutType.Horizontal ? UI.panel.width : '100%'
  };

  const enabledCorners = {
    top: !UI.panel.collapsed &&  UI.panel.layout === LayoutType.Vertical,
    right: false,
    bottom: false,
    left: !UI.panel.collapsed &&  UI.panel.layout === LayoutType.Horizontal,
    topRight: false,
    bottomRight: false,
    bottomLeft: false,
    topLeft: false
  };

  const isCollapsed = UI.panel.collapsed && UI.panel.layout === LayoutType.Vertical;
  return (
    <Resizable
      className={
        clsx(
          'ResizablePreview',
          isCollapsed && 'ResizablePreview--collapsed',
          `ResizablePreview--${UI.panel.layout}`
        )
      }
      handleClasses={handleClasses}
      size={size}
      enable={enabledCorners}
      onResizeStop={onResize}
      minHeight={MIN_HEIGHT}
      minWidth={MIN_WIDTH}
      style={{
        '--pg-handle-active-color': accent,
        '--pg-handle-default-color': buttonBorder,
      } as any}
    >
      <PanelHeader
        label="Output"

        commands={{
          'vertical-layout': {
            hidden: UI.panel.layout === LayoutType.Vertical,
            icon: <VscSplitVertical />,
            label: 'Use vertical layout',
            onClick: () => {
              UI.panel.layout = LayoutType.Vertical
              update(appState, "UI")
            }
          },
          'horizontal-layout': {
            desktopOnly: true,
            hidden:  UI.panel.layout === LayoutType.Horizontal,
            icon: <VscSplitHorizontal />,
            label: 'Use horizontal layout',
            onClick: () => {
              UI.panel.layout = LayoutType.Horizontal
              update(appState, "UI")
            }
          },
          'collapse': {
            hidden:  UI.panel.layout === LayoutType.Horizontal,
            icon:  UI.panel.collapsed ? <VscChevronUp /> : <VscChevronDown />,
            label:  UI.panel.collapsed ? 'Expand' : 'Collapse',
            onClick: () => {
              UI.panel.collapsed = !UI.panel.collapsed
              update(appState, "UI")
            }
          },

        }}
      />

      { isCollapsed ? null : (
          <Preview/>
      )}

    </Resizable>
  );
};

export default ResizablePreview;
