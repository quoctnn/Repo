const { ipcRenderer } = require('electron');
function init() {
    window.isElectron = true
    window.ipcRenderer = ipcRenderer
    console.log("TEST", window, ipcRenderer)
}
init();