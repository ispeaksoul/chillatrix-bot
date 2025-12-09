const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all available commands'),
  async execute(interaction) {
    await interaction.reply(
      '**Available commands:**\n' +
      '/hello - Say hello\n' +
      '/info - Show server and user info\n' +
      '/say <message> - Send a message in the current channel\n' +
      '/dm <target> <message> - Send a private message to a user\n' +
      '/clear <amount> - Delete messages in the current channel (1-100)\n' +
      '/mute <target> - Mute a user in voice channel\n' +
      '/unmute <target> - Unmute a user in voice channel\n' +
      '/move <target> <channel> - Move a user to another voice channel\n' +
      '/moveall <from> <to> - Move all members from one VC to another\n' +
      '/disconnect <target> - Disconnect a user from voice channel\n' +
      '/sticky <channel> <message> - Create a sticky message in a channel'
    );
  },
};
