const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Delete a number of messages in the current channel")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (1–100)")
        .setRequired(true),
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    // Permission check
    if (!interaction.member.permissions.has("ManageMessages")) {
      return interaction.reply({
        content: "❌ You don't have permission to delete messages.",
        ephemeral: true,
      });
    }

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: "❌ Please provide a number between 1 and 100.",
        ephemeral: true,
      });
    }

    try {
      await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({
        content: `✅ Deleted ${amount} messages.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content:
          "❌ Failed to delete messages. They may be older than 14 days.",
        ephemeral: true,
      });
    }
  },
};
