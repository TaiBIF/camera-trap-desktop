const { app, protocol, BrowserWindow, Menu } = require('electron')
import * as path from "path";
import * as url from "url";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      //webSecurity: false,//});
      //contextIsolation: true, // https://github.com/electron/electron/issues/23506
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL(`http://localhost:4000?react_perf`);
    //mainWindow.webContents.openDevTools();
    //Menu.setApplicationMenu(null);
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }
}

app.whenReady().then(() => {
  createWindow();
  protocol.registerFileProtocol('atom', (request, callback) => {
    //console.log(request.url)
    const url = decodeURIComponent(request.url.substr(7));
    callback({ path: url })
  })
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
app.allowRendererProcessReuse = true;
