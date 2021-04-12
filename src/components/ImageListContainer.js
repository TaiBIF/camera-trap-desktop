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

import { saveAnnotation, updateImage } from '../utils'

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


  const config = React.useContext(ConfigContext);

  const confColumnLabels = config.Column.labels.split('|');
  const initColumnState = {};
  for (let i=0;i<confColumnLabels.length;i++) {
    const v = confColumnLabels[i].split(':');
    initColumnState[v[0]] = {
      key: v[0],
      label: v[1],
      checked: true,
      sort: i,
    }
  }
  //const initColumnState = confColumnLabels.map((x) => {
  //  const v = x.split(':')
  //  v.push(true);
  //  return (v)
  //});
  const [columnState, setColumnState] = React.useState(initColumnState);

  React.useEffect(() => {
  }, []);

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
  console.log(columnState,'--------');
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



  //console.log(sourceData);
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

      <Button onClick={()=> setOpenDisplaySetting(true)}>
      setting
    </Button>

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
