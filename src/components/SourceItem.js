import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Box from '@material-ui/core/Box';

import Chip from '@material-ui/core/Chip';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Tooltip from '@material-ui/core/Tooltip';

const LinearProgressWithLabel = (props) => {
  return (
    <Box display="flex" alignItems="center">
    <Box width="100%" mr={1}>
    <LinearProgress variant="determinate" {...props} />
    </Box>
    <Box minWidth={35}>
    <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value,
        )}%`} {`${props.title}`}</Typography>
    </Box>
    </Box>
  );
}

const useStyles = makeStyles((theme) => ({
  cardItem: {
    padding: theme.spacing(2),
    //textAlign: 'center',
    height: '85%',
    color: theme.palette.text.secondary,
    '&:hover': {
      background: "#f1f1f1",
    },
  },
  cardFooter: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
  removeButton: {
    textAlign: 'right',
  },
  cardProgress: {
    marginTop: theme.spacing(1),
    width: '100%',
  },
  chipList: {
    display: 'flex',
    '& > *': {
      marginRight: theme.spacing(0.5),
    }
  }
}));

const checkUploadState = (row, uploading, isClicked) => {
  //{progress && progress.value == 100 ? true : false}
  const ret = {
    state: 'init',
    variant: 'contained',
    color: 'primary',
    title: '上傳',
  }

  if (uploading) {
    ret.state = 'uploading';
    ret.color = 'secondary';
    ret.title = '上傳中';
  } else {
    if (row[6] === 'I' && !isClicked) {
    //if ((!isClicked & row.length <=8) & row[7] > 0) {

    } else {
      ret.state = 'uploaded'
      ret.title = '已上傳';
      ret.variant = 'outlined';
      ret.color = 'default';
    }
  }
  return ret;
}

  export default function SourceItem({data, onDelete, onUpload, progress}) {
    const classes = useStyles();
    const v = data;
    //const uploadProgress = (data[6] === 'I' ) ? 0 : 100;
    //const uploadProgressTitle = `(${uploadQueue}/${data[4]})`;
    const [isUploading, setIsUploading] = React.useState(false);
    const [isClickUpload, setIsClickUpload] = React.useState(false);

    const clickUploadButton = (e, v) => {
      e.stopPropagation();
      setIsUploading(true);
      setIsClickUpload(true);
      onUpload(e, v[0]);
    }

    if (isUploading && progress === null) {
      setIsUploading(false);
    }
    const uploadState = checkUploadState(v, isUploading, isClickUpload);
    const desc = JSON.parse(data[7]);
    const chipList = <div className={classes.chipList}>
    <Tooltip title={desc.project_name}><Chip label="計劃" color="primary" key={desc.project_name} /></Tooltip>
    <Chip label={`${desc.studyarea_name} / ${desc.deployment_name}`} icon=<LocationOnIcon /> color="primary" variant="outlined" key={desc.deployment_name} />
    </div>;

    return (
      <Paper className={classes.cardItem}>
      <Grid container>
      <Grid item sm={12}>
      { v[7] ? chipList : null}
      <Typography gutterBottom variant="h6" color="textPrimary">
      {v[3]} ({v[4]})
      </Typography>
      <Typography variant="body2" gutterBottom>
      </Typography>
      <Typography variant="body2" color="textSecondary">
      {v[2]}
      </Typography>
      </Grid>
      </Grid>
      <Grid container justify="space-between" alignItems="stretch">
      <Grid item sm={3}>
      <Button
      variant="outlined"
      component="label"
      size="small"
      className={classes.cardFooter}
      onClick={(e) => onDelete(e, v[0])}
      >刪除
      </Button>
      </Grid>
      <Grid item sm={3}>
      <Button
      variant={uploadState.variant}
      component="label"
      size="small"
      color={uploadState.color}
      className={classes.cardFooter}
      onClick={(e) => clickUploadButton(e, v)}
      >{uploadState.title}
      </Button>
      </Grid>
      </Grid>
      <div className={classes.cardProgress}>
      {progress ?
       <LinearProgressWithLabel value={progress.value} title={progress.title}/> : null}
      </div>
      </Paper>
    )
  }
