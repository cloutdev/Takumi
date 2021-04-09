const db = require("../../tools/database");
const {QueryTypes} = require('sequelize');

//Here the command starts
module.exports = {
    //definition
    name: "addMod", //the name of the command 
    category: "fun", //the category this will be listed at, for the help cmd
    aliases: ["add"], //every parameter can be an alias
    cooldown: 2, //this will set it to a 2 second cooldown
    usage: "say <Text>", //this is for the help command for EACH cmd
    description: "Resends the message", //the description of the command

    //running the command with the parameters: client, message, args, user, text, prefix
    // eslint-disable-next-line no-unused-vars
    run: async (client, message, args, user, text, prefix) => {
		const dbChannel = (await db.query("SELECT * from channels WHERE channelID = ?",{
			replacements: [message.channel.id],
			type: QueryTypes.SELECT,
			logging: false,
		}))[0];

		if(dbChannel === undefined){
			message.reply("you are not in a valid channel!");
			return;
		}

		if(args.length == 0){
			message.reply("you did not provide any users to add as a moderator.");
			return;
		}
		
		args.forEach((mention) => {
			const mod = getUserFromMention(mention);

			message.channel.updateOverwrite(mod.id, 
				{
					'MANAGE_MESSAGES': true,
					'SEND_MESSAGES': true,
					'EMBED_LINKS' : true,
				}
			);

			db.query('INSERT INTO mods (channelID, modID, addedBy) values (?, ?, ?)',{
				replacements: [message.channel.id, mod.id, user.id],
				type: QueryTypes.INSERT,
				logging: console.log,
			})
		});

		function getUserFromMention(mention) {
			if (!mention) return;
		
			if (mention.startsWith('<@') && mention.endsWith('>')) {
				mention = mention.slice(2, -1);
		
				if (mention.startsWith('!')) {
					mention = mention.slice(1);
				}
		
				return client.users.cache.get(mention);
			}
		}
    }
}