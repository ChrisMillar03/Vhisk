const Discord = require('discord.js');

class LFGCommand
{
	constructor(client, config, database)
	{
		this.client = client;
		this.config = config;
		this.database = database;
		this.name = 'lfg';
		this.description = 'Create an LFG post to find players';
	}

	async setup()
	{
		return {
			name: this.name,
			description: this.description,
			options: [
				{
					name: 'message',
					description: 'Message to display in post',
					required: true,
					type: Discord.ApplicationCommandOptionType.String
				}
			]
		};
	}

	async execute(interaction, options)
	{
		if (!interaction.member.voice.channelId)
		{
			await interaction.reply({
				content: ':x: You must be in a voice channel to use this command!',
				ephemeral: true
			});

			return;
		}

		let channel = await interaction.guild.channels.cache.find(channel => channel.id === interaction.member.voice.channelId);
		let message = await options.getString('message');
		let invite = await channel.createInvite({
			maxAge: 60 * 30,
			maxUses: 4
		});

		await interaction.deferReply();
		await interaction.deleteReply();

		await this.database.runQuery('get_role.sql', { guild: `'${interaction.guild.id}'`, role_k: `'lfg'` }, async (err, res) =>
		{
			if (err && err.code !== 'ECONNREFUSED') throw err;

			if (res.length > 0)
			{
				let role = res[0].role_v === interaction.guild.id ? `@everyone` : `<@&${res[0].role_v}>`;

				await interaction.channel.send({ content: `${role} | ${channel.name} are looking for players | ${invite}\n\`\`\`${message}\`\`\`` });
			}
			else
			{
				await interaction.channel.send({ content: ':x: LFG command is configured incorrectly, please contact an admin!' });
			}
		});
	}
}

module.exports = LFGCommand;
