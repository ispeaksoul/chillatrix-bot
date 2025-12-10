const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Remove a role from a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to remove the role from')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to remove')
        .setRequired(true)),
  async execute(interaction) {
    const member = interaction.options.getMember('target');
    const role = interaction.options.getRole('role');

    if (!member) {
      return interaction.reply({ content: '❌ Could not find that user in this server.', flags: MessageFlags.Ephemeral });
    }

    if (!role) {
      return interaction.reply({ content: '❌ Could not find that role.', flags: MessageFlags.Ephemeral });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: '❌ I need the **Manage Roles** permission to do that.', flags: MessageFlags.Ephemeral });
    }

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ content: '❌ I cannot remove a role that is higher than or equal to my highest role.', flags: MessageFlags.Ephemeral });
    }

    if (role.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: '❌ You cannot remove a role that is higher than or equal to your highest role.', flags: MessageFlags.Ephemeral });
    }

    if (member.roles.highest.position >= interaction.member.roles.highest.position && member.id !== interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot manage roles for someone with an equal or higher role than you.', flags: MessageFlags.Ephemeral });
    }

    if (!member.roles.cache.has(role.id)) {
      return interaction.reply({ content: `❌ ${member.user.tag} doesn't have the ${role.name} role.`, flags: MessageFlags.Ephemeral });
    }

    try {
      await member.roles.remove(role);
      await interaction.reply(`✅ Removed **${role.name}** role from ${member.user.tag}`);
    } catch (error) {
      console.error('Remove role error:', error);
      await interaction.reply({ content: '❌ Failed to remove the role.', flags: MessageFlags.Ephemeral });
    }
  }
};
