const { app, BrowserWindow, Tray, Menu, screen, ipcMain } = require('electron');
const path = require('path');
const { eventNames } = require('process');

let mainWindow;
let settingsWindow;
let tray;
let snowflakeCount = 100;
let selectedMonitor = 0;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	app.quit();
} else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		}
	});

	function createMainWindow() {
		const displays = screen.getAllDisplays();
		const { width, height, bounds } = displays[selectedMonitor].workArea;

		mainWindow = new BrowserWindow({
			width: width,
			height: height,
			frame: false,
			transparent: true,
			alwaysOnTop: true,
			skipTaskbar: true,
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true
			}
		});

		mainWindow.setIgnoreMouseEvents(true);
		mainWindow.loadFile('pages/index.html');

		tray = new Tray(path.join(__dirname, 'ico/icon.ico'));
		const contextMenu = Menu.buildFromTemplate([
			{ label: 'Show', click: () => mainWindow.show() },
			{ label: 'Hide', click: () => mainWindow.hide() },
			{ type:"separator" },
			{ label: 'Settings', click: createSettingsWindow },
			{ label: 'Quit', click: () => app.quit() }
		]);
		tray.setToolTip('Snowflakes App');
		tray.setContextMenu(contextMenu);

		setInterval(() => {
			mainWindow.setAlwaysOnTop(true, 'screen-saver');
		}, 1000);
	}

	function createSettingsWindow() {
		if (settingsWindow) {
			settingsWindow.focus();
			return;
		}

		settingsWindow = new BrowserWindow({
			width: 400,
			height: 300,
			frame: false,
			resizable: false,
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true
			}
		});

		settingsWindow.loadFile('pages/settings.html');

		settingsWindow.on('closed', () => {
			settingsWindow = null;
		});
	}

	ipcMain.on('update-snowflake-count', (event, count) => {
		snowflakeCount = count;
		mainWindow.webContents.send('update-snowflake-count', count);
	});

	ipcMain.on('get-snowflake-count', (event) => {
		event.sender.send('snowflake-count', snowflakeCount);
	});

	ipcMain.on('update-selected-monitor', (event, monitorIndex) => {
		selectedMonitor = monitorIndex;
		const displays = screen.getAllDisplays();
		const display = displays[monitorIndex];
		if (display) {
			const { width, height, x, y } = display.workArea;
			mainWindow.setSize(width, height);
			mainWindow.setPosition(x, y);
		}
	});

	ipcMain.on('get-monitors', (event) => {
		const monitors = screen.getAllDisplays().map((display, index) => ({
			index: index,
			label: `Monitor ${index + 1}`
		}));
		event.sender.send('monitors', monitors);
	});


	ipcMain.on('close-settings-window', () => {
		if (settingsWindow) {
			settingsWindow.close();
		}
	});

	app.whenReady().then(() => {
		createMainWindow();

		app.on('activate', () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				createMainWindow();
			}
		});
	});

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});
}