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
		this.description = 'Set roles to be used by bot';
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
					choices: [
						{
							name: 'LFG',
							value: 'lfg'
						}
					]
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
				content: ':x: You don\'t have permission to run this command!',
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
					content: ':x: Error inserting setting role in database!',
					ephemeral: true
				});
			}
			else
			{
				await interaction.reply({
					content: ':white_check_mark: Role mapping updated',
					ephemeral: true
				});
			}
		});
	}
}

module.exports = SetRoleCommand;