import React from 'react';
import './EvalEventView.css';
import ReactJson from 'react-json-view'
import {appState} from "~/state";
import {use} from "use-minimal-state";


interface ViewData {
  data: any,
  kind: string,
}

const EvalEventView: React.FC<ViewData> = ({data, kind}) => {

  const settings = use(appState, "settings")
  const domClassName = `evalEvent__msg evalEvent__msg--${kind}`;

    const isString = typeof data === "string"

    return <div className="evalEvent">
      { isString ? (
          <pre className={domClassName}><b>{kind}:</b> {data as String}</pre>
      ) : (
          <pre className={domClassName}><b>{kind}:</b>
          <ReactJson theme={settings.darkMode? "ocean":"rjv-default"} style={{backgroundColor:"transparent"}} name={false} src={data as Object} />
          </pre>
      )
      }
      <span className="evalEvent__delay">{''}</span>
    </div>

}

export default EvalEventView;
