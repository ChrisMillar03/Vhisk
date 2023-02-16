const Discord = require('discord.js');
const sqlstring = require('sqlstring');

class ReviewCommand
{
	constructor(client, config, database)
	{
		this.client = client;
		this.config = config;
		this.database = database;
		this.name = 'review';
		this.description = 'Post a review of a user';
	}

	async setup()
	{
		return {
			name: this.name,
			description: this.description,
			options: [
				{
					name: 'user',
					description: 'User to review',
					required: true,
					type: Discord.ApplicationCommandOptionType.User
				},
				{
					name: 'positive',
					description: 'Is the review positive?',
					required: true,
					type: Discord.ApplicationCommandOptionType.Boolean
				},
				{
					name: 'review',
					description: 'Content of review',
					required: true,
					type: Discord.ApplicationCommandOptionType.String
				}
			]
		};
	}

	async execute(interaction, options)
	{
		let user = await options.getUser('user');
		let positive = await options.getBoolean('positive');
		let review = await options.getString('review');

		if (review.length > 255)
		{
			await interaction.reply({
				embeds: [new Discord.EmbedBuilder().setColor('#ff0000').setTitle(':x: Review too large to be held in database!')],
				ephemeral: true
			});

			return;
		}

		if (user.id === interaction.user.id)
		{
			await interaction.reply({
				embeds: [new Discord.EmbedBuilder().setColor('#ff0000').setTitle(':x: You cannot review yourself!')],
				ephemeral: true
			});

			return;
		}

		let reviewer = sqlstring.escape(interaction.user.id);
		let alias = sqlstring.escape(`${interaction.user.username}#${interaction.user.discriminator}`);

		await this.database.runQuery('set_review.sql', {
			user: sqlstring.escape(user.id),
			reviewer: reviewer,
			alias: alias,
			content: sqlstring.escape(review),
			positive: Number(positive)
		}, async (err, res) =>
		{
			if (err)
			{
				await interaction.reply({
					embeds: [new Discord.EmbedBuilder().setColor('#ff0000').setTitle(':x: Error inserting review into database!')],
					ephemeral: true
				});
			}
			else
			{
				await interaction.reply({
					embeds: [new Discord.EmbedBuilder().setColor('#00ff00').setTitle(':white_check_mark: Player review updated')],
					ephemeral: true
				});
			}
		});

		await this.database.runQuery('update_aliases.sql', { user: reviewer, alias: alias }, (err, res) =>
		{
			if (err && err.code !== 'ECONNREFUSED') throw err;
		});
	}
}

module.exports = ReviewCommand;
