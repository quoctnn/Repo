const { app, Menu, ipcMain } = require('electron')
const i18n = new(require('./translations/i18n'))
const path = require('path');
const url = require('url');
const name = app.getName()
const themeMenu = {
    label:'Theme',
    id:'theme.menu',
    submenu:[
          {
              label: 'Light Mode',
              type: 'checkbox',
              checked: false,
              click: function (menuItem, browserWindow, event) {
                  browserWindow.webContents.executeJavaScript('window.app.setTheme(0);');
              }
          },
          {
              label: 'Dark Mode',
              type: 'checkbox',
              checked: false,
              click: function (menuItem, browserWindow, event) {
                  browserWindow.webContents.executeJavaScript('window.app.setTheme(2);');
              }
          },
    ]
}
const template = [
  {
    label: name,
    submenu: [
      {
        label: i18n.__('Home'),
        click(menuItem, browserWindow, event) {
          browserWindow.loadURL(url.format({
            pathname: path.join(__dirname, './electron.html'),
            protocol: 'file:',
            slashes: true,
          }))
        }
      },
      {
        label: i18n.__('Hard reload'),
        click(menuItem, browserWindow, event) {
          browserWindow.webContents.executeJavaScript('window.app.hardReset();');
          browserWindow.loadURL(url.format({
            pathname: path.join(__dirname, './electron.html'),
            protocol: 'file:',
            slashes: true,
          }))
        }
      },
      {
        label: i18n.__('Soft reload'),
        click(menuItem, browserWindow, event) {
          browserWindow.webContents.executeJavaScript('window.app.softReset();');
          browserWindow.loadURL(url.format({
            pathname: path.join(__dirname, './electron.html'),
            protocol: 'file:',
            slashes: true,
          }))
        }
      },
      {
        type: 'separator'
      },
      themeMenu,
    ]
  },
  {
    label: i18n.__('Edit'),
    submenu: [
      {
        role: 'undo', label: i18n.__('Undo')
      },
      {
        role: 'redo', label: i18n.__('Redo')
      },
      {
        type: 'separator'
      },
      {
        role: 'cut', label: i18n.__('Cut')
      },
      {
        role: 'copy', label: i18n.__('Copy')
      },
      {
        role: 'paste', label: i18n.__('Paste')
      },
      {
        role: 'delete', label: i18n.__('Delete')
      },
      {
        role: 'selectall', label: i18n.__('Select all')
      }
    ]
  },
  {
    label: i18n.__('View'),
    id: 'view.menu',
    submenu: [
      {
        role: 'resetzoom', label: i18n.__('Actual size')
      },
      {
        role: 'zoomin', label: i18n.__('Zoom in')
      },
      {
        role: 'zoomout', label: i18n.__('Zoom out')
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen', label: i18n.__('Toggle fullscreen')
      }
    ]
  },
  {
    role: 'help', label: i18n.__('Help'),
    submenu: [
      {
        label: i18n.__('Terms of Use'),
        click () { require('electron').shell.openExternal('https://intra.work/terms/') }
      },
      {
        label: i18n.__('Privacy Policy'),
        click () { require('electron').shell.openExternal('https://intra.work/policy/') }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template[0] =
    {
    label: name,
    submenu: [
      {
        label: i18n.__('Home'),
        click(menuItem, browserWindow, event) {
          browserWindow.loadURL(url.format({
            pathname: path.join(__dirname, './electron.html'),
            protocol: 'file:',
            slashes: true,
          }))
        }
      },
      {
        label: i18n.__('Hard reload'),
        click(menuItem, browserWindow, event) {
          browserWindow.webContents.executeJavaScript('window.app.hardReset();');
          browserWindow.loadURL(url.format({
            pathname: path.join(__dirname, './electron.html'),
            protocol: 'file:',
            slashes: true,
          }))
        }
      },

      {
        label: i18n.__('Soft reload'),
        click(menuItem, browserWindow, event) {
          browserWindow.webContents.executeJavaScript('window.app.softReset();');
          browserWindow.loadURL(url.format({
            pathname: path.join(__dirname, './electron.html'),
            protocol: 'file:',
            slashes: true,
          }))
        }
      },
      themeMenu,
      {
        role: 'about', label: i18n.__('About') + " " + app.getName()
      },
      {
        type: 'separator'
      },
      {
        role: 'services', label: i18n.__('Services'),
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide', label: i18n.__('Hide') + " " + app.getName()
      },
      {
        role: 'hideothers', label: i18n.__('Hide others')
      },
      {
        role: 'unhide', label: i18n.__('Unhide')
      },
      {
        type: 'separator'
      },
      {
        role: 'quit', label: i18n.__('Quit') + " " + app.getName()
      }
    ]
  }
  template.splice(4, 0,
    {
      label: "Window",
      submenu: [
        {
          label: i18n.__('Close'),
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        },
        {
          label: i18n.__('Minimize'),
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: i18n.__('Zoom'),
          role: 'zoom'
        },
        {
          type: 'separator'
        },
        {
          label: i18n.__('Bring all to front'),
          role: 'front'
        }
      ]
    }
  )
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

ipcMain.on('themeUpdated', (event, msg) => {
    const themeMenu = menu.getMenuItemById("theme.menu")
    if(themeMenu)
    {
        themeMenu.submenu.items[0].checked = msg == 0;
        themeMenu.submenu.items[1].checked = msg == 2;
    }
})