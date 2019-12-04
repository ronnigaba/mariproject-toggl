import {app, BrowserWindow, dialog, screen} from 'electron';
import {autoUpdater} from 'electron-updater';
import * as path from 'path';
import * as url from 'url';
// @ts-ignore
let win: BrowserWindow = null;
const args = process.argv.slice(1),
    serve = args.some(val => val === '--serve');
const log = require('electron-log');
log.transports.file.level = 'info';
log.transports.console.format = '{h}:{i}:{s} {text}';
log.info('Starting');
autoUpdater.logger = log;
// @ts-ignore
autoUpdater.logger.transports.file.level = 'debug';

function createWindow(): BrowserWindow {
    log.info('Loading');
    const electronScreen = screen;
    const size = electronScreen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    win = new BrowserWindow({
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
    win.autoHideMenuBar = true;
    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(`${__dirname}/node_modules/electron`)
        });
        win.loadURL('http://localhost:4200');
    } else {
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
    win.on('closed', () => {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        // @ts-ignore
        win = null;
    });
    return win;
}

function sendStatusToWindow(text: string): void {
    log.info(text);
    win.webContents.send('message', text);
}

try {
    autoUpdater.on('checking-for-update', () => {
        sendStatusToWindow('Checking for update...');
    });
    autoUpdater.on('update-available', (info) => {
        sendStatusToWindow('Update available.');
    });
    autoUpdater.on('update-not-available', (info) => {
        sendStatusToWindow('Update not available.');
    });
    autoUpdater.on('error', (error) => {
        console.error('There was a problem updating the application');
        console.error(error);
        sendStatusToWindow('Error in auto-updater. ' + error);
    });
    autoUpdater.on('download-progress', (progressObj) => {
        let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
        log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
        sendStatusToWindow(log_message);
    });
    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
        const dialogOpts = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: 'A new version has been downloaded. Restart the application to apply the updates.'
        };
        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    });
} catch (e) {
    log.error(e);
}
try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', createWindow);
    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
    app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
    try {
        app.on('ready', () => {
            autoUpdater.checkForUpdates().catch(x => {
                log.error(x);
            });
        });
    } catch (e) {
        log.error(e);
    }
} catch (e) {
    log.error(e);
}
