const { SlashCommandBuilder, ChannelType, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('move')
    .setDescription('Move a user to another voice channel')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to move')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Voice channel to move the user to')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)),
  async execute(interaction) {
    const member = interaction.options.getMember('target');
    const targetChannel = interaction.options.getChannel('channel');

    if (!member) {
      return interaction.reply({ content: '❌ Could not find that user in this server.', flags: MessageFlags.Ephemeral });
    }

    if (!member.voice.channel) {
      return interaction.reply({ content: '❌ User is not in a voice channel.', flags: MessageFlags.Ephemeral });
    }

    try {
      await member.voice.setChannel(targetChannel);
      await interaction.reply(`➡️ Moved ${member.user.tag} to ${targetChannel.name}`);
    } catch (error) {
      console.error('Move error:', error);
      await interaction.reply({ content: '❌ Failed to move the user.', flags: MessageFlags.Ephemeral });
    }
  }
};
