"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var electron_updater_1 = require("electron-updater");
var path = require("path");
var url = require("url");
// @ts-ignore
var win = null;
var args = process.argv.slice(1), serve = args.some(function (val) { return val === '--serve'; });
var log = require('electron-log');
log.transports.file.level = 'info';
log.transports.console.format = '{h}:{i}:{s} {text}';
log.info('Starting');
electron_updater_1.autoUpdater.logger = log;
// @ts-ignore
electron_updater_1.autoUpdater.logger.transports.file.level = 'info';
function createWindow() {
    log.info('Loading');
    var electronScreen = electron_1.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            allowRunningInsecureContent: true,
        },
    });
    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
        win.loadURL('http://localhost:4200');
    }
    else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    if (serve) {
        win.webContents.openDevTools();
    }
    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        // @ts-ignore
        win = null;
    });
    return win;
}
function sendStatusToWindow(text) {
    log.info(text);
    win.webContents.send('message', text);
}
try {
    electron_updater_1.autoUpdater.on('checking-for-update', function () {
        sendStatusToWindow('Checking for update...');
    });
    electron_updater_1.autoUpdater.on('update-available', function (info) {
        sendStatusToWindow('Update available.');
    });
    electron_updater_1.autoUpdater.on('update-not-available', function (info) {
        sendStatusToWindow('Update not available.');
    });
    electron_updater_1.autoUpdater.on('error', function (err) {
        sendStatusToWindow('Error in auto-updater. ' + err);
    });
    electron_updater_1.autoUpdater.on('download-progress', function (progressObj) {
        var log_message = 'Download speed: ' + progressObj.bytesPerSecond;
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
        log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
        sendStatusToWindow(log_message);
    });
    electron_updater_1.autoUpdater.on('update-downloaded', function (info) {
        sendStatusToWindow('Update downloaded');
    });
}
catch (e) {
    log.error(e);
}
try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    electron_1.app.on('ready', createWindow);
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
    try {
        electron_1.app.on('ready', function () {
            electron_updater_1.autoUpdater.checkForUpdatesAndNotify().catch(function (x) {
                log.error(x);
            });
        });
    }
    catch (e) {
        log.error(e);
    }
}
catch (e) {
    log.error(e);
}
//# sourceMappingURL=main.js.map