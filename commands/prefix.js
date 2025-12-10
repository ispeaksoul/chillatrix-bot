const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { setPrefix } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('prefix')
    .setDescription('Change the bot prefix for text commands')
    .addStringOption(option =>
      option.setName('newprefix')
        .setDescription('The new prefix to use')
        .setRequired(true)
        .setMaxLength(5)),
  async execute(interaction) {
    const newPrefix = interaction.options.getString('newprefix');

    if (setPrefix(newPrefix)) {
      await interaction.reply(`✅ Prefix changed to \`${newPrefix}\``);
    } else {
      await interaction.reply({ content: '❌ Failed to change prefix.', flags: MessageFlags.Ephemeral });
    }
  }
};
