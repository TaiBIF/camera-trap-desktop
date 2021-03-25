const util = require('util');
import { runCommand } from './adapters/command';

const loadConfig = async() => {
  return await runCommand(`main.exe -i camera-trap-desktop.ini -o json`, true);
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
/*
const getImageList = async(db_file, source_id) => {
  return await runCommand(`main.exe -d ${db_file} -r image -a get -k ${source_id} -o json`, true);
}
*/
export {
  loadConfig,
  addFolder,
  getSource,
  deleteSource,
  saveAnnotation,
  updateImage,
}
