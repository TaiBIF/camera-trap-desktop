const path = require('path');

import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

import { ConfigContext } from '../app';
import { addFolder, getSource, deleteSource } from '../utils'

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
  cardItem: {
    padding: theme.spacing(2),
    //textAlign: 'center',
    color: theme.palette.text.secondary,
    '&:hover': {
      background: "#f1f1f1",
    },
  },
  cardAddButton: {
    textAlign: 'right',
    marginRight: theme.spacing(1),
  },
  removeButton: {
    textAlign: 'right',
  }
}));

export default function SourceListContainer({onChangeView}) {
  const classes = useStyles();

  const onDelete = (e, source_id) => {
    e.stopPropagation();
    if (confirm('確定刪除?')) {
      deleteSource(config.SQLite.dbfile, source_id).then((res)=>{
        setSourceList(res['data']);
      });
    }
  };

  const [sourceLoaded, setSourceLoaded] = React.useState(false);
  const [sourceList, setSourceList] = React.useState([]);

  const config = React.useContext(ConfigContext);

  React.useEffect(() => {
    getSource(config.SQLite.dbfile, '0').then((res)=>{
      setSourceLoaded(true);
      setSourceList(res['data']);
    });
  }, []);

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
          <Grid item sm={3} key={i}>
           <Paper className={classes.cardItem} key={i} onClick={(e) => onChangeView(e, 'image-list', v[0])}>
          <Typography gutterBottom variant="h6" color="textPrimary">
           {v[3]} ({v[4]})
          </Typography>
          <Typography variant="body2" gutterBottom>
          </Typography>
          <Typography variant="body2" color="textSecondary">
          {v[2]}
        </Typography>
          <Typography variant="subtitle2" style={{ cursor: 'pointer' }} className={classes.removeButton} onClick={(e) => onDelete(e, v[0])}>
          刪除
        </Typography>
          </Paper>
          </Grid>
       ))
       : <div className={classes.progress}><LinearProgress /></div>
      }
      </Grid>
      </div>
  )
}
