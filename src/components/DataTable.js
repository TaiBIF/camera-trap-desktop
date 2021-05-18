import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

// use handsontable
import 'handsontable/dist/handsontable.full.css';
import { HotTable, HotColumn } from '@handsontable/react';

import {datetimePresenter} from '../utils';

const useStyles = makeStyles({
  table: {
    /*minWidth: 550,*/
  },
  container: {
    /*maxHeight: 440,*/
  },
  button: {
    margin: '10px 20px 0 0',
  },
});

//import {CellEditor} from './CellEditor';

//🐤🐥🍗📂
const STATUS_MAP = {
  '10': '📁',
  '20': '👀',
  '30': '📝',
  '100': '🔥',
  '110': '-',
  '200': '✔️',
}

const DataTable = ({rowsInPage, count, onSave, onRow, columnState, editState}) => {
  const classes = useStyles();
  let lastTimestamp = rowsInPage[0][3];

  //React.useEffect(() => {
  //}, []);

  const renderStatusCell = (instance, td, row, col, prop, value, cellProperties) => {
    td.innerHTML = STATUS_MAP[value];
  }

  const renderCell = (instance, td, row, col, prop, value, cellProperties) => {
    //console.log(instance, td, row, col, prop, value, cellProperties)

    if (sequenceMap[row][0] > 0 ) {
      td.style.backgroundColor = `hsl(${sequenceMap[row][1]},50%, 95%, 0.8)`;
    }
    if (prop === 'datetime' && value) {
      const lastRow = Math.min(Math.max(0, row-1), rowsInPage.length);
      value = datetimePresenter(value);
    }
    td.innerHTML = value;
  };

  const sequenceMap = [];
  let combinePrev = false;
  let combineNext = false;
  let seqID = 0;
  let salt = Math.random();
  const golden_ratio_conjugate = 0.618033988749895;
  // via: https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/

  const tmp = rowsInPage.map((v, i) => {
    let lifestage = '';
    let sex = '';
    let species = '';
    let animal_id = '';
    let remarks = '';
    let antler = '';
    let image_sequence = 0;

    if (v[7]) {
      const jdata = JSON.parse(v[7]);
      lifestage = jdata.lifestage;
      sex = jdata.sex;
      species = jdata.species;
      animal_id = jdata.animal_id;
      antler = jdata.antler;
      remarks = jdata.remarks;
    }
    const nextIndex = Math.min(i+1, rowsInPage.length-1);
    const nextTimeStamp = rowsInPage[nextIndex][3];

    combinePrev = combineNext;
    if (nextTimeStamp && (nextTimeStamp - v[3]) <= editState.imageSequence.interval*60) {
      combineNext = true;
    } else {
      combineNext = false;
    }
    if (combineNext === true && combinePrev === false) {
      seqID += 1;
      salt += golden_ratio_conjugate;
      salt %= 1;
    }
    if (editState.imageSequence.activate && (combineNext || combinePrev)) {
      sequenceMap.push([seqID, salt*256]);
    } else {
      sequenceMap.push([0, 0]);
    }
    //console.log(i, combineNext, combinePrev, seqID, x);

    return {
      image_id: v[0],
      status: v[5],
      filename: v[2],
      datetime: v[3],
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


  const updateData = (changes) => {
    if (changes) {
      //console.log('changes', changes);
      setData((ps)=> {
        for (let i=0; i<changes.length;i++) {
          const [row, prop, oldVal, newVal] = changes[i];
          const seqID = sequenceMap[row][0];
          ps[row][prop] = newVal;
          if (ps[row]['status'] === '20') {
            ps[row]['status'] = '30';
            //ps[row]['status_display'] = STATUS_MAP['30'];
          }
          if (editState.imageSequence.activate) {
            for (let i=0; i<ps.length ;i++) {
              if (sequenceMap[i][0] === seqID) {
                console.log(i, ps[i], prop, newVal, seqID);
                ps[i][prop] = newVal;
              }
            }
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
        //ps[rowIndex]['status_display'] = STATUS_MAP['20'];
      }
      return ps
    })
    onRow(rowIndex);
 }


  // set status_display as first
  const columns = [{
    data: 'status',
    renderer: renderStatusCell,
    readOnly: true
  }];
  const headers = ['status'];

  for (let i in columnState) {
    const x = columnState[i];
    if (x.checked) {
      headers.push(x.label);
      const row = {
        data: i,
        renderer: renderCell,
        readOnly: (['datetime', 'filename'].indexOf(i)) >= 0 ? true : false,
      };
      if (x.choices && x.choices.length > 0) {
        row.type = 'dropdown';
        row.source = x.choices;
      }
      columns.push(row);
    }
  }
  //console.log(sequenceMap);
  const settings = {
    data: data,
    colHeaders: headers,
    rowHeaders: true,
    licenseKey: 'non-commercial-and-evaluation',
    colWidths: [60, 200, 200, 150, 150],
    columns: columns,
    afterChange: updateData,
    afterSelectionEnd: onRowClick,
    height: 500,
  };
  console.log('<DataTable> ColumnState', columnState);
  return (
    <>
    <HotTable id="ct-hot" settings={settings} />
    <Button variant="contained" color="primary" onClick={(e)=> onSave(e, data)} className={classes.button}>save</Button>
    </>
  )
}
/** settings
    hiddenColumns: {
      columns: [0, 1],
    }
*/

export default DataTable;
