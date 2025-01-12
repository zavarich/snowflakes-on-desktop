const { ipcRenderer } = require('electron');

function closeWindow() {
	ipcRenderer.send('close-settings-window');
}

function saveSettings() {
	const snowflakeCount = document.getElementById('snowflakeCount').value;
	const selectedMonitor = document.getElementById('monitorSelect').value;
	if (snowflakeCount >= 1 && snowflakeCount <= 1000) {
		ipcRenderer.send('update-snowflake-count', parseInt(snowflakeCount, 10));
		ipcRenderer.send('update-selected-monitor', selectedMonitor);
		alert('Settings saved: ' + snowflakeCount + ', Monitor: ' + selectedMonitor);
	} else {
		alert('Please enter a valid number between 1 and 1000.');
	}
}

function toggleAllMonitors() {
	const allMonitorsCheckbox = document.getElementById("zzzz");
	ipcRenderer.send('toggle-all-monitors', allMonitorsCheckbox.checked);
}

ipcRenderer.send('get-monitors');
ipcRenderer.on('monitors', (event, monitors) => {
	const monitorSelect = document.getElementById('monitorSelect');
	monitors.forEach((monitor) => {
		const option = document.createElement('option');
		option.value = monitor.index;
		option.textContent = monitor.label;
		monitorSelect.appendChild(option);
	});
});

ipcRenderer.send('get-snowflake-count');
ipcRenderer.on('snowflake-count', (event, count) => {
	document.getElementById('snowflakeCount').value = count;
});

ipcRenderer.on('all-monitors-toggled', (event, allMonitors) => {
	const monitorSelect = document.getElementById('monitorSelect');
	monitorSelect.disabled = allMonitors;
	const allMonitorsCheckbox = document.getElementById('zzzz');
	allMonitorsCheckbox.checked = allMonitors;
});;

ipcRenderer.send('get-all-monitors-state');
ipcRenderer.on('all-monitors-state', (event, allMonitors) => {
  const allMonitorsCheckbox = document.getElementById('zzzz');
  allMonitorsCheckbox.checked = allMonitors;
  const monitorSelect = document.getElementById('monitorSelect');
  monitorSelect.disabled = allMonitors;
});