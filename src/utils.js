const util = require('util');
const fs = require('fs');
const path = require('path');

import { runCommand, runCommandCallback } from './adapters/command';

const INI_FILE = 'camera-trap-desktop.ini';

const loadConfig = async() => {
  const res = await runCommand(`main.exe -i ${INI_FILE} -o json`, true);

  //
  const labels = res.data.Column.label_list.split(',');
  const defaultLabels = res.data.Column.default_list.split(',')
  const a = res.data.Column.annotation_list.split(',');
  const aMap = Object.assign({}, ...a.map((x) => {
    const v = x.split(':');
    return {
      [v[0]]: v[1]
    };
  }));

  const initColumn = {};
  for (let i=0; i<labels.length;i++) {
    const v = labels[i].split(':');
    let tmp = {
      key: v[0],
      label: v[1],
      checked: defaultLabels.indexOf(v[0]) >= 0 ? true : false,
      sort: i,
    };
    const k = `AnnotationField${aMap[v[0]]}`;
    if (res.data.hasOwnProperty(k)) {
      if (res.data[k].type && res.data[k].type === 'select') {
        tmp.choices = res.data[k].choices.split(',');
      }
    }
    initColumn[v[0]] = tmp;
  }
  res.data.initColumn = initColumn;

  return res.data
}
const getSource = async(db_file, source_id, with_image) => {
  if (with_image) {
    return await runCommand(`main.exe -d ${db_file} -r source -a get -k ${source_id} -m -o json`, true);
  }
  return await runCommand(`main.exe -d ${db_file} -r source -a get -k ${source_id} -o json`, true);
}
const deleteSource = async(db_file, source_id) => {
  return await runCommand(`main.exe -d ${db_file} -r source -a delete -k ${source_id} -o json`, true);
}
const addFolder = async(db_file, path) => {
  return await runCommand(`main.exe -d ${db_file} -f ${path} -o json`, true);
}
const saveAnnotation = async(db_file, data) => {
  return await runCommand(`main.exe -d ${db_file} -n ${data} -o json`, true);
}
const updateImage = async(db_file, data, resource_id) => {
  return await runCommand(`main.exe -d ${db_file} -r image -a update -v ${data} -k ${resource_id} -o json`, true);
}

const uploadSource = async(db_file, source_id) => {
  return await runCommand(`main.exe -d ${db_file} -i ${INI_FILE} -a batch-upload -k ${source_id} -o json`, true);
}

// for child.pid
const uploadSourceCallback = (db_file, source_id, cb_func) => {
  return runCommandCallback(`main.exe -d ${db_file} -i ${INI_FILE} -a batch-upload -k ${source_id} -o json`, true, ()=>cb_func(source_id));
}
const pollSourceStatus = async(db_file, source_id) => {
  return await runCommand(`main.exe -d ${db_file} -i ${INI_FILE} -a poll-source-status -k ${source_id} -o json`, true);
}
const uploadImage = async(db_file, image_id) => {
  return await runCommand(`main.exe -d ${db_file} -i ${INI_FILE} -a upload-image -k ${image_id} -o json`, true);
}
const updateSourceDescription = async(db_file, source_id, data) => {
  return await runCommand(`main.exe -d ${db_file} -a update-source-description -k ${source_id} -v ${data} -o json`, true);
}
/*
const getImageList = async(db_file, source_id) => {
  return await runCommand(`main.exe -d ${db_file} -r image -a get -k ${source_id} -o json`, true);
}
 */


const catLogger = (...args) => {
  console.log(...args);

  const logPath = path.join(
    __dirname,
    (process.env.NODE_ENV === 'development') ?
    '..\\..\\..\\..\\..\\..\\Debug.log' :
    '..\\..\\..\\Debug.log');

  const d = new Date();
  const dateTime = `[${d.getYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}:${d.getMilliseconds()}]`;
  const logFile = fs.createWriteStream(logPath, {flags : 'a'});
  logFile.write(dateTime + ' ' + util.format(args) + '\n')
  //process.stdout.write(util.format(s) + '\n');
};

const datetimePresenter = (timestamp) => {
  const d = new Date(timestamp * 1000);
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

export {
  loadConfig,
  addFolder,
  getSource,
  deleteSource,
  saveAnnotation,
  updateImage,
  uploadSource,
  uploadSourceCallback,
  pollSourceStatus,
  uploadImage,
  updateSourceDescription,
  catLogger,
  datetimePresenter,
}
