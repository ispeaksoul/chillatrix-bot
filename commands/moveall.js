const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { MessageFlags } = require('discord.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('moveall')
    .setDescription('Move all members from one VC to another')
    .addChannelOption(option =>
      option.setName('from')
        .setDescription('Source voice channel')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('to')
        .setDescription('Target voice channel')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)
    ),
  async execute(interaction) {
    const fromChannel = interaction.options.getChannel('from');
    const toChannel = interaction.options.getChannel('to');

    // Check bot's permission to move members
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
      return interaction.reply({ content: '❌ I need the **Move Members** permission to do that.', flags: MessageFlags.Ephemeral });
    }

    const membersToMove = fromChannel.members;

    if (!membersToMove || membersToMove.size === 0) {
      return interaction.reply({ content: `❌ No members found in ${fromChannel.name}.`, flags: MessageFlags.Ephemeral });
    }

    for (const [_, member] of membersToMove) {
      try {
        await member.voice.setChannel(toChannel);
      } catch (err) {
        console.error(`❌ Failed to move ${member.user.tag}:`, err);
      }
    }

    await interaction.reply({
      content: `✅ Moved ${membersToMove.size} member(s) from ${fromChannel.name} to ${toChannel.name}.`,
      flags: MessageFlags.Ephemeral
    });
  }
};
