const Discord = require('discord.js');

class ReputationCommand
{
	constructor(client, config, database)
	{
		this.client = client;
		this.config = config;
		this.database = database;
		this.name = 'reputation';
		this.description = 'View the reputation of a user';
	}

	async setup()
	{
		return {
			name: this.name,
			description: this.description,
			options: [
				{
					name: 'user',
					description: 'User to view reputation of',
					required: true,
					type: Discord.ApplicationCommandOptionType.User
				}
			]
		};
	}

	async hslToRGB(h, s, l)
	{
		let a = s * Math.min(l, 1 - l);
		let f = (n, k = (n + h / 30) % 12) => (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)) * 255;

		return [f(0), f(8), f(4)];
	}

	async execute(interaction, options)
	{
		let user = options.getUser('user');

		await this.database.runQuery('count_reviews.sql', { user: `'${user.id}'` }, async (err, res) =>
		{
			if (err)
			{
				await interaction.reply({
					content: ':x: Error fetching content from database!',
					ephemeral: true
				});

				return;
			}

			let pos = res[0].pos || 0;
			let neg = res[0].neg || 0;

			if (pos == 0 && neg == 0)
			{
				await interaction.reply({
					content: ':information_source: No reviews recorded for this user',
					ephemeral: true
				});

				return;
			}

			let percent = pos / (pos + neg);
			let rgb = await this.hslToRGB(percent * 120, 1, 0.5);
			let hex = '#' + (1 << 24 | rgb[0] << 16 | rgb[1] << 8 | rgb[2]).toString(16).slice(1);
			let port = this.config.http.port !== 80 ? `:${this.config.http.port}` : '';
			let embed = new Discord.EmbedBuilder();

			embed.setColor(hex);
			embed.setTitle(`Reviews for ${user.username}#${user.discriminator}`);
			embed.setURL(`http://${this.config.http.host}${port}/reviews/${user.id}`);
			embed.addFields({ name: 'Positive', inline: true, value: pos.toString() });
			embed.addFields({ name: 'Negative', inline: true, value: neg.toString() });
			embed.setThumbnail(user.displayAvatarURL());

			await interaction.reply({
				embeds: [embed],
				ephemeral: true
			});
		});
	}
}

module.exports = ReputationCommand;
