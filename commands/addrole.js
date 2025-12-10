const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('Add a role to a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to add the role to')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to add')
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
      return interaction.reply({ content: '❌ I cannot assign a role that is higher than or equal to my highest role.', flags: MessageFlags.Ephemeral });
    }

    if (role.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: '❌ You cannot assign a role that is higher than or equal to your highest role.', flags: MessageFlags.Ephemeral });
    }

    if (member.roles.highest.position >= interaction.member.roles.highest.position && member.id !== interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot manage roles for someone with an equal or higher role than you.', flags: MessageFlags.Ephemeral });
    }

    if (member.roles.cache.has(role.id)) {
      return interaction.reply({ content: `❌ ${member.user.tag} already has the ${role.name} role.`, flags: MessageFlags.Ephemeral });
    }

    try {
      await member.roles.add(role);
      await interaction.reply(`✅ Added **${role.name}** role to ${member.user.tag}`);
    } catch (error) {
      console.error('Add role error:', error);
      await interaction.reply({ content: '❌ Failed to add the role.', flags: MessageFlags.Ephemeral });
    }
  }
};
