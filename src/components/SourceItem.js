import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Box from '@material-ui/core/Box';

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
  }
}));

export default function SourceItem({data, onDelete, onUpload}) {
  const classes = useStyles();
  const v = data;

  const uploadProgress = (data[6] === 'I' ) ? 0 : 100;
  const uploadProgressTitle = `(0/${data[4]})`;
  return (
       <Grid item sm={3}>
       <Paper className={classes.cardItem} onClick={(e) => onChangeView(e, 'image-list', v[0])}>
       <Grid container>
       <Grid item sm={12}>
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
       <Grid container justify="space-between">
       <Grid item sm={3}>
       <Button
       variant="contained"
       component="label"
       size="small"
       className={classes.cardFooter}
       onClick={(e) => onDelete(e, v[0])}
       >刪除
       </Button>
       </Grid>
       <Grid item sm={3}>
       <Button
       variant="contained"
       component="label"
       size="small"
       color="primary"
       className={classes.cardFooter}
       onClick={(e) => onUpload(e, v[0])}
       >上傳
       </Button>
       </Grid>
       </Grid>
       <Grid container>
       <Grid item>
       </Grid>
       <div className={classes.cardProgress}>
       <LinearProgressWithLabel value={uploadProgress} title={uploadProgressTitle}/>
       </div>
       </Grid>
       </Paper>
    </Grid>
  )
}
