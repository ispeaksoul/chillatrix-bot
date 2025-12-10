const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");
const { getPrefix, setPrefix } = require("../utils/configManager");
const { hasRequiredRole, hasAdminPermission } = require("../utils/permissions");

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

    const prefix = getPrefix();
    if (!message.content.startsWith(prefix)) {
      const stickyData = client.stickyMessages?.get(message.channel.id);
      if (stickyData) {
        try {
          const prevStickyMsg = await message.channel.messages.fetch(stickyData.messageId);
          if (prevStickyMsg) await prevStickyMsg.delete();
          const newStickyMsg = await message.channel.send(stickyData.content);
          client.stickyMessages.set(message.channel.id, {
            messageId: newStickyMsg.id,
            content: stickyData.content,
          });
        } catch (err) {
          console.error("Sticky message update error:", err.message);
        }
      }
      return;
    }

    if (!message.member || (!hasRequiredRole(message.member) && !hasAdminPermission(message.member))) {
      return message.reply("❌ You do not have permission to use commands.");
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    try {
      switch (commandName) {
        case "ping": {
          const sent = await message.reply("Pinging...");
          const latency = sent.createdTimestamp - message.createdTimestamp;
          const apiLatency = Math.round(client.ws.ping);
          await sent.edit(`🏓 Pong!\n**Bot Latency:** ${latency}ms\n**API Latency:** ${apiLatency}ms`);
          break;
        }

        case "help": {
          await message.reply(
            `**Available commands (prefix: \`${prefix}\`):**\n` +
            `\`${prefix}ping\` - Check bot latency\n` +
            `\`${prefix}help\` - Show this help message\n` +
            `\`${prefix}info\` - Show server and user info\n` +
            `\`${prefix}say <message>\` - Make the bot say something\n` +
            `\`${prefix}clear <amount>\` - Delete messages (1-100)\n` +
            `\`${prefix}mute @user\` - Mute a user in voice\n` +
            `\`${prefix}unmute @user\` - Unmute a user in voice\n` +
            `\`${prefix}move @user #channel\` - Move user to voice channel\n` +
            `\`${prefix}moveall #from #to\` - Move all users between VCs\n` +
            `\`${prefix}disconnect @user\` - Disconnect user from voice\n` +
            `\`${prefix}addrole @user @role\` - Add a role to a user\n` +
            `\`${prefix}removerole @user @role\` - Remove a role from a user\n` +
            `\`${prefix}prefix <new>\` - Change command prefix`
          );
          break;
        }

        case "info": {
          const { guild, channel, author } = message;
          await message.reply(`Server: ${guild.name}\nUser: ${author.tag}\nChannel: ${channel.name}`);
          break;
        }

        case "say": {
          if (args.length === 0) return message.reply("❌ Please provide a message.");
          await message.delete().catch(() => {});
          await message.channel.send(args.join(" "));
          break;
        }

        case "clear": {
          const amount = parseInt(args[0]);
          if (!amount || amount < 1 || amount > 100) {
            return message.reply("❌ Please provide a number between 1 and 100.");
          }
          if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply("❌ You don't have permission to delete messages.");
          }
          const deleted = await message.channel.bulkDelete(amount + 1, true);
          const reply = await message.channel.send(`✅ Deleted ${deleted.size - 1} messages.`);
          setTimeout(() => reply.delete().catch(() => {}), 3000);
          break;
        }

        case "mute": {
          const member = message.mentions.members.first();
          if (!member) return message.reply("❌ Please mention a user to mute.");
          if (!member.voice.channel) return message.reply("❌ User is not in a voice channel.");
          await member.voice.setMute(true);
          await message.reply(`🔇 ${member.user.tag} has been muted.`);
          break;
        }

        case "unmute": {
          const member = message.mentions.members.first();
          if (!member) return message.reply("❌ Please mention a user to unmute.");
          if (!member.voice.channel) return message.reply("❌ User is not in a voice channel.");
          await member.voice.setMute(false);
          await message.reply(`🔊 ${member.user.tag} has been unmuted.`);
          break;
        }

        case "disconnect": {
          const member = message.mentions.members.first();
          if (!member) return message.reply("❌ Please mention a user to disconnect.");
          if (!member.voice.channel) return message.reply("❌ User is not in a voice channel.");
          await member.voice.disconnect();
          await message.reply(`❌ ${member.user.tag} has been disconnected from voice.`);
          break;
        }

        case "move": {
          const member = message.mentions.members.first();
          const channel = message.mentions.channels.first();
          if (!member) return message.reply("❌ Please mention a user to move.");
          if (!channel || channel.type !== ChannelType.GuildVoice) {
            return message.reply("❌ Please mention a valid voice channel.");
          }
          if (!member.voice.channel) return message.reply("❌ User is not in a voice channel.");
          await member.voice.setChannel(channel);
          await message.reply(`➡️ Moved ${member.user.tag} to ${channel.name}`);
          break;
        }

        case "moveall": {
          const channels = message.mentions.channels;
          if (channels.size < 2) {
            return message.reply("❌ Please mention two voice channels: #from #to");
          }
          const channelArray = [...channels.values()];
          const fromChannel = channelArray[0];
          const toChannel = channelArray[1];
          if (fromChannel.type !== ChannelType.GuildVoice || toChannel.type !== ChannelType.GuildVoice) {
            return message.reply("❌ Both channels must be voice channels.");
          }
          const membersToMove = fromChannel.members;
          if (membersToMove.size === 0) {
            return message.reply(`❌ No members found in ${fromChannel.name}.`);
          }
          for (const [, m] of membersToMove) {
            try {
              await m.voice.setChannel(toChannel);
            } catch (err) {
              console.error(`Failed to move ${m.user.tag}:`, err);
            }
          }
          await message.reply(`✅ Moved ${membersToMove.size} member(s) from ${fromChannel.name} to ${toChannel.name}.`);
          break;
        }

        case "addrole": {
          const member = message.mentions.members.first();
          const role = message.mentions.roles.first();
          if (!member) return message.reply("❌ Please mention a user.");
          if (!role) return message.reply("❌ Please mention a role.");
          if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply("❌ I need the **Manage Roles** permission.");
          }
          if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply("❌ I cannot assign a role higher than or equal to my highest role.");
          }
          if (role.position >= message.member.roles.highest.position) {
            return message.reply("❌ You cannot assign a role higher than or equal to your highest role.");
          }
          if (member.roles.highest.position >= message.member.roles.highest.position && member.id !== message.author.id) {
            return message.reply("❌ You cannot manage roles for someone with an equal or higher role than you.");
          }
          if (member.roles.cache.has(role.id)) {
            return message.reply(`❌ ${member.user.tag} already has the ${role.name} role.`);
          }
          await member.roles.add(role);
          await message.reply(`✅ Added **${role.name}** role to ${member.user.tag}`);
          break;
        }

        case "removerole": {
          const member = message.mentions.members.first();
          const role = message.mentions.roles.first();
          if (!member) return message.reply("❌ Please mention a user.");
          if (!role) return message.reply("❌ Please mention a role.");
          if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply("❌ I need the **Manage Roles** permission.");
          }
          if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply("❌ I cannot remove a role higher than or equal to my highest role.");
          }
          if (role.position >= message.member.roles.highest.position) {
            return message.reply("❌ You cannot remove a role higher than or equal to your highest role.");
          }
          if (member.roles.highest.position >= message.member.roles.highest.position && member.id !== message.author.id) {
            return message.reply("❌ You cannot manage roles for someone with an equal or higher role than you.");
          }
          if (!member.roles.cache.has(role.id)) {
            return message.reply(`❌ ${member.user.tag} doesn't have the ${role.name} role.`);
          }
          await member.roles.remove(role);
          await message.reply(`✅ Removed **${role.name}** role from ${member.user.tag}`);
          break;
        }

        case "prefix": {
          if (args.length === 0) return message.reply(`Current prefix is \`${prefix}\``);
          const newPrefix = args[0];
          if (newPrefix.length > 5) return message.reply("❌ Prefix must be 5 characters or less.");
          if (setPrefix(newPrefix)) {
            await message.reply(`✅ Prefix changed to \`${newPrefix}\``);
          } else {
            await message.reply("❌ Failed to change prefix.");
          }
          break;
        }

        default:
          break;
      }
    } catch (error) {
      console.error("Prefix command error:", error);
      await message.reply("❌ An error occurred while executing the command.").catch(() => {});
    }
  },
};
