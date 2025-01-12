const { app, BrowserWindow, Tray, Menu, screen, ipcMain } = require('electron');
const path = require('path');

let mainWindows = [];
let settingsWindow;
let tray;
let snowflakeCount = 100;
let allMonitors = false;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	app.quit();
} else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		if (mainWindows.length > 0) {
			mainWindows[0].focus();
		}
	});

	function createMainWindow(monitorIndex) {
		const displays = screen.getAllDisplays();
		if (monitorIndex >= 0 && monitorIndex < displays.length) {
			const { width, height, x, y } = displays[monitorIndex].workArea;

			const mainWindow = new BrowserWindow({
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
			mainWindow.setPosition(x, y);

			const intervalId = setInterval(() => {
				if (mainWindow.isDestroyed()) {
						clearInterval(intervalId);
				} else {
						mainWindow.setAlwaysOnTop(true, 'screen-saver');
				}
			}, 1000);

			return mainWindow;
		} else {
			console.error(`Monitor index ${monitorIndex} is out of bounds.`);
			return null;
		}
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
		mainWindows.forEach(window => {
			window.webContents.send('update-snowflake-count', count);
		});
	});

	ipcMain.on('update-selected-monitor', (event, monitorIndex) => {
		if (!allMonitors) {
			mainWindows.forEach(window => window.close());
			mainWindows = [];
			const newWindow = createMainWindow(monitorIndex);
			if (newWindow) {
				mainWindows.push(newWindow);
			}
		}
	});

	ipcMain.on('get-monitors', (event) => {
		const monitors = screen.getAllDisplays().map((display, index) => ({
			index: index,
			label: display.label
		}));
		event.sender.send('monitors', monitors);
	});

	ipcMain.on('get-snowflake-count', (event) => {
		event.sender.send('snowflake-count', snowflakeCount);
	});

	ipcMain.on('get-all-monitors-state', (event) => {
    event.sender.send('all-monitors-state', allMonitors);
	});

	ipcMain.on('close-settings-window', () => {
		if (settingsWindow) {
			settingsWindow.close();
		}
	});

	ipcMain.on('toggle-all-monitors', (event, checked) => {
		allMonitors = checked;
		if (allMonitors) {
			mainWindows.forEach(window => window.close());
			mainWindows = [];
			const displays = screen.getAllDisplays();
			displays.forEach((display, index) => {
				const newWindow = createMainWindow(index);
				if (newWindow) {
					mainWindows.push(newWindow);
				}
			});
		} else {
			mainWindows.forEach(window => window.close());
			mainWindows = [];
			const newWindow = createMainWindow(0);
			if (newWindow) {
				mainWindows.push(newWindow);
			}
		}
		event.sender.send('all-monitors-toggled', allMonitors);
	});

	app.whenReady().then(() => {
		const newWindow = createMainWindow(0);
		if (newWindow) {
			mainWindows.push(newWindow);
		}

		tray = new Tray(path.join(__dirname, 'ico/icon.ico'));
		const contextMenu = Menu.buildFromTemplate([
			{ label: 'Settings', click: createSettingsWindow },
			{ label: 'Quit', click: () => app.quit() }
		]);
		tray.setToolTip('Snowflakes');
		tray.setContextMenu(contextMenu);

		app.on('activate', () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				const newWindow = createMainWindow(0);
				if (newWindow) {
					mainWindows.push(newWindow);
				}
			}
		});
	});

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});
}
