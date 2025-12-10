const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config.json');

function getConfig() {
  try {
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading config:', error);
    return { requiredRoleIds: [], prefix: '!' };
  }
}

function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
}

function getPrefix() {
  const config = getConfig();
  return config.prefix || '!';
}

function setPrefix(newPrefix) {
  const config = getConfig();
  config.prefix = newPrefix;
  return saveConfig(config);
}

module.exports = { getConfig, saveConfig, getPrefix, setPrefix };
