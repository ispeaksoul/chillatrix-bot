const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Show server and user info'),
  async execute(interaction) {
    const { guild, channel, user } = interaction;
    await interaction.reply(`Server: ${guild.name}\nUser: ${user.tag}\nChannel: ${channel.name}`);
  },
};
