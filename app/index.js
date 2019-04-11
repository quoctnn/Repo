const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

let win;
function webViewLoadFailed() {

}

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
        backgroundColor: 'f3f3f3',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    win.loadURL(url.format({
        pathname: path.join(__dirname, './electron.html'),
        protocol: 'file:',
        slashes: true,
    }))

    // Navigate back to start if page failed to load
    win.webContents.on('did-fail-load', function() {
        win.loadURL(url.format({
            pathname: path.join(__dirname, './electron.html'),
            protocol: 'file:',
            slashes: true,
        }))
    });

    // Open devtools
    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    });

    require('./menu');
}



app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin'){
        app.quit();
    }
});