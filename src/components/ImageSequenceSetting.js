import React from 'react';

import {
  FormGroup,
  FormControlLabel,
  FormControl,
  Switch,
  TextField,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  seqMinute: {
    width: '50px',
  },
}));

const ImageSequenceSetting = ({data, onChangeInterval}) => {
  const classes = useStyles();

  console.log('<ImageSequenceSetting>', data);

  return (
    <>
    <FormGroup row>
    <FormControlLabel
    control={
      <Switch
      checked={data.activate}
      onChange={(e)=>onChangeInterval(e, 'activate', !data.activate)}
      name="checked"
      color="primary"
      />
    }
    label="連拍自動補齊"
    />

    <TextField
    className={classes.seqMinute}
    id="standard-number"
    label="分鐘"
    type="number"
    size="small"
    value={data.interval || ''}
    onChange={(e)=>onChangeInterval(e, 'update')}
    />
    <Tooltip title="相鄰照片間隔__分鐘，自動補齊所編輯的欄位資料">
    <IconButton aria-label="info">
    <InfoIcon />
    </IconButton>
    </Tooltip>

    </FormGroup>
    </>
  )
}

export default ImageSequenceSetting;
