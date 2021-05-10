import { ipcRenderer } from 'electron'

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';

import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Link from '@material-ui/core/Link';

import Typography from '@material-ui/core/Typography';

import Button from '@material-ui/core/Button';

import { ConfigContext } from '../app';
import DataTable from './DataTable';
//import UploadStepper from './components/Folder/UploadStepper';
import DisplaySetting from './DisplaySetting';
import MenuSelector from './MenuSelector';

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


const ImageListContainer = ({sourceData, onChangeView}) => {
  const classes = useStyles();
  const [openImageScreen, setOpenImageScreen] = React.useState(false);
  const [currentRowIndex, setCurrentRowIndex] = React.useState(0)
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
  //console.log(initDesc);
  const config = React.useContext(ConfigContext);

  const confColumnLabels = config.Column.labels.split('|');
  const initColumnState = {};
  for (let i=0;i<confColumnLabels.length;i++) {
    const v = confColumnLabels[i].split(':');
    initColumnState[v[0]] = {
      key: v[0],
      label: v[1],
      checked: ['filename', 'datetime', 'species', 'lifestage'].indexOf(v[0]) >= 0 ? true : false,
      sort: i,
    }
  }

  const [columnState, setColumnState] = React.useState(initColumnState);

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
          const deploymentOptions = (ps.deployment.selected) ? data.studyareas.find((x)=>x.studyarea_id===ps.studyarea.selected).deployments.map((x)=> ({deployment_id: x.deployment_id, name: x.name})) : [];
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
        alert('讀檔錯誤'); // TODO: 1) standard error message, 2) back to top or re-scan dir
      }
    }
  }

  const handleSaveButton = (e, data) => {
    console.table(data);
    //const header = ['image_id', 'species', 'lifestage'];
    const trimData = data.map((x) => {
      //return [x.image_id, x.lifestage, x.species]
      return {
        image_id: x.image_id,
        lifestage: x.lifestage,
        species: x.species,
        status: x.status,
      }
    });

    let put = JSON.stringify(trimData);
    //console.log(put);
    put = put.replace(/"/g, '\\"');
    //console.log(put);
    if (confirm('確定要存')) {
      saveAnnotation(config.SQLite.dbfile, put).then((res)=>{
        // refresh image list from main container
        //onChangeView(null, 'source-list');
        if (res.is_success) {
          alert('save ok');
        }
      });
    }
  }
  const handleRowClick = (rowIndex) => {
    // prevent press on header
    if (rowIndex < 0) {
      return false;
    }
    const imageID = sourceData.image_list[rowIndex][0];
    setCurrentRowIndex(rowIndex);
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
    const srcAtom = getImage(currentRowIndex);
    return (
        <img src={srcAtom} width="100%" onClick={()=>setOpenImageScreen(true)} className={classes.imageThumb} />
    )
  }

  const ImageScreen = () => (
      <Dialog
      open={openImageScreen}
      onClose={()=>setOpenImageScreen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="lg"
      scroll="body"
        >
      <DialogTitle id="alert-dialog-title">{sourceData.image_list[currentRowIndex][1]}</DialogTitle>
      <DialogContent>
      <DialogContentText id="alert-dialog-description">
      <img src={getImage(currentRowIndex)} width="100%"/>
      </DialogContentText>
      </DialogContent>
      </Dialog>
  )


  console.log('<ImageListContainer>', sourceData, menuSelect);
  return (
      <div className={classes.root}>
      <Grid container spacing={1}>
      <Grid item sm={12}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
      <Link color="inherit" href="#" onClick={(e)=>onChangeView(e, 'source-list')}>目錄</Link>
      <Typography color="textPrimary">{sourceData.source[3]}</Typography>
      </Breadcrumbs>
      </Grid>
      </Grid>
      <hr />

      <Button onClick={()=> setOpenDisplaySetting(true)} variant="outlined">
      設定顯示欄位
      </Button>

      {menuSelect ? <MenuSelector data={menuSelect} onChange={handleMenuChange} /> : null}
      <Grid container spacing={1}>
      <Grid item sm={8}>
      <DataTable count={sourceData.image_list.length} onSave={handleSaveButton} onRow={handleRowClick} rowsInPage={sourceData.image_list} columnState={columnState} />
      </Grid>
      <Grid item sm={4}>
      <ImagePreview />
      </Grid>
      </Grid>
      <ImageScreen />
      <DisplaySetting openDisplaySetting={openDisplaySetting} setOpenDisplaySetting={setOpenDisplaySetting} columnState={columnState} onColumnDisplayClick={handleColumnDisplayClick} />
      </div>
  )
}
/*<UploadStepper /> TODO mui: transitions switch */
export default ImageListContainer;
