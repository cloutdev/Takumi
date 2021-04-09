const db = require("../../tools/database");
const {QueryTypes} = require('sequelize');

//Here the command starts
module.exports = {
    //definition
    name: "tagEveryone", //the name of the command 
    category: "info", //the category this will be listed at, for the help cmd
    aliases: ["tag"], //every parameter can be an alias
    cooldown: 2, //this will set it to a 2 second cooldown
    usage: "ping", //this is for the help command for EACH cmd
    description: "Gives you information on how fast the Bot can respond to you", //the description of the command

    //running the command with the parameters: client, message, args, user, text, prefix
    run: async (client, message, args, user, text, prefix) => {

		const dbChannel = (await db.query("SELECT * from channels WHERE channelID = ?",{
			replacements: [message.channel.id],
			type: QueryTypes.SELECT,
			logging: false,
		}))[0];

		if(user.id != dbChannel.masterUser){
			message.reply("You must be a master user to do that!");
			return;
		}

		if(dbChannel.isClosed === 1){
			message.reply("This is supposed to be a closed channel");
			return; 
		}

		const tagCount = (await db.query("SELECT count(*) as count from sentpings WHERE channelID = ? AND sentOn > DATE_SUB(now(), INTERVAL 1 DAY)",{
			replacements: [message.channel.id],
			type: QueryTypes.SELECT,
			logging: false,
		}))[0].count;

		if(dbChannel.tagsPerDay === tagCount){
			message.reply("You have reached the max tag amount for today. Please wait until tagging everyone again.");
			return;
		}

		message.channel.send("@everyone bump!");

		await db.query('INSERT INTO sentPings (channelID, sentBy) values (?, ?)',{
			replacements: [message.channel.id, user.id],
			type: QueryTypes.INSERT,
			logging: console.log,
		})
    }
}
