const toolkit = require("../tools/toolkit");
const prisma = require("../tools/prisma");

async function periodicCheckForChannels(client, guildSettings){

	const generalChannel = client.channels.cache.find(channel => channel.id === guildSettings.privateBotChannel);

	const expiredChannels = await prisma.channels.findMany({
		where: {
			expiresOn:{
				lte: new Date()
			},
			isClosed: false,
			guildID: guildSettings.guildID
		}
	});
	console.log(expiredChannels)

	expiredChannels.forEach((databaseChannel) => {
		client.channels.fetch(databaseChannel.channelID).then((channel)=>{
			generalChannel.send(`Channel with name ${channel.name} is ${channel.deletable ? "" : "not"}deletable. if it is, it'll be deleted ASAP.`);
			if(channel.deletable){
				toolkit.closeChannel(channel, "The channel time expired. If you want to renew the channel, please contact the server moderation team.", client);
			}
		}).catch(()=>{generalChannel.send(`Couldn't locate channel with ID ${databaseChannel.channelID}`)});
	});
}


module.exports.periodicCheckForChannels = periodicCheckForChannels;