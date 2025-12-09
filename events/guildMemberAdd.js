module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    const welcomeChannelId = process.env.WELCOME_CHANNEL_ID || "1309058126217084984";
    const channel = member.guild.channels.cache.get(welcomeChannelId);

    if (!channel) return;

    channel.send(
      `🎉 Welcome to the server, <@${member.id}>! We're glad to have you here.`,
    );
  },
};
