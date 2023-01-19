const sqlstring = require('sqlstring');
const express = require('express');
const path = require('path');
const fs = require('fs');

class HTTPServer
{
	constructor(client, config, database)
	{
		this.client = client;
		this.config = config;
		this.database = database;
		this.app = express();
	}

	async routeIndex(req, res)
	{
		res.redirect(this.config.invite);
	}

	async routeReviews(req, res)
	{
		try
		{
			let user = await this.client.users.fetch(req.params.user);

			await this.database.runQuery('get_reviews.sql', { 'user': `'${user.id}'` }, async (err, resDB) =>
			{
				if (err)
				{
					await res.render('reviews', { user: user, reviews: [{ alias: 'Error fetching content from database!', positive: false }] });
				}
				else
				{
					await res.render('reviews', { user: user, reviews: resDB });
				}
			});
		}
		catch (err)
		{
			await res.json({ message: 'User does not exist!' });
		}
	}

	async setup()
	{
		this.app.set('view engine', 'ejs');
		this.app.use(express.static(path.join(__dirname, 'www')));
		this.app.get('/', this.routeIndex.bind(this));
		this.app.get('/reviews/:user', this.routeReviews.bind(this));
		this.app.listen(this.config.http.port);

		console.log('HTTPServer setup');
	}
}

module.exports = HTTPServer;
