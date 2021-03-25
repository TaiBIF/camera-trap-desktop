import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import { ConfigContext } from '../app';
import SourceListContainer from './SourceListContainer'
import ImageListContainer from './ImageListContainer';
import { getSource } from '../utils'

const useStyles = makeStyles({
  root: {
    padding: '16px 20px',
  }
});

export default function MainContainer() {
  const classes = useStyles();
  const config = React.useContext(ConfigContext);
  const [view, setView] = React.useState('source-list');
  const [sourceID, setSourceID] = React.useState(0);
  const [sourceData, setSourceData] = React.useState(null);

  const handleChangeView = (e, view, _id) => {
    //console.log('handle', view, _id);
    if (view === 'image-list') {
      getSource(config.SQLite.dbfile, _id, true).then((res)=>{
        //console.log(res['data']);
        setSourceData(res['data']);
        setView(view);
      });
    } else {
      setView(view);
    }
  }
  //console.log(view, sourceData);
  return (
      <div className={classes.root}>
      { view==='image-list' && sourceData ?
        <ImageListContainer onChangeView={handleChangeView} sourceData={sourceData} />
        : <SourceListContainer onChangeView={handleChangeView} />
      }
      </div>
  )
}
