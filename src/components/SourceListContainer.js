const path = require('path');

import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

import { ConfigContext } from '../app';
import {
  addFolder,
  getSource,
  deleteSource,
  uploadSource,
  prepareUploadSource,
  uploadImage,
} from '../utils'
import SourceItem from './SourceItem';

const useStyles = makeStyles((theme) => ({
  progress: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  root: {
    flexGrow: 1,
  },
  cardContainer :{
    paddingTop: theme.spacing(3),
  },
}));

export default function SourceListContainer({onChangeView}) {
  const classes = useStyles();

  const handleDelete = (e, source_id) => {
    e.stopPropagation();
    if (confirm('確定刪除?')) {
      deleteSource(config.SQLite.dbfile, source_id).then((res)=>{
        setSourceList(res['data']);
      });
    }
  };

  /*
  const refresh = () => {
    console.log('refre', uploading);
    if (uploading) {
      setTimeout(refresh, 2000);
      console.log('refresh', count);
    }
  }
  */
  const [uploadQueueIndex, setUploadQueueIndex] = React.useState(0);
  const [uploadQueue, setUploadQueue] = React.useState([]);
  const [sourceLoaded, setSourceLoaded] = React.useState(false);
  const [sourceList, setSourceList] = React.useState([]);


  const config = React.useContext(ConfigContext);

  React.useEffect(() => {
    console.log('init');
    console.time('boot')

    getSource(config.SQLite.dbfile, '0').then((res)=>{
      setSourceLoaded(true);
      console.log(res);
      console.timeLog('boot')
      setSourceList(res['data']);
      console.timeEnd('boot')
    });
  }, []);



  React.useEffect(() => {
    console.log('qqqqqqq', uploadQueue);
    const processQueue = async (queue) => {
      console.log(queue)
      for (const q of queue['imageList']) {
        const res = await uploadImage(config.SQLite.dbfile, q[0]);
        console.log(res, uploadQueueIndex);
      }
    }
    if (uploadQueue.length) {
      processQueue(uploadQueue.pop())
    }
  }, [uploadQueue]);

  /*
  React.useEffect(() => {
    console.log('qqqqqqq', uploadQueue);
    if (uploadQueue.length === 1) {
      console.log('start upload', uploadQueue[0]);
      const sourceData = sourceList[uploadQueue[0]];
      prepareUploadSource(config.SQLite.dbfile, sourceData[0]).then((res)=>{
        console.log('prepare', res);

        uploadSource(config.SQLite.dbfile, sourceData[0]).then((res)=>{
          console.log('uploaded', res);
          setUploadQueue((ps)=>{
            ps.splice(0, 1);
            console.log(ps);
            return ps
          });
        });
      });
      //const sourceList[uploadQueue[0]][4];
    }
  }, [uploadQueue]);
  */
  const handleUpload = (e, sourceID) => {
    e.stopPropagation();
    //const updateSourceStatus = (uploadQueue.length === 0) ? 'U' : 'P';
    //set
    //uploadSource(config.SQLite.dbfile, source_id).then((res)=>{
      //setSourceList(res['data']);
     // console.log(res);
    //});
    const sourceIndex = sourceList.findIndex(x=>x[0] === sourceID);


    const sourceData = sourceList[sourceIndex];
      prepareUploadSource(config.SQLite.dbfile, sourceData[0]).then((res)=>{
        console.log('prepare', res);
        //setUploadQueue((ps) => ps.concat(res['data']['image_list']));
        setUploadQueue((ps) => [...ps, {
          sourceID: sourceData[0],
          imageList: res['data']['image_list'],
        }]);
      });
    //setUploadQueue((ps)=> [...ps, sourceIndex]);
  };

  const handleAddButton = (e) => {
    if (e.target.files.length) {
      const newPath = path.dirname(e.target.files[0].path);
      // check exists
      //const exists = folderList.filter((x)=> x.path === newPath);
      //if (exists.length) {
      //return null;
      //}
      setSourceLoaded(false);
      addFolder(config.SQLite.dbfile, newPath).then((res)=>{
        setSourceList(res['data']);
        setSourceLoaded(true);
      });
      //const folderName = newPath.split(path.sep).pop();
      //const dbFile = setting.section.SQLite.dbfile;
      //const thumbDir = setting.section.Thumbnail.destination;
    }
  }

  //console.log(sourceList);
  console.log('render | ', uploadQueue);
  return (
    <div className={classes.root}>
    <Grid container spacing={3} direction="row" justify="space-between" alignItems="flex-end">
    <Grid item sm={6}><Typography variant="h3" component="h1" color="textSecondary">影像來源目錄</Typography>
    </Grid>
    <Grid item sm={2} className={classes.cardAddButton}>
    <Button
    variant="contained"
    component="label"
    >
            + 新增來源目錄
    <input
    type="file"
    directory="true"
    webkitdirectory="true"
    hidden
    onChange={handleAddButton}
    />
    </Button>
    </Grid>
    </Grid>
    <hr />
    <Grid container spacing={3} className={classes.cardContainer}>
    {sourceLoaded ?
     sourceList.map((v, i) => (
       <SourceItem data={v} key={i} onDelete={handleDelete} onUpload={handleUpload} />
       ))
   : <div className={classes.progress}><LinearProgress /></div>
    }
    </Grid>
    </div>
  )
}
