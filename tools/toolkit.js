const db = require("../tools/database");
const {QueryTypes} = require('sequelize');

async function closeChannel(channelToBeClosed, discordClient){

	const modArray = (await db.query("SELECT * from mods WHERE channelID = ?",{
		replacements: [channelToBeClosed.id],
		type: QueryTypes.SELECT,
		logging: false,
	}));

	const guild = (await db.query("SELECT * from settings WHERE guildID = ?",{
		replacements: [channelToBeClosed.guild.id],
		type: QueryTypes.SELECT,
		logging: false,
	}))[0];

	const dbChannel = (await db.query("SELECT * from channels WHERE channelID = ?",{
		replacements: [channelToBeClosed.id],
		type: QueryTypes.SELECT,
		logging: false,
	}))[0];

	db.query('UPDATE channels SET isClosed = 1 WHERE channelID = ?',{
		replacements: [channelToBeClosed.id],
		type: QueryTypes.UPDATE,
		logging: false,
	}).then(()=>{
		channelToBeClosed.setParent(guild.closedCategoryID).then((channelToBeClosed)=>{
			channelToBeClosed.updateOverwrite(dbChannel.masterUser, 
				{
					"VIEW_CHANNEL": true
				}
			);
			modArray.forEach((modID) => {
				channelToBeClosed.updateOverwrite(modID.modID, {
					"VIEW_CHANNEL": true
				})
			});
		});

		discordClient.channels.fetch(guild.privateBotChannel).then((channel)=>{
			channel.send(channelToBeClosed.name+" Moved to Closed Channels!");
		});
		discordClient.users.fetch(dbChannel.masterUser).then((user)=>{
			user.send(`Hello! You had purchased a channel at the server \`${channelToBeClosed.guild.name}\`, but since you did not renew your subscription for that channel, we are afraid that the channel with name \`${channelToBeClosed.name}\` was closed. You can reopen the channel, as we did not delete it.`);
		});
	});
}

module.exports.closeChannel = closeChannel;