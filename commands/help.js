const { SlashCommandBuilder } = require('discord.js');
const { getPrefix } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all available commands'),
  async execute(interaction) {
    const prefix = getPrefix();
    await interaction.reply(
      '**Slash Commands:**\n' +
      '/hello - Say hello\n' +
      '/info - Show server and user info\n' +
      '/ping - Check bot latency\n' +
      '/say <message> - Send a message in the current channel\n' +
      '/dm <target> <message> - Send a private message to a user\n' +
      '/clear <amount> - Delete messages in the current channel (1-100)\n' +
      '/mute <target> - Mute a user in voice channel\n' +
      '/unmute <target> - Unmute a user in voice channel\n' +
      '/move <target> <channel> - Move a user to another voice channel\n' +
      '/moveall <from> <to> - Move all members from one VC to another\n' +
      '/disconnect <target> - Disconnect a user from voice channel\n' +
      '/sticky <channel> <message> - Create a sticky message\n' +
      '/addrole <target> <role> - Add a role to a user\n' +
      '/removerole <target> <role> - Remove a role from a user\n' +
      '/prefix <new> - Change the command prefix\n\n' +
      `**Prefix Commands (current: \`${prefix}\`):**\n` +
      `Use \`${prefix}help\` in chat for prefix command list`
    );
  },
};
