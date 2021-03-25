const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function runCommand(command, isJson){
  const {error, stdout, stderr} = await exec(command);

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
