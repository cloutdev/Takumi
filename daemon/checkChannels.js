const db = require("../tools/database");
const {QueryTypes} = require('sequelize');
const toolkit = require("../tools/toolkit");

async function periodicCheckForChannels(client, guildSettings){

	const generalChannel = client.channels.cache.find(channel => channel.id === guildSettings.privateBotChannel);

	const expiredChannels = await db.query("SELECT * from channels where expiresOn < now() AND isClosed = 0 AND guildID = ?",{
		replacements: [guildSettings.guildID],
		type: QueryTypes.SELECT,
		logging: false,
	});

	expiredChannels.forEach((databaseChannel) => {
		client.channels.fetch(databaseChannel.channelID).then((channel)=>{
			generalChannel.send(`Channel with name ${channel.name} is ${channel.deletable ? "" : "not"}deletable. if it is, it'll be deleted ASAP.`);
			if(channel.deletable){
				toolkit.closeChannel(channel, client);
			}
		}).catch(()=>{generalChannel.send(`Couldn't locate channel with ID ${databaseChannel.channelID}`)});
	});
}


module.exports.periodicCheckForChannels = periodicCheckForChannels;