const mysql = require('mysql');
const path = require('path');
const fs = require('fs');

class Database
{
	constructor(client, config)
	{
		this.client = client;
		this.config = config;

		this.db = mysql.createPool({
			host: this.config.db.host,
			user: this.config.db.user,
			password: this.config.db.password,
			database: this.config.db.database,
			multipleStatements: true
		});

		this.folder = path.join(__dirname, 'sql');
		this.queries = new Map();
	}

	async runQuery(query, args, callback)
	{
		if (!this.queries.has(query))
		{
			callback(new Error('No such query'), []);

			return;
		}

		let sql = this.queries.get(query);

		for (let [k, v] of Object.entries(args))
		{
			sql = sql.replaceAll(`%${k}%`, v);
		}

		await this.db.query(sql, callback);
	}

	async setup()
	{
		if (!fs.existsSync(this.folder)) fs.mkdirSync(this.folder);

		fs.readdirSync(this.folder).forEach(async file =>
		{
			if (!fs.lstatSync(path.join(this.folder, file)).isDirectory())
			{
				let sql = fs.readFileSync(path.join(this.folder, file), { 'encoding': 'utf8', 'flag': 'r' }).toString();

				this.queries.set(file, sql);
			}
		});

		await this.runQuery('init.sql', { database: this.config.db.database }, async (err, res) =>
		{
			if (err) throw err;
		});

		console.log('Database setup');
	}
}

module.exports = Database;
