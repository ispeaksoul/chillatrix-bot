const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.partial) {
      try {
        message = await message.fetch();
      } catch (error) {
        console.error("❌ Failed to fetch partial message:", error);
        return;
      }
    }

    if (message.author.bot) return;

    // Check for DM
    if (message.channel.type === 1) {
      const modChannel = await client.channels.fetch(
        process.env.MOD_CHANNEL_ID,
      );
      if (!modChannel) return;

      const embed = new EmbedBuilder()
        .setTitle(`📨 New DM from ${message.author.tag}`)
        .setDescription(message.content || "*No text content*")
        .setColor("Blue")
        .setFooter({ text: `User ID: ${message.author.id}` })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`reply_${message.author.id}`)
          .setLabel("Reply")
          .setStyle(ButtonStyle.Primary),
      );

      await modChannel.send({ embeds: [embed], components: [row] });
    }

    if (message.author.bot) return;

    const stickyData = client.stickyMessages?.get(message.channel.id);
    if (!stickyData) return;

    try {
      // Delete previous sticky message
      const prevStickyMsg = await message.channel.messages.fetch(
        stickyData.messageId,
      );
      if (prevStickyMsg) await prevStickyMsg.delete();

      // Send new sticky message
      const newStickyMsg = await message.channel.send(stickyData.content);

      // Update stored sticky message ID
      client.stickyMessages.set(message.channel.id, {
        messageId: newStickyMsg.id,
        content: stickyData.content,
      });
    } catch (err) {
      // Handle missing messages or permissions errors silently
      console.error("Sticky message update error:", err);
    }
  },
};
