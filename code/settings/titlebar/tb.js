const { ipcRenderer } = require('electron');

	function closeWindow() {
		ipcRenderer.send('close-settings-window');
	}

	function saveSettings() {
		const snowflakeCount = document.getElementById('snowflakeCount').value;
		const selectedMonitor = document.getElementById('monitorSelect').value;

		if (snowflakeCount >= 1 && snowflakeCount <= 10000) {
			ipcRenderer.send('update-snowflake-count', parseInt(snowflakeCount, 10));
			ipcRenderer.send('update-selected-monitor', selectedMonitor);

			const isSave = document.getElementById('isSave');
			isSave.style.display = 'block';
			function d() {isSave.style.display = 'none'}
			setTimeout(d, 3000)
		} else {
			//
		}
	}

// Populate the monitor select options
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

// Get the current snowflake count and update the input field
ipcRenderer.send('get-snowflake-count');
ipcRenderer.on('snowflake-count', (event, count) => {
	document.getElementById('snowflakeCount').value = count;
});