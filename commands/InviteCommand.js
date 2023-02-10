const Discord = require('discord.js');

class InviteCommand
{
	constructor(client, config, database)
	{
		this.client = client;
		this.config = config;
		this.database = database;
		this.name = 'invite';
		this.description = 'Get the invite link for the server';
	}

	async setup()
	{
		return {
			name: this.name,
			description: this.description
		};
	}

	async execute(interaction, options)
	{
		await interaction.reply({
			content: this.config.invite,
			ephemeral: true
		});
	}
}

module.exports = InviteCommand;
