const util = require('util');
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);
const path = require("path");
const fs = require("fs");

const pyVenvMain = '.\\py-script\\venv\\Scripts\\python.exe .\\py-script\\main.py';

async function runCommand(command, isJson){
  //console.log(__dirname, command);
  //const hasExe = fs.existsSync(path.join(__dirname, 'py-script'));
  const hasMainExe = fs.existsSync(path.join(__dirname, 'main.exe'));
  //const hasExe = false;
  //const command_ = (hasMainExe) ? command : command.replace('main.exe', pyVenvMain);

  //const command_ = (process.env.NODE_ENV === 'development') ? command.replace('main.exe', pyVenvMain) : command;
  const command_ = command;
  console.log(process.env.NODE_ENV, command_, hasMainExe);

  const {error, stdout, stderr} = await exec(command_);

  if (error) {
    console.error(`error: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }

  if (stdout) {
    if (isJson) {
      try {
        return JSON.parse(stdout);
      } catch(e) {
        console.error(e);
        console.log('python stdout', stdout);
      }
    } else {
      return stdout;
    }
  }
}

const runCommandCallback = (command, isJson, errCallback) => {
  //const command_ = command.replace('main.exe', pyVenvMain);
  const command_ = command;

  const child = child_process.exec(
    command_,
    ((error, stdout, stderr) => {
      if (error) {
        console.error(`error: ${error.message}`);
        errCallback();
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }

      if (stdout) {
        if (isJson) {
          const out = JSON.parse(stdout)
          //console.log(out);
          if (!out.is_success) {
            errCallback();
          }
          return JSON.parse(stdout);
        } else {
          return stdout;
        }
      }
  }));

  return child

}
export {runCommand, runCommandCallback}
