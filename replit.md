# replit.md

## Overview

This is a Discord bot built with discord.js v14. It provides server moderation and utility features including role management, voice channel control, message management, sticky messages, and DM handling. The bot supports both slash commands and prefix-based text commands with a configurable prefix.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Bot Framework
- **Framework**: discord.js v14
- **Runtime**: Node.js
- **Entry Point**: `index.js` initializes the Discord client with required intents and loads commands/events dynamically

### Command System
- **Slash Commands**: Located in `/commands` directory, each file exports a command with `data` (SlashCommandBuilder) and `execute` function
- **Command Registration**: `registerCommands.js` registers slash commands with Discord's API using guild-specific deployment
- **Prefix Commands**: Handled in the messageCreate event, prefix stored in config.json and changeable at runtime

### Event System
- **Event Handlers**: Located in `/events` directory, each file exports `name`, optional `once` flag, and `execute` function
- **Key Events**:
  - `ready.js`: Bot startup, sets activity status
  - `interactionCreate.js`: Handles slash commands, buttons, and modals
  - `messageCreate.js`: Handles prefix commands and DM forwarding
  - `guildMemberAdd.js`: Welcome messages for new members

### Permission System
- **Role-Based Access**: Commands require specific roles defined in `config.requiredRoleIds` or Administrator permission
- **Hierarchy Checks**: Role management commands validate:
  - Bot's role must be higher than target role
  - Invoking user's role must be higher than target role
  - Invoking user's role must be higher than target member's highest role
- **Utility Module**: `/utils/permissions.js` provides `hasRequiredRole()` and `hasAdminPermission()` helpers

### Configuration Management
- **Config File**: `config.json` stores runtime configuration (prefix, required role IDs)
- **Config Manager**: `/utils/configManager.js` provides read/write access with error handling
- **Environment Variables**: Sensitive data (TOKEN, CLIENT_ID, GUILD_ID, MOD_CHANNEL_ID, WELCOME_CHANNEL_ID) stored in `.env`

### Keep-Alive System
- **Express Server**: `keepalive.js` runs a minimal HTTP server on port 3000
- **Purpose**: Prevents the bot from sleeping on hosting platforms that ping HTTP endpoints

## External Dependencies

### Core Dependencies
- **discord.js v14**: Discord API wrapper for bot functionality
- **dotenv**: Environment variable management for sensitive configuration
- **express v5**: HTTP server for keep-alive endpoint

### Discord API Configuration
- **Required Environment Variables**:
  - `TOKEN`: Discord bot token
  - `CLIENT_ID`: Discord application client ID
  - `GUILD_ID`: Target Discord server ID for command registration
  - `MOD_CHANNEL_ID`: Channel for forwarded DM messages
  - `WELCOME_CHANNEL_ID`: Channel for welcome messages

### Discord Intents Required
- Guilds, GuildMessages, GuildMembers, GuildVoiceStates, MessageContent, DirectMessages
- Partials: Channel, Message, User, GuildMember (for DM handling)