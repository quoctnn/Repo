const {app, BrowserWindow, ipcMain, shell} = require('electron');
const path = require('path');
const url = require('url');

if (require('electron-squirrel-startup')) app.quit();

let win;
let modal;
function createWindow() {
    win = new BrowserWindow({
        width: 1440,
        height: 900,
        icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
        backgroundColor: 'f3f3f3',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: false,
            preload: path.join(__dirname, './preload.js'),
            nativeWindowOpen:true,
        }
    })

    win.loadURL(url.format({
        pathname: path.join(__dirname, './electron.html'),
        protocol: 'file:',
        slashes: true,
    }))

    // Open devtools
    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    });
    win.webContents.on('new-window', function(event, url){
        console.log('new-window', url, event)
        event.preventDefault();
        shell.openExternal(url);
      });
    require('./menu');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin'){
        app.quit();
    }
});
