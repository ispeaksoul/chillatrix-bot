const { PermissionsBitField } = require('discord.js');
const config = require('../config.json');

function hasRequiredRole(member) {
  if (!member || config.requiredRoleIds.length === 0) return false;
  return config.requiredRoleIds.some(id => member.roles.cache.has(id));
}

function hasAdminPermission(member) {
  return member?.permissions?.has(PermissionsBitField.Flags.Administrator) ?? false;
}

module.exports = { hasRequiredRole, hasAdminPermission };
