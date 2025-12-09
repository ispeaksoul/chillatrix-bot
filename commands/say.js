const { SlashCommandBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot say something in this channel')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to say')
        .setRequired(true)
    ),
  async execute(interaction) {
    const message = interaction.options.getString('message');

    try {
      await interaction.channel.send(message);
      await interaction.reply({ content: '✅ Message sent.', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('Error in /say command:', error);
      await interaction.reply({ content: '❌ Failed to send the message.', flags: MessageFlags.Ephemeral });
    }
  },
};
