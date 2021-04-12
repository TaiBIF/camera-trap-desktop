import React from 'react';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
//import DialogActions from '@material-ui/core/DialogActions';
//import IconButton from '@material-ui/core/IconButton';
//import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

const DisplaySetting = ({openDisplaySetting, setOpenDisplaySetting, columnState, onColumnDisplayClick}) => {
  const [state, setState] = React.useState({
    checkedA: true,
    checkedB: true,
    checkedF: true,
    checkedG: true,
  });

  const handleChange = (event) => {
    //setState({ ...state, [event.target.name]: event.target.checked });
  };
  const columnList = [];
  for (let i in columnState) {
    columnList.push(columnState[i]);
  }
  //console.log(columnList);
  columnList.sort((a,b)=> a.sort - b.sort);
  return (
      <Dialog
      open={openDisplaySetting}
      onClose={()=>setOpenDisplaySetting(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="lg"
      scroll="body"
        >
      <DialogTitle id="alert-dialog-title">Setting</DialogTitle>
      <DialogContent>
      <DialogContentText id="alert-dialog-description">
      labels
      </DialogContentText>
      <FormGroup row>
      {columnList.map((x, i) => (
          <FormControlLabel
        key={i}
        control={<Checkbox checked={x.checked} onChange={(e)=>onColumnDisplayClick(e, x.key)} name={x.key} color="primary" />}
        label={x.label}
          /> ))
      }
      </FormGroup>

      </DialogContent>
      </Dialog>
  )
}
export default DisplaySetting;
