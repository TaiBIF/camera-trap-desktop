const util = require('util');
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);

const pyVenvMain = '.\\py-script\\venv\\Scripts\\python.exe .\\py-script\\main.py';

async function runCommand(command, isJson){
  //console.log(__dirname, command);
  const command_ = command.replace('main.exe', pyVenvMain);

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
      return JSON.parse(stdout);
    } else {
      return stdout;
    }
  }
}

const runCommandCallback = (command, isJson) => {
  const command_ = command.replace('main.exe', pyVenvMain);

  const child = child_process.exec(
    command_,
    ((error, stdout, stderr) => {
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
          return JSON.parse(stdout);
        } else {
          return stdout;
        }
      }
  }));

  return child

}
export {runCommand, runCommandCallback}
