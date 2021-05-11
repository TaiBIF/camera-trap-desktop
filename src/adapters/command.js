const util = require('util');
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);
const path = require("path");
const fs = require("fs");



const useCommand = (cmd) => {
  //const hasMainExe = fs.existsSync(path.join(__dirname, '..\\..\\..\\..\\..\\..\\main.exe'));
  if (process.env.NODE_ENV === 'development') {
    return cmd.replace('main.exe', '.\\py-script\\venv\\Scripts\\python.exe .\\py-script\\main.py');
  } else {
    return cmd;
  }
}

async function runCommand(command, isJson){

  const cmd = useCommand(command)
  //console.log('run',cmd);
  const {error, stdout, stderr} = await exec(cmd);

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

  const cmd = useCommand(command)
  console.log('command callback', cmd);
  const child = child_process.exec(
    cmd,
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
          console.log('python stdout (callback)', out);
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
