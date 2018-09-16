const electron = require("electron");
const { app, BrowserWindow, Menu } = electron;
require("electron-reload")(__dirname);
var ipcMain = require("electron").ipcMain;

let mainWindow, browserWindow;

function createMainWindow() {
  //const server = require("./server/server");
  mainWindow = new BrowserWindow({ width: 800, height: 600 });
  // mainWindow.maximize();
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.webContents.openDevTools();
  mainWindow.on("closed", function() {
    mainWindow = null;
  });
  // Build menu
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Set Menu
  Menu.setApplicationMenu(mainMenu);
}

var windows = {
  opened: [],
  x: 100,
  y: 100
};

function createNewWindow(windowName) {
  if (!windows.opened.includes(windowName)) {
    windows.opened.push(windowName); // Add window to window array
    let newWindow = new BrowserWindow({
      width: 800,
      height: 600,
      parent: mainWindow,
      x: windows.x,
      y: windows.y
    });
    newWindow.loadURL(`file://${__dirname}/modules/${windowName}.html`);
    newWindow.webContents.openDevTools();
    windows.x += 100;
    windows.y += 100;
    newWindow.setMenu(null); // Remove menu from child windows
    newWindow.on("closed", function() {
      windows.opened = windows.opened.filter(win => win != windowName); // Return only open windows
      newWindow = null;
      windows.x -= 100;
      windows.y -= 100;
    });
    return newWindow;
  }
}

// Pass in a string i.e. module name
function openWindow(windowName) {
  // Don't open the same window twice. Focus the open one instead.
  windows.opened.includes(windowName)
    ? browserWindow.focus()
    : (browserWindow = createNewWindow(windowName));
}

const mainMenuTemplate = [
  {
    label: "Модули",
    submenu: [
      {
        label: "Налози",
        click() {
          openWindow("journals");
        }
      }
    ]
  }
];

ipcMain.on("set-journal-active-id", (e, args) => {
  console.log(args);
  browserWindow.webContents.send("set-journal-active-id", args);
});

app.on("ready", createMainWindow);
