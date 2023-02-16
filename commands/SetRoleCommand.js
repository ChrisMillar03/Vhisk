const Discord = require('discord.js');
const sqlstring = require('sqlstring');

class SetRoleCommand
{
	constructor(client, config, database)
	{
		this.client = client;
		this.config = config;
		this.database = database;
		this.name = 'setrole';
		this.description = 'Set roles to be used by the bot';
	}

	async setup()
	{
		return {
			name: this.name,
			description: this.description,
			options: [
				{
					name: 'id',
					description: 'ID',
					required: true,
					type: Discord.ApplicationCommandOptionType.String,
					choices: this.config.games
				},
				{
					name: 'role',
					description: 'Role',
					required: true,
					type: Discord.ApplicationCommandOptionType.Role
				}
			]
		};
	}

	async execute(interaction, options)
	{
		if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageRoles))
		{
			await interaction.reply({
				embeds: [new Discord.EmbedBuilder().setColor('#ff0000').setTitle(':x: You don\'t have permission to run this command!')],
				ephemeral: true
			});

			return;
		}

		let id = await options.getString('id');
		let role = await options.getRole('role');

		await this.database.runQuery('set_role.sql', {
			guild: sqlstring.escape(interaction.guild.id),
			role_k: sqlstring.escape(id),
			role_v: sqlstring.escape(role.id)
		}, async (err, res) =>
		{
			if (err)
			{
				await interaction.reply({
					embeds: [new Discord.EmbedBuilder().setColor('#ff0000').setTitle(`:x: Error inserting role into database! (${id})`)],
					ephemeral: true
				});
			}
			else
			{
				await interaction.reply({
					embeds: [new Discord.EmbedBuilder().setColor('#00ff00').setTitle(`:white_check_mark: Role mapping updated (${id})`)],
					ephemeral: true
				});
			}
		});
	}
}

module.exports = SetRoleCommand;
