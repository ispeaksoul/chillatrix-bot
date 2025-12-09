const { SlashCommandBuilder, MessageFlags } = require('discord.js');

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
    const messageContent = interaction.options.getString('message');

    if (!user) {
      return interaction.reply({ content: '❌ Could not find that user.', flags: MessageFlags.Ephemeral });
    }

    try {
      await user.send(messageContent);
      await interaction.reply({ content: `📩 Message sent to ${user.tag}`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('DM error:', error);
      if (error.code === 50007) {
        await interaction.reply({ content: `❌ Cannot send DM to ${user.tag}. They may have DMs disabled or have blocked the bot.`, flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: `❌ Failed to send a DM to ${user.tag}.`, flags: MessageFlags.Ephemeral });
      }
    }
  }
};
