const Discord = require('discord.js');
const Database = require('./Database.js');
const HTTPServer = require('./HTTPServer.js');
const config = require('./config.json');
const path = require('path');
const fs = require('fs');

const commandsFolder = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsFolder)) fs.mkdirSync(commandsFolder);

const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.GuildVoiceStates
	]
});

let database = new Database(client, config);
let httpServer = new HTTPServer(client, config, database);
let commands = new Map();

fs.readdirSync(commandsFolder).forEach(async file =>
{
	if (!fs.lstatSync(path.join(commandsFolder, file)).isDirectory())
	{
		let CommandClass = require(path.join(commandsFolder, file));
		let command = new CommandClass(client, config, database);

		commands.set(command.name, command);
	}
});

async function registerCommands(guild)
{
	if (guild.commands)
	{
		commands.forEach(async cmd =>
		{
			guild.commands.create(await cmd.setup());
		});
	}
}

client.on('guildCreate', async guild =>
{
	await registerCommands(guild);
});

client.on('interactionCreate', async interaction =>
{
	if (!interaction.isCommand()) return;

	const { commandName, options } = interaction;

	if (commands.has(commandName))
	{
		await commands.get(commandName).execute(interaction, options);
	}
});

client.on('ready', async _ =>
{
	client.guilds.cache.forEach(async guild =>
	{
		await registerCommands(guild);
	});

	await database.setup();
	await httpServer.setup();

	console.log('Bot started');
});

client.login(config.token);
