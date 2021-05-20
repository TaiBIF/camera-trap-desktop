const util = require('util');
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);
const path = require("path");
const fs = require("fs");
var os = require('os');


const useCommand = (cmd) => {
  //const hasMainExe = fs.existsSync(path.join(__dirname, '..\\..\\..\\..\\..\\..\\main.exe'));
  //console.log(os.type()); // "Windows_NT"
  //console.log(os.release()); // "10.0.14393"
  //console.log(os.platform()); // "win32"
  let pythonExe, mainExe;

  const platform = os.platform();
  if (platform === 'darwin') {
    pythonExe = path.join('py-script', 'venv', 'bin', 'python');
    mainExe = path.join('py-script', 'main.py')
  } else if (platform === 'win32') {
    pythonExe = path.join('py-script', 'venv', 'Scripts', 'python.exe');
    mainExe = path.win32.join('py-script', 'main.py')
  }
  //console.log(pythonExe, );
  if (process.env.NODE_ENV === 'development') {
    //'.\\py-script\\venv\\Scripts\\python.exe .\\py-script\\main.py
    return cmd.replace('main.exe', `./${pythonExe} ./${mainExe}`);
  } else {
    return cmd;
  }
}

async function runCommand(command, isJson){
  try {
    const cmd = useCommand(command)
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
  } catch(error) {
    console.error('command error: ', error);
    return error
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
