const db = require("../tools/database");
const {QueryTypes} = require('sequelize');
const moment = require('moment');
async function closeChannel(channelToBeClosed, reason, discordClient){

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
			user.send(`Hello! We had to close the channel you had purchased at the server \`${channelToBeClosed.guild.name}\` for the following reason: \nReason: \`${reason}\``);
		});
	});
}

async function createChannel(discordClient, guildID, masterUserID, createdBy){

	const discordGuild = await discordClient.guilds.fetch(guildID);

	const masterUser = await discordClient.users.fetch(masterUserID);

	const guild = (await db.query("SELECT * from settings WHERE guildID = ?",{
		replacements: [guildID],
		type: QueryTypes.SELECT,
	}))[0];

	const channelName = `${masterUser.username}'s Store`;
	const channelDesc = `This shop was opened on ${moment()}`;
	
	const createdChannelID = await discordGuild.channels.create(channelName,{
		topic : channelDesc,
		parent: guild.openCategoryID,
	}).then((channel)=>{
		channel.updateOverwrite(masterUserID, 
			{
				'MANAGE_CHANNELS': true,
				'SEND_MESSAGES': true,
				'MANAGE_MESSAGES': true,
				'EMBED_LINKS': true,
				'ATTACH_FILES': true,
			}
		);

		return channel.id;
	}).catch(()=>{
		masterUser.send("Something went wrong with your channel creation request. Please try again later or contact the server moderation team.");
		return;
	});


	await db.query('INSERT INTO channels (guildID, channelID, createdBy, masterUser, startsOn, expiresOn) values (?, ?, ?, ?, now(), DATE_ADD(now(), INTERVAL ? MINUTE))',{
		replacements: [guildID, createdChannelID, createdBy, masterUserID, 1],
		type: QueryTypes.INSERT,
		logging: console.log,
	}).then(()=>{
		masterUser.send("Hello! Your channel has been successfully created!");
	})
	
}

module.exports.closeChannel = closeChannel;
module.exports.createChannel = createChannel;