import React from 'react';

//simport { runCommand} from './adapters/command';
import MainContainer from './components/MainContainer';
import {
  loadConfig,
} from './utils';

const ConfigContext = React.createContext();

const App = () => {
  const [config, setConfig] = React.useState(null);
  React.useEffect(() => {
    loadConfig().then((res)=> setConfig(res));
    console.log('root:', __dirname);
  }, []);

  return (
      <>
      {config ?
       <ConfigContext.Provider value={config}>
       <MainContainer />
       </ConfigContext.Provider>
       : <div>{__dirname}<br />loading ...</div>
      }
       </>
    )
}

export {App, ConfigContext}
