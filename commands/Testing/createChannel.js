const db = require("../../tools/database.js");
const {QueryTypes} = require('sequelize');
const moment = require('moment');
//Here the command starts
module.exports = {
    //definition
    name: "test", //the name of the command 
    category: "fun", //the category this will be listed at, for the help cmd
    aliases: ["t"], //every parameter can be an alias
    cooldown: 2, //this will set it to a 2 second cooldown
    usage: "say <Text>", //this is for the help command for EACH cmd
    description: "Resends the message", //the description of the command

    //running the command with the parameters: client, message, args, user, text, prefix
    // eslint-disable-next-line no-unused-vars
    run: async (client, message, args, user, text, prefix) => {

		moment.defaultFormat = "YYYY-MM-DD HH:mm:ss"
		const channelName = "Test1🧡";
		const channelDesc = "Tesesttttastt 🧡💟💟☮🕳🧡❤";

		const createdChannelID = (await message.guild.channels.create(channelName,{
			topic : channelDesc
		})).id;

		console.log(
			await db.query('INSERT INTO channels (channelName, description, guildID, channelID, createdBy, masterUser, startsOn, expiresOn) values (?, ?, ?, ?, ?, ?, ?, ?)',{
				replacements: [channelName, channelDesc, message.guild.id, createdChannelID, user.id, user.id, moment().format(), moment().add(1, "minutes").format()],
				type: QueryTypes.INSERT,
				logging: console.log,
			})
		);

		console.log(
			await db.query("SELECT * from channels where expiresOn >= now()")
		);


    }
}