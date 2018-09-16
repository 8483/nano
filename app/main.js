const electron = require("electron");
const { app, BrowserWindow, Menu } = electron;
require("electron-reload")(__dirname);

let mainWindow, window1, window2;

function createWindow() {
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

function createNewWindow(window) {
  if (!windows.opened.includes(window)) {
    windows.opened.push(window); // Add window to window array
    let newWindow = new BrowserWindow({
      width: 600,
      height: 400,
      parent: mainWindow,
      x: windows.x,
      y: windows.y
    });
    newWindow.loadURL(`file://${__dirname}/modules/${window}.html`);
    newWindow.webContents.openDevTools();
    windows.x += 100;
    windows.y += 100;
    newWindow.setMenu(null); // Remove menu from child windows
    newWindow.on("closed", function() {
      windows.opened = windows.opened.filter(win => win != window); // Return only open windows
      newWindow = null;
      windows.x -= 100;
      windows.y -= 100;
    });
    return newWindow;
  }
}

// Pass in a string i.e. module name
function openWindow(window) {
  let win = window;
  // Don't open the same window twice. Focus the open one instead.
  windows.opened.includes(win)
    ? window1.focus()
    : (window1 = createNewWindow(win));
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

app.on("ready", createWindow);
