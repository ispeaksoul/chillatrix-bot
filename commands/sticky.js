const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sticky")
    .setDescription("Create a sticky message in a specified channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to create sticky message in")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The sticky message content")
        .setRequired(true),
    ),

  async execute(interaction, client) {
    const channel = interaction.options.getChannel("channel");
    const text = interaction.options.getString("message");

    if (!channel.isTextBased()) {
      return interaction.reply({
        content: "Please select a text-based channel.",
        ephemeral: true,
      });
    }

    try {
      const stickyMsg = await channel.send(text);

      if (!client.stickyMessages) client.stickyMessages = new Map();

      client.stickyMessages.set(channel.id, {
        messageId: stickyMsg.id,
        content: text,
      });

      await interaction.reply({
        content: `Sticky message created in ${channel}.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error sending sticky message:", error);
      await interaction.reply({
        content: "Failed to send sticky message.",
        ephemeral: true,
      });
    }
  },
};
