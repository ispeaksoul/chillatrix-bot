const { hasRequiredRole, hasAdminPermission } = require('../utils/permissions');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      const member = interaction.member;
      if (!hasRequiredRole(member) && !hasAdminPermission(member)) {
        return interaction.reply({ content: '❌ You do not have a required role to use this command.', flags: MessageFlags.Ephemeral });
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error('Command execution error:', error);
        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '❌ Error executing command.', flags: MessageFlags.Ephemeral });
          } else {
            await interaction.reply({ content: '❌ Error executing command.', flags: MessageFlags.Ephemeral });
          }
        } catch (replyError) {
          console.error('Failed to send error reply:', replyError);
        }
      }
    }

    if (interaction.isButton() && interaction.customId.startsWith('reply_')) {
      const userId = interaction.customId.split('_')[1];

      const modal = new ModalBuilder()
        .setCustomId(`modal_reply_${userId}`)
        .setTitle('Reply to User');

      const input = new TextInputBuilder()
        .setCustomId('reply_message')
        .setLabel('Your message')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(input);
      modal.addComponents(row);

      return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_reply_')) {
      const userId = interaction.customId.split('_')[2];
      const replyContent = interaction.fields.getTextInputValue('reply_message');

      try {
        const user = await client.users.fetch(userId);
        await user.send(`📬 **Reply from the team:**\n${replyContent}`);

        const replyEmbed = new EmbedBuilder()
          .setTitle(`📤 Reply sent to ${user.tag}`)
          .setDescription(replyContent)
          .setColor("Green")
          .setFooter({ text: `Replied by ${interaction.user.tag}` })
          .setTimestamp();

        await interaction.reply({ embeds: [replyEmbed] });
      } catch (err) {
        console.error('Failed to send DM:', err);
        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '❌ Could not DM the user. They may have DMs disabled.', flags: MessageFlags.Ephemeral });
          } else {
            await interaction.reply({ content: '❌ Could not DM the user. They may have DMs disabled.', flags: MessageFlags.Ephemeral });
          }
        } catch (replyError) {
          console.error('Failed to send error reply:', replyError);
        }
      }
    }
  }
};
