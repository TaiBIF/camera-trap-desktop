import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
/*
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';

import TextField from '@material-ui/core/TextField';
*/
import Button from '@material-ui/core/Button';

// handsontable
import 'handsontable/dist/handsontable.full.css';
import { HotTable, HotColumn } from '@handsontable/react';

const HEADERS = ['status', '原始檔案', '日期時間', '物種', '年齡'];

const useStyles = makeStyles({
  table: {
    /*minWidth: 550,*/
  },
  container: {
    /*maxHeight: 440,*/
  },
  button: {
    margin: '10px 20px 0 0',
  }
});

//import {CellEditor} from './CellEditor';

const CellRender = ({value}) => {
  return (<div>{value}</div>)
};


//🐤🐥🍗📂
const STATUS_MAP = {
  '10': '📁',
  '20': '👀',
  '30': '📝',
  '100': '🔥',
  '110': '-',
  '200': '✔️',
}
const getStatus = (x) => {
  for (let i in STATUS_MAP) {
    if (STATUS_MAP[i] === x) {
      return i;
    }
  }
}

const DataTable = ({rowsInPage, count, onSave, onRow, columnState}) => {
  const classes = useStyles();
  //console.log('render DataTable', rowsInPage);
  //React.useEffect(() => {
  const tmp = rowsInPage.map((v) => {
    let lifestage = '';
    let sex = '';
    let species = '';
    let animal_id = '';
    let remarks = '';
    let antler = '';
    if (v[7]) {
      const jdata = JSON.parse(v[7]);
      lifestage = jdata.lifestage;
      sex = jdata.sex;
      species = jdata.species;
      animal_id = jdata.animal_id;
      antler = jdata.antler;
      remarks = jdata.remarks;
    }
    const d = new Date(v[3] * 1000);
    // cast datetime string
    const dateTime = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    return {
      image_id: v[0],
      status_display: STATUS_MAP[v[5]],
      status: v[5],
      filename: v[2],
      datetime: dateTime,
      lifestage: lifestage,
      sex: sex,
      species: species,
      animal_id: animal_id,
      antler: antler,
      remarks: remarks,
    };
  });

  const [data, setData] = React.useState(tmp);
  const [changeLogs, setChangeLogs] = React.useState([]);

//}, []);

  function coverRenderer(instance, td, row, col, prop, value, cellProperties) {
    //console.log(td, row, col, prop, value, cellProperties);
    console.log(prop, '|', value, '|',data[row][prop], data[row][prop] !== value, typeof(value))
    //if (value !== "")
    if (data[row][prop] !== value) {
      // changes
      console.log('write value',value);
    }
    return td
  }

  //const handleUpload = (e) => {
  //  console.log(rowsInPage);
  //}

  const updateData = (changes) => {
    if (changes) {
      //console.log('changes', changes);
      setData((ps)=> {
        for (let i=0; i<changes.length;i++) {
          const [row, prop, oldVal, newVal] = changes[i];
          ps[row][prop] = newVal;
          if (ps[row]['status'] === '20') {
            ps[row]['status'] = '30';
            ps[row]['status_display'] = STATUS_MAP['30'];
          }
        }
        return ps
      });
    }
  }
  const onRowClick = (rowIndex) => {
    if (rowIndex < 0) {
      return false;
    }

    setData((ps)=> {
      if (ps[rowIndex]['status'] === '10') {
        ps[rowIndex]['status'] = '20';
        ps[rowIndex]['status_display'] = STATUS_MAP['20'];
      }
      return ps
    })
    onRow(rowIndex);
  }


  // set status_display as first
  const columns = [{
    data: 'status_display',
    renderer: 'text',
    readOnly: true
  }];
  const headers = ['status'];
  for (let i in columnState) {
    const x = columnState[i];
    if (x.checked) {
      headers.push(x.label);
      const row = {
        data: i,
        renderer: 'text',
        readOnly: i.indexOf(['filename']) >= 0 ? true : false,
      };
      if (x.choices && x.choices.length > 0) {
        row.type = 'dropdown';
        row.source = x.choices;
      }
      columns.push(row);
    }
  }

  const settings = {
    data: data,
    colHeaders: headers,
    rowHeaders: true,
    licenseKey: 'non-commercial-and-evaluation',
    colWidths: [60, 200, 200, 150, 150],
    columns: columns,
    afterChange: updateData,
    afterSelectionEnd: onRowClick,
  };
  console.log('<DataTable> ColumnState', columnState);
  return (
    <>
    <HotTable id="ct-hot" settings={settings} />
    <Button variant="contained" color="primary" onClick={(e)=> onSave(e, data)} className={classes.button}>save</Button>
    </>
  )
}
//<Button variant="contained" color="secondary" onClick={handleUpload} className={classes.button}>Upload</Button>

/*
const DataTableMui = ({rowsInPage, count, onSave, onRowcol}) => {



  const ImageRows = ({rows}) => (
    rows.map(
      (row, index) => {
        let lifestage = '';
        let sex = '';

        if (row[6] !== "") {
          const jdata = JSON.parse(row[6]);
          lifestage = jdata.lifestage;
          sex = jdata.sex;
        }

        //const isSelected = (index === currentRow.index) ? true : false;
        const isSelected = false;
        const key = `ct-row${index}`;
        //console.log(annotationData);

        //<TextField key={key} id={key} variant="filled" value={annotationData[index].species || ''}  onChange={(e)=>handleFieldChange(e, index, 'species')} />
<TextField key={key} id={key} variant="outlined" value={annotationData[index]['sex'] || ''} onChange={(e)=>handleFieldChange(e, index, 'sex')} />

        const isFocus = (index === 2) ? true : false;
        console.log('render', row);
        return (
            <TableRow key={index} hover selected={isSelected}>
            <TableCell component="th" scope="row">{index+1}</TableCell>
            <TableCell align="right">{row[2]}</TableCell>
            <TableCell align="right" onClick={(e)=>onRow(e, index)}>{row[1]}</TableCell>
            <TableCell align="right">{row[3]}</TableCell>
            {isFocus ?
             <TableCell align="right"><TextField defaultValue="" className="ct-input" id={key+"-species"} key={key+"-species"} autoFocus={true} /></TableCell>
             :
             <TableCell align="right"><TextField defaultValue="" className="ct-input" id={key+"-species"} key={key+"-species"} /></TableCell>
            }
            <TableCell align="right"><TextField defaultValue="" className="ct-input" id={key+"-sex"} /></TableCell>
            </TableRow>
        )
      }
      ));
  return (
      <>
      <TableContainer component={Paper} className={classes.container}>
      <Table className={classes.table} aria-label="simple table" stickyHeader size="small">
      <TableHead>
      <TableRow>
      <TableCell>#</TableCell>
      <TableCell align="right">status</TableCell>
      <TableCell align="right">原始檔名</TableCell>
      <TableCell align="right">日期時間</TableCell>
      <TableCell align="right">物種</TableCell>
      <TableCell align="right">備註</TableCell>
      </TableRow>
      </TableHead>
      <TableBody>
      <ImageRows rows={rowsInPage} />
    </TableBody>
      </Table>
      </TableContainer>
        <TablePagination
    rowsPerPageOptions={[20, 50, 100]}
    component="div"
    count={count}
    rowsPerPage={rowsPerPage}
    page={page}
    onChangePage={handleChangePage}
    onChangeRowsPerPage={handleChangeRowsPerPage}
      />
      </>
  )
};
*/
export default DataTable;
