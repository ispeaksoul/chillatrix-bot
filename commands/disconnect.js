const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Disconnect a user from voice channel')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to disconnect')
        .setRequired(true)),
  async execute(interaction) {
    const member = interaction.options.getMember('target');

    if (!member) {
      return interaction.reply({ content: '❌ Could not find that user in this server.', flags: MessageFlags.Ephemeral });
    }

    if (!member.voice.channel) {
      return interaction.reply({ content: '❌ User is not in a voice channel.', flags: MessageFlags.Ephemeral });
    }

    try {
      await member.voice.disconnect();
      await interaction.reply(`❌ ${member.user.tag} has been disconnected from voice.`);
    } catch (error) {
      console.error('Disconnect error:', error);
      await interaction.reply({ content: '❌ Failed to disconnect the user.', flags: MessageFlags.Ephemeral });
    }
  }
};
