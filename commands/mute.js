const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user in voice channel')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to mute')
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
      await member.voice.setMute(true);
      await interaction.reply(`🔇 ${member.user.tag} has been muted.`);
    } catch (error) {
      console.error('Mute error:', error);
      await interaction.reply({ content: '❌ Failed to mute the user.', flags: MessageFlags.Ephemeral });
    }
  }
};
