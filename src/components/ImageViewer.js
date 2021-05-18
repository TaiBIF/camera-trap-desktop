import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import {
  DialogActions,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Card,
}from '@material-ui/core';

//import  from '@material-ui/core/IconButton';
//import CloseIcon from '@material-ui/icons/Close';

import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';

const useStyles = makeStyles({
  arrow: {
    height: '100%',
    width: '50px',
  },
  wrapper: {
    textAlign: 'center',
    padding: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    borderRadius: 5,
    padding: '10px 10px',
    margin: '0px 20px',
    width: 'auto',
    boxShadow: '2px 2px 2px black',
    display: 'flex',
    justifyContent: 'center',
  },
});

const ImageViewer = ({onClose, image, title, open, onArrow, sourceData, editState, columnState}) => {
  const classes = useStyles();
  const onKeyDown = (e) => {
    if (['ArrowUp', 'ArrowLeft'].indexOf(e.code) >= 0) {
      onArrow(e, 'left');
    } else if (['ArrowDown', 'ArrowRight'].indexOf(e.code) >= 0 ){
      onArrow(e, 'right');
    }
  }
  const annotations = [];
  if (sourceData.image_list[editState.currentRowIndex][7]) {
    const data = JSON.parse(sourceData.image_list[editState.currentRowIndex][7]);
    for (let i in columnState) {
      if (data[i]) {
        console.log(i, data[i]);
        annotations.push(`${columnState[i].label}: ${data[i]}`);
      }
    }
  }
  return (
    <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
    maxWidth="lg"
    scroll="body"
    >
    <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
    <DialogContent>
    <DialogContentText id="alert-dialog-description">
    {editState.currentRowIndex+1}/{sourceData.image_list.length})  標注: {annotations.join(' | ')}
    </DialogContentText>
    <div className={classes.wrapper} onKeyDown={onKeyDown} tabIndex={0}>
    <KeyboardArrowLeftIcon onClick={(e)=>onArrow(e, 'left')} />
    <div>
    <Card className={classes.card}>
    <img src={image} width="100%"/>
    </Card>
    </div>
    <KeyboardArrowRightIcon onClick={(e)=>onArrow(e, 'right')} />
    </div>
    </DialogContent>
    </Dialog>
  )
}
export default ImageViewer
