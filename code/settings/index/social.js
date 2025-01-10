const { shell } = require('electron');

const social_telegram = document.querySelector('.social img:nth-child(1)');
const social_steam = document.querySelector('.social img:nth-child(2)');
const social_discord = document.querySelector('.social img:nth-child(3)');

social_telegram.addEventListener('click', function() {
  shell.openExternal('https://t.me/cuburuka');
});

social_steam.addEventListener('click', function() {
  shell.openExternal('https://steamcommunity.com/id/cuburuka/');
});

social_discord.addEventListener('click', function() {
  shell.openExternal('https://discord.gg/ZmBKFjvhZp');
});
