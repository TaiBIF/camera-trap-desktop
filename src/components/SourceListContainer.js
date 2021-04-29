const path = require('path');

import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import { SnackbarProvider, useSnackbar } from 'notistack';

import { ConfigContext } from '../app';
import {
  addFolder,
  getSource,
  deleteSource,
  uploadSource,
  uploadSourceCallback,
  prepareUploadSource,
  uploadImage,
} from '../utils'
import SourceItem from './SourceItem';


const POLLING_INTERVAL = 3000;

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
  const config = React.useContext(ConfigContext);
  //const { enqueueSnackbar } = useSnackbar();
  const providerRef = React.useRef();

  const [uploadQueue, setUploadQueue] = React.useState([]); // sourceID
  const [sourceLoaded, setSourceLoaded] = React.useState(false);
  const [sourceList, setSourceList] = React.useState([]);
  const [counter, setCounter] = React.useState(0);

  if (counter > 0 && uploadQueue.length === 0) {
    setCounter(0);
  }

  React.useEffect(() => {
    //console.log('init');
    //console.time('boot')

    getSource(config.SQLite.dbfile, '0').then((res)=>{
      setSourceLoaded(true);
      console.log(res);
      //console.timeLog('boot')
      setSourceList(res['data']);
      //console.timeEnd('boot')
    });

  }, []);

  React.useEffect( () => {
    if(counter && uploadQueue.length > 0) {
      const sources = uploadQueue.map((x)=>x.sourceID).join(',');
      prepareUploadSource(config.SQLite.dbfile, sources).then((res)=>{
        console.log('poll res:', res['data']);
        setUploadQueue((ps)=>{
          for (let i in res['data']) {
            const idx = ps.findIndex((x)=> parseInt(x.sourceID, 10) === parseInt(i, 10));
            if (idx >= 0) {
              ps[idx].count = res['data'][i];
            }
          }
          return ps;
        });
        setSourceList((ps)=>{
          for (let i in res['data']) {
            const idx = ps.findIndex((x)=> parseInt(x[0], 10) === parseInt(i, 10));
            if (idx >= 0) {
              ps[idx][8] = res['data'][i];
            }
          }
          return ps;
        });
      });
      var timer = setTimeout(() => setCounter(counter + 1), POLLING_INTERVAL);
    }
    return () => clearTimeout(timer);
  }, [counter]);

  const handleDelete = (e, source_id) => {
    e.stopPropagation();
    if (confirm('確定刪除?')) {
      deleteSource(config.SQLite.dbfile, source_id).then((res)=>{
        setSourceList(res['data']);
      });
    }
  };

  const handleUpload = (e, sourceID) => {
    e.stopPropagation();

    // start polling
    setCounter(counter+1);
    const child = uploadSourceCallback(config.SQLite.dbfile, sourceID);

    setUploadQueue((ps)=>[...ps, {
      sourceID: sourceID,
      pid: child.pid,
      count: 0,
    }]);
    setSourceList((ps)=> {
      const ret = ps.map((x)=> [...x, 0]);
      return ret;
    })
  };

  const handleCancelButton = (e) => {
    //child.kill();
    // windows need do this
    for (let q of uploadQueue) {
      var spawn = require('child_process').spawn;
      spawn('taskkill', ['/pid', q.pid, '/f', '/t']);
    }
    setCounter(0);
    setUploadQueue([]);
  }

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
    }
  }

  //console.log(sourceList);
  console.log('render |', uploadQueue);

  const getUploadProgress = (source) => {
    if (uploadQueue.length > 0) {
      const qIndex = uploadQueue.findIndex((x)=> parseInt(x.sourceID, 10) === parseInt(source[0], 10));
      const q = uploadQueue[qIndex];

      if (q) {
        if (q.count === source[4]) {
          // finish batch upload
          setUploadQueue((ps)=> {
            ps.splice(qIndex, 1);
            return ps
          });
          providerRef.current.enqueueSnackbar(`${source[3]} | 上傳完成`, { variant:'success' });
          return {
            count: q.count,
            total: source[4],
            title: `${q.count}/${source[4]}`,
            value: (q.count / source[4]) * 100,
            done: true,
          };
        }
        return {
          count: q.count,
          total: source[4],
          title: `${q.count}/${source[4]}`,
          value: (q.count / source[4]) * 100,
        };
      }
    } else {
      setCounter(0);
    }
    return null
  }

  return (
    <div className={classes.root}>
    <Grid container spacing={3} direction="row" justify="space-between" alignItems="flex-end">
    <Grid item sm={6}><Typography variant="h3" component="h1" color="textSecondary">影像來源目錄</Typography>
    </Grid>
    <Grid item sm={2}>
    {/*
    <Button
    variant="contained"
    component="label"
    onClick={handleCancelButton}
    >
    cancel upload
    </Button>*/}
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
    <SnackbarProvider maxSnack={3} ref={providerRef}>
    <Grid container spacing={3} className={classes.cardContainer} alignItems="stretch">
    {sourceLoaded ?
     sourceList.map((v, i) => (
       <Grid item sm={3} key={i} onClick={(e)=>onChangeView(e, 'image-list', v[0])}>
       <SourceItem data={v} onDelete={handleDelete} onUpload={handleUpload} progress={uploadQueue.length > 0 ? getUploadProgress(v) : null} />
       </Grid>
       ))
   : <div className={classes.progress}><LinearProgress /></div>
    }
    </Grid>
    </SnackbarProvider>
    </div>
  )
}
