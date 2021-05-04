const util = require('util');
import { runCommand, runCommandCallback } from './adapters/command';

const INI_FILE = 'camera-trap-desktop.ini';

const loadConfig = async() => {
  return await runCommand(`main.exe -i ${INI_FILE} -o json`, true);
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
const uploadSourceCallback = (db_file, source_id) => {
  return runCommandCallback(`main.exe -d ${db_file} -i ${INI_FILE} -a batch-upload -k ${source_id} -o json`, true);
}
const prepareUploadSource = async(db_file, source_id) => {
  return await runCommand(`main.exe -d ${db_file} -i ${INI_FILE} -a prepare-upload -k ${source_id} -o json`, true);
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
export {
  loadConfig,
  addFolder,
  getSource,
  deleteSource,
  saveAnnotation,
  updateImage,
  uploadSource,
  uploadSourceCallback,
  prepareUploadSource,
  uploadImage,
  updateSourceDescription,
}
