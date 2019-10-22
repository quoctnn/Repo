const { ipcRenderer, remote } = require('electron');

function init() {
    window.isElectron = true;
    window.electronVersion = process.versions.electron;
    window.ipcRenderer = ipcRenderer;
    window.appRoot = remote.app.getAppPath();
}
init();