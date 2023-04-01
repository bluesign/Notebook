import React from 'react';
import {MessageBar, MessageBarType, useTheme} from '@fluentui/react';
import { getDefaultFontFamily } from '~/services/fonts';
import { RuntimeType } from '~/services/config';
import { EvalEvent } from '~/services/api';
import EvalEventView from './EvalEventView';
import './Preview.css';
import "../../state"
import {appState} from "~/state";
import {use} from "use-minimal-state";
export interface PreviewProps {
  lastError?: string | null;
  events?: EvalEvent[]
  runtime?: RuntimeType
}

const Preview: React.FC<PreviewProps> = ()=>{

  const {palette} = useTheme();
  const status = use(appState, "status")

  const styles =  {
    backgroundColor: palette?.neutralLight,
    color: palette?.neutralDark,
    fontFamily: getDefaultFontFamily(),
  }

  let content;

  if (status.lastError) {
    content = (
        <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
          <b className='app-preview__label'>Error</b>
          <pre className='code'>
            {status.lastError}
          </pre>
        </MessageBar>
    )
  } else if (status.events) {

    content = status.events.map(({Data,  Kind}, k) => (
        <EvalEventView key={k}
                       data={Data}
                       kind={Kind}

        />
    ));

  } else {
    content = <span>Press "Run" to execute script.</span>;
  }

  return <div className="app-preview" style={styles}>
    <div className='app-preview__content'>
      {content}
    </div>
  </div>;

}


export default Preview;



