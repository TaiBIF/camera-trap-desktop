import { ipcRenderer } from 'electron'

import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { SnackbarProvider, useSnackbar } from 'notistack';

import { ConfigContext } from '../app';
import DataTable from './DataTable';
//import UploadStepper from './components/Folder/UploadStepper';
import DisplaySetting from './DisplaySetting';
import MenuSelector from './MenuSelector';
import ImageSequenceSetting from './ImageSequenceSetting';
import ImageViewer from './ImageViewer';

import {
  saveAnnotation,
  updateImage,
  updateSourceDescription,
} from '../utils';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  imageThumb: {
    '&:hover': {
      cursor: 'pointer',
    }
  }
});

const ACTIONS = {
  ACTIVATE_INTERVAL: 'activate-interval',
  UPDATE_INTERVAL: 'update-interval',
  OPEN_IMAGE_VIEWER: 'open-image-viewer',
  UPDATE_ROW_INDEX: 'update-row-index',
};


const editReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ACTIVATE_INTERVAL: {
      return {
        ...state,
        imageSequence: {
          interval: state.imageSequence.interval,
          activate: action.data,
        }
      };
    }
    case ACTIONS.UPDATE_INTERVAL: {
      return {
        ...state,
        imageSequence: {
          interval: action.data,
          activate: state.imageSequence.activate,
        }
      };
    }
    case ACTIONS.OPEN_IMAGE_VIEWER: {
      return {
        ...state,
        imageViewerOpen: action.data,
      };
    }
    case ACTIONS.UPDATE_ROW_INDEX: {
      return {
        ...state,
        currentRowIndex: action.data,
      };
    }
  }
}

const editInitState = {
  imageSequence: {
    interval: 3, // 3mins
    activate: false,
  },
  imageViewerOpen: false,
  currentRowIndex: 0,
};

const ImageListContainer = ({sourceData, onChangeView}) => {
  const classes = useStyles();

  const [openDisplaySetting, setOpenDisplaySetting] = React.useState(false);
  const initDesc = sourceData.source[7] ? JSON.parse(sourceData.source[7]) : null;
  const [menuSelect, setMenuSelect] = React.useState({
    project:{
      selected: initDesc ? initDesc.project_id : undefined,
      options:[]
    },
    studyarea:{
      selected: initDesc ? initDesc.studyarea_id : undefined,
      options:[]
    },
    deployment:{
      selected: initDesc ? initDesc.deployment_id : undefined,
      options:[]
    }
  });

  const [editState, dispatch] = React.useReducer(editReducer, editInitState);
  //console.log(editState);
  const config = React.useContext(ConfigContext);

  const [columnState, setColumnState] = React.useState(config.initColumn);
  const providerRef = React.useRef();

  React.useEffect(() => {
    const url = `${config.Server.host}${config.Server.project_api}`;
    ipcRenderer.invoke('request', url)
               .then((data) => {
                 //console.log(data.results);
                 setMenuSelect((ps) => ({
                   ...ps,
                   project:{
                     selected: ps.project.selected,
                     options: data.results
                   }
                 }));
                 return true
               }).catch((resp) => console.warn(resp));
  }, []);

  React.useEffect(() => {
    if (menuSelect.project.selected === undefined) {
      return null;
    }
    const url = `${config.Server.host}${config.Server.project_api}${menuSelect.project.selected}`;
    ipcRenderer
      .invoke('request', url)
      .then((data) => {
        console.log('proj', menuSelect, data);
        setMenuSelect((ps) => {
          let deploymentOptions = [];
          if (ps.deployment.selected) {
            const foundStudyArea = data.studyareas.find((x)=>x.studyarea_id===ps.studyarea.selected);
            //console.log(foundStudyArea);
            if (foundStudyArea && foundStudyArea.deployments.length > 0) {
              deploymentOptions = foundStudyArea.deployments.map((x)=> ({deployment_id: x.deployment_id, name: x.name}));
            }
          }
          return {
            ...ps,
            studyarea:{
              selected: ps.studyarea.selected,
              options: data.studyareas.map((x)=>({
                studyarea_id:x.studyarea_id,
                name: x.name,
              })),
            },
            deployment:{
              selected: ps.deployment.selected,
              options: deploymentOptions,
            },
            tmp: data.studyareas,
          }
        });
        return true
        }).catch((resp) => console.warn(resp));
  }, [menuSelect.project.selected]);

  React.useEffect(() => {
    if (menuSelect.studyarea.selected === undefined && menuSelect.studyarea.options.length > 0) {
      return null;
    }
    setMenuSelect((ps) => {
      const deploymentOptions = (ps.tmp && ps.tmp.length > 0) ? ps.tmp.find((x)=>x.studyarea_id===menuSelect.studyarea.selected).deployments.map((x)=> ({deployment_id: x.deployment_id, name: x.name})) : [];
      return {
        ...ps,
        studyarea:{
          selected: menuSelect.studyarea.selected,
          options: ps.studyarea.options,
        },
        deployment:{
          selected: ps.deployment.selected,
          options: deploymentOptions,
        },
      }
    });
  }, [menuSelect.studyarea.selected]);

  const handleImageSequenceInterval = (e, act, value) => {
    //console.log('int', act, value, e.target.value);
    if (act === 'activate') {
      dispatch({ type: ACTIONS.ACTIVATE_INTERVAL, data: value });
    } else if (act === 'update') {
      dispatch({ type: ACTIONS.UPDATE_INTERVAL, data: e.target.value });
    }
  }
  const handleColumnDisplayClick = (e, key) => {
    //console.log(e.target, key);
    setColumnState((ps)=>{
      const tmp = ps[key];
      tmp.checked = (tmp.checked) ? false : true;
      return {
        ...ps,
        [key]: tmp
      }
    })
  }

  const getImage = (index) => {
    if (index > -1) {
      const path = sourceData.image_list[index][1];

      try {
        //const base64 = fs.readFileSync(path).toString('base64');
        const winPath = path.replace(/\\/g, '\\\\'); // non-ascii error
        //console.log(path, winPath);
        //D:\\foto\\210316\P1180989.JPG
        //src: `data:image/jpg;base64,${base64}`,
        return `atom\://${winPath}`;
      } catch (e) {
        console.error(e);
        alert('????????????'); // TODO: 1) standard error message, 2) back to top or re-scan dir
      }
    }
  }

  const handleSaveButton = (e, data) => {
    console.table(data);
    //console.log(initColumnState);
    //const header = ['image_id', 'species', 'lifestage'];
    const trimData = data.map((row) => {
      const r = {};
      for (let x in row) {
        // datetime & filename read-only here
        if (['status_display', 'datetime', 'filename'].indexOf(x) < 0) {
          r[x] = row[x];
        }
      }
      return r;
    });
    //console.log(trimData);
    let put = JSON.stringify(trimData);
    //console.log(put);
    put = put.replace(/"/g, '\\"');
    put = put.replace(/\s/g, '\_BLANK_'); // TODO
    //console.log(put);
    if (confirm('????????????')) {
      saveAnnotation(config.SQLite.dbfile, put).then((res)=>{
        // refresh image list from main container
        //onChangeView(null, 'source-list');
        if (res && res.is_success) {
          //alert('save ok');
          providerRef.current.enqueueSnackbar(`????????????`, { variant:'success' });
        } else {
          //alert('save error', res);
          providerRef.current.enqueueSnackbar(`${res} | ???????????????`, { variant:'error' });
        }
      });
    }
  }
  const handleArrowClick = (e, dir) => {
    //console.log(e, dir, editState.currentRowIndex);
    let index = 0;
    if (dir === 'left') {
      index = editState.currentRowIndex - 1;
    } else if (dir === 'right') {
      index = editState.currentRowIndex + 1;
    }
    console.log(editState.currentRowIndex, index);
    if (index >= 0 && index < sourceData.image_list.length) {
      dispatch({
        type: ACTIONS.UPDATE_ROW_INDEX,
        data: index
      })
    }
  }

  const handleRowClick = (rowIndex) => {
    // prevent press on header
    if (rowIndex < 0) {
      return false;
    }
    const imageID = sourceData.image_list[rowIndex][0];
    //setCurrentRowIndex(rowIndex);
    dispatch({type: ACTIONS.UPDATE_ROW_INDEX, data: rowIndex});
    /*updateImage(config.SQLite.dbfile, 'status=O', imageID).then((res)=>{
      setCurrentRowIndex(rowIndex);
    });
    onChangeView(null, 'image-list', sourceData.source[0]);
    */
  }

  const handleMenuChange = (e, category) => {
    if (category === 'project') {
      setMenuSelect((ps)=> ({
        ...ps,
        project: {
          selected:e.target.value,
          options: ps.project.options
        },
      }));
    } else if (category === 'studyarea') {
      setMenuSelect((ps)=> ({
        ...ps,
        studyarea: {
          selected:e.target.value,
          options: ps.studyarea.options,
        }
      }));
    } else if (category === 'deployment') {
      const selected_id = e.target.value;
      setMenuSelect((ps)=> ({
        ...ps,
        deployment: {
          selected: selected_id,
          options: ps.deployment.options,
        }
      }));

      const t = {
        project_id: menuSelect.project.selected,
        project_name: menuSelect.project.options.find((x)=>x.project_id===menuSelect.project.selected).name,
        studyarea_id: menuSelect.studyarea.selected,
        studyarea_name: menuSelect.studyarea.options.find((x)=>x.studyarea_id===menuSelect.studyarea.selected).name,
        deployment_id: selected_id,
        deployment_name: menuSelect.deployment.options.find((x)=>x.deployment_id===selected_id).name,
      };
      let put = JSON.stringify(t);
      put = put.replace(/"/g, '\\"');
      console.log('put description', put);
      updateSourceDescription(config.SQLite.dbfile, sourceData.source[0], put).then((res)=>{
        console.log(res);
      });
    }
  }

  const ImagePreview = () => {
    const srcAtom = getImage(editState.currentRowIndex);
    return (
        <img src={srcAtom} width="100%" onClick={()=>dispatch({type: ACTIONS.OPEN_IMAGE_VIEWER, data: true})} className={classes.imageThumb} />
    )
  }

  console.log('<ImageListContainer>', sourceData, menuSelect, editState);

  return (
    <div className={classes.root}>
    <Grid container spacing={1}>
    <Grid item sm={12}>
    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
    <Link color="inherit" href="#" onClick={(e)=>onChangeView(e, 'source-list')}>??????</Link>
    <Typography color="textPrimary">{sourceData.source[3]}</Typography>
    </Breadcrumbs>
    </Grid>
    </Grid>
    <hr />
    <SnackbarProvider maxSnack={3} ref={providerRef}>
    <Button onClick={()=> setOpenDisplaySetting(true)} variant="outlined">
    ??????????????????
    </Button>
    {menuSelect ? <MenuSelector data={menuSelect} onChange={handleMenuChange} /> : null}
    <ImageSequenceSetting data={editState.imageSequence} onChangeInterval={handleImageSequenceInterval} key={editState.imageSequenceInterval} />
    <Grid container spacing={1}>
    <Grid item sm={8}>
    <DataTable count={sourceData.image_list.length} onSave={handleSaveButton} onRow={handleRowClick} rowsInPage={sourceData.image_list} columnState={columnState} editState={editState} />
    </Grid>
    <Grid item sm={4}>
    <ImagePreview />
    </Grid>
    </Grid>
    <ImageViewer onClose={()=>dispatch({type: ACTIONS.OPEN_IMAGE_VIEWER, data: false})} image={getImage(editState.currentRowIndex)} title={sourceData.image_list[editState.currentRowIndex][1]} open={editState.imageViewerOpen} onArrow={handleArrowClick} sourceData={sourceData} editState={editState} columnState={columnState} />
    <DisplaySetting openDisplaySetting={openDisplaySetting} setOpenDisplaySetting={setOpenDisplaySetting} columnState={columnState} onColumnDisplayClick={handleColumnDisplayClick} />
    </SnackbarProvider>
    </div>
  )
}
/*<UploadStepper /> TODO mui: transitions switch */
export default ImageListContainer;
