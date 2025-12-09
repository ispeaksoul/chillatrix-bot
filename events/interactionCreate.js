const { hasRequiredRole, hasAdminPermission } = require('../utils/permissions');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');


module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Handle slash commands
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
        console.error(error);
        await interaction.reply({ content: '❌ Error executing command.', flags: MessageFlags.Ephemeral });
      }
    }

    // Handle "Reply" button click from mod channel
    if (interaction.isButton() && interaction.customId.startsWith('reply_')) {
      const userId = interaction.customId.split('_')[1];

      const modal = new ModalBuilder()
        .setCustomId(`modal_reply_${userId}`)
        .setTitle(`Reply to ${userId}`);

      const input = new TextInputBuilder()
        .setCustomId('reply_message')
        .setLabel('Your message')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(input);
      modal.addComponents(row);

      return interaction.showModal(modal);
    }

    // Handle modal submission with the reply
    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_reply_')) {
      const userId = interaction.customId.split('_')[2];
      const replyContent = interaction.fields.getTextInputValue('reply_message');

      try {
        const user = await client.users.fetch(userId);
        await user.send(`📬 **Reply from the team:**\n${replyContent}`);
        await interaction.reply({ content: `✅ Replied to ${user.tag}`, flags: MessageFlags.Ephemeral });
      } catch (err) {
        console.error('Failed to send DM:', err);
        await interaction.reply({ content: '❌ Could not DM the user.', flags: MessageFlags.Ephemeral });
      }
    }
  }
};