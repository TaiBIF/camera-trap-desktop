const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function runCommand(command, isJson){
  //console.log(__dirname, command);
  const pyVenvMain = '.\\py-script\\venv\\Scripts\\python.exe .\\py-script\\main.py';
  const command_ = command.replace('main.exe', pyVenvMain);
  //console.log(command, '|', new_cmd);
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

export {runCommand}
