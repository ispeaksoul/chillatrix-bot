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
        console.error("Failed to fetch partial message:", error);
        return;
      }
    }

    if (message.author.bot) return;

    if (message.channel.type === 1) {
      try {
        const modChannelId = process.env.MOD_CHANNEL_ID;
        if (!modChannelId) {
          console.error("MOD_CHANNEL_ID not set in environment variables");
          return;
        }

        const modChannel = await client.channels.fetch(modChannelId);
        if (!modChannel) {
          console.error("Could not find mod channel with ID:", modChannelId);
          return;
        }

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
      } catch (error) {
        console.error("Failed to forward DM to mod channel:", error.message);
      }
      return;
    }

    const stickyData = client.stickyMessages?.get(message.channel.id);
    if (!stickyData) return;

    try {
      const prevStickyMsg = await message.channel.messages.fetch(
        stickyData.messageId,
      );
      if (prevStickyMsg) await prevStickyMsg.delete();

      const newStickyMsg = await message.channel.send(stickyData.content);

      client.stickyMessages.set(message.channel.id, {
        messageId: newStickyMsg.id,
        content: stickyData.content,
      });
    } catch (err) {
      console.error("Sticky message update error:", err.message);
    }
  },
};
