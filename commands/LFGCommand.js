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
		this.cooldown = new Map();
	}

	async setup()
	{
		return {
			name: this.name,
			description: this.description,
			options: [
				{
					name: 'game',
					description: 'Game you are playing',
					required: true,
					type: Discord.ApplicationCommandOptionType.String,
					choices: this.config.games
				},
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
				embeds: [new Discord.EmbedBuilder().setColor('#ff0000').setTitle(':x: You must be in a voice channel to use this command!')],
				ephemeral: true
			});

			return;
		}

		if (Date.now() < this.cooldown.get(interaction.user.id) ?? 0)
		{
			let time = Math.ceil((this.cooldown.get(interaction.user.id) - Date.now()) / 1000);
			let timeString = time > 60 ? `${Math.floor(time / 60)}m ${time % 60}s` : `${time}s`;

			await interaction.reply({
				embeds: [new Discord.EmbedBuilder().setColor('#ff0000').setTitle(`:x: You can use this command again in ${timeString}!`)],
				ephemeral: true
			});

			return;
		}

		this.cooldown.set(interaction.user.id, Date.now() + this.config.lfg_cooldown * 1000);

		this.cooldown = new Map([...this.cooldown].filter(([k, v]) => v > Date.now()));

		let channel = await interaction.guild.channels.cache.find(channel => channel.id === interaction.member.voice.channelId);
		let game = await options.getString('game');
		let message = await options.getString('message');
		let invite = await channel.createInvite({
			maxAge: 60 * 30,
			maxUses: 4
		});

		await interaction.deferReply();
		await interaction.deleteReply();

		await this.database.runQuery('get_role.sql', { guild: `'${interaction.guild.id}'`, role_k: `'${game}'` }, async (err, res) =>
		{
			if (err && err.code !== 'ECONNREFUSED') throw err;

			if (res.length > 0)
			{
				let role = res[0].role_v === interaction.guild.id ? `@everyone` : `<@&${res[0].role_v}>`;

				await interaction.channel.send({ content: `${role} | ${channel.name} are looking for players | ${invite}\n\`\`\`${message}\`\`\`` });
			}
			else
			{
				await interaction.channel.send({ embeds: [new Discord.EmbedBuilder().setColor('#ff0000').setTitle(`:x: Game ${game} has no connected role!`)] });
			}
		});
	}
}

module.exports = LFGCommand;
