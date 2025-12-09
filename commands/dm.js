const { SlashCommandBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('Send a private message to a user via DM')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to DM')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to send')
        .setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('target');
    const message = interaction.options.getString('message');

    try {
      await user.send(message);
      await interaction.reply({ content: `📩 Message sent to ${user.tag}`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('DM error:', error);
      await interaction.reply({ content: `❌ Failed to send a DM to ${user.tag}. They might have DMs disabled.`, flags: MessageFlags.Ephemeral });
    }
  }
};
