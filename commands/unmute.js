const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a user in voice channel')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to unmute')
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
      await member.voice.setMute(false);
      await interaction.reply(`🔊 ${member.user.tag} has been unmuted.`);
    } catch (error) {
      console.error('Unmute error:', error);
      await interaction.reply({ content: '❌ Failed to unmute the user.', flags: MessageFlags.Ephemeral });
    }
  }
};
