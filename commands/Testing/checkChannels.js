const db = require("../../tools/database.js");
const {QueryTypes} = require('sequelize');
const moment = require('moment');
//Here the command starts
module.exports = {
    //definition
    name: "checkChannels", //the name of the command 
    category: "Testing", //the category this will be listed at, for the help cmd
    aliases: ["c"], //every parameter can be an alias
    cooldown: 2, //this will set it to a 2 second cooldown
    usage: "say <Text>", //this is for the help command for EACH cmd
    description: "Resends the message", //the description of the command

    //running the command with the parameters: client, message, args, user, text, prefix
    // eslint-disable-next-line no-unused-vars
    run: async (client, message, args, user, text, prefix) => {

		const channelsToClose = await db.query("SELECT * from channels where expiresOn >= now() AND isClosed = 0",{
			type: QueryTypes.SELECT,
			logging: console.log,
		});
		console.log(channelsToClose);


		channelsToClose.forEach((databaseChannel) => {
			client.channels.fetch(databaseChannel.channelID).then((channel)=>{
				console.log(channel);
				message.channel.send(`Channel with name ${channel.name} is ${channel.deletable ? "" : "not"}deletable. if it is, it will be deleted at ${moment(databaseChannel.expiresOn).format("DD.MM.YYYY HH:mm")}`);
			})
		});

/*SELECT * from channels where expiresOn <= now() AND isClosed = 0*/
		const expiredChannels = await db.query("SELECT * from channels where expiresOn <= now()",{
			type: QueryTypes.SELECT,
			logging: console.log,
		});

		console.log(expiredChannels);
		expiredChannels.forEach((databaseChannel) => {
			client.channels.fetch(databaseChannel.channelID).then((channel)=>{
				console.log(channel);
				message.channel.send(`GayChannel with name ${channel.name} is ${channel.deletable ? "" : "not"}deletable. if it is, it will be deleted at ${moment(databaseChannel.expiresOn).format("DD.MM.YYYY HH:mm")}`);
			}).catch(()=>{message.channel.send(`Couldn't locate channel with ID ${databaseChannel.channelID}`)});
		});
    }
}