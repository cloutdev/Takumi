const db = require("../../tools/database.js");
const {QueryTypes} = require('sequelize');
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

		const nonExpiredChannels = await db.query("SELECT * from channels where expiresOn > now() AND isClosed = 0",{
			type: QueryTypes.SELECT,
			logging: console.log,
		});

		console.log("Channels that DONT need to be closed:");
		console.log(nonExpiredChannels);
		
		const expiredChannels = await db.query("SELECT * from channels where expiresOn <= now() and isClosed  = 0",{
			type: QueryTypes.SELECT,
			logging: console.log,
		});

		console.log("Channels that need to be closed:");
		console.log(expiredChannels);

/*
		console.log(expiredChannels);
		expiredChannels.forEach((databaseChannel) => {
			client.channels.fetch(databaseChannel.channelID).then((channel)=>{
				console.log(channel);
				channel.send(`Channel with name ${channel.name} is ${channel.deletable ? "" : "not"}deletable. if it is, it'll be deleted ASAP.`);
			}).catch(()=>{message.channel.send(`Couldn't locate channel with ID ${databaseChannel.channelID}`)});
		});

		*/
    }
}