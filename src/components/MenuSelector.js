import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import {
  updateSource,
} from '../utils'

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const MenuSelector = ({data, onChange}) => {
  const classes = useStyles();
  console.log('<MenuSelector>', data);

  return (
    <div>
    <FormControl className={classes.formControl}>
    <InputLabel id="simple-select-label-project">計劃</InputLabel>
    <Select
      labelId="simple-select-label-project"
      id="simple-select-project"
      value={data.project.selected}
      onChange={(e)=>onChange(e, 'project')}
      key={data.project.selected}
    >
    {data.project.options.map((x)=>
      <MenuItem value={x.project_id} key={x.project_id}>{x.name}</MenuItem>
    )}
    </Select>
    </FormControl>
    {data.studyarea ?
    <FormControl className={classes.formControl}>
    <InputLabel id="simple-select-label-studyarea">樣區</InputLabel>
    <Select
      labelId="simple-select-label-studyarea"
      id="simple-select-studyarea"
      value={data.studyarea.selected}
      onChange={(e)=>onChange(e, 'studyarea')}
      key={data.studyarea.selected}
    >
    {data.studyarea.options.map((x)=>
    <MenuItem value={x.studyarea_id} key={x.studyarea_id}>{x.name}</MenuItem>
    )}
    </Select>
      </FormControl>
      : null}
    {data.deployment ?
     <FormControl className={classes.formControl}>
      <InputLabel id="simple-select-label-deployment">相機位置</InputLabel>
      <Select
        labelId="simple-select-label-deployment"
        id="simple-select-deployment"
        value={data.deployment.selected}
        onChange={(e)=>onChange(e, 'deployment')}
        key={data.deployment.selected}
        >
      {data.deployment.options.map((x)=>
        <MenuItem value={x.deployment_id} key={x.deployment_id}>{x.name}</MenuItem>
      )}
        </Select>
      </FormControl>
      : null}
    </div>
  )
}
export default MenuSelector;


/*


      <FormControl className={classes.formControl}>
        <InputLabel id="simple-select-label-substudyarea">子樣區</InputLabel>
        <Select
          labelId="simple-select-label-substudyarea"
          id="simple-select-substudyarea"
          value={''}
          onChange={handleChange}
        >
    {data.map((x)=>
          <MenuItem value={x.category_id}>{x.name}</MenuItem>
      )}
        </Select>
    </FormControl>
*/
