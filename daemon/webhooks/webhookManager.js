const crypto = require('crypto');
const db = require("../../tools/database");
const {QueryTypes} = require('sequelize');
const toolkit = require('../../tools/toolkit');

async function processSellixWebhook(request, headers, discordClient){

	const allGuilds = await db.query("SELECT * from settings",{
        type: QueryTypes.SELECT,
	});

	let guild;
	let body;
	//If you do not know what Iterable.every() is, Google it
	await allGuilds.every((selectedGuild) => {
		const secret = selectedGuild.sellixSecret;
		const received_signature = headers["x-sellix-signature"];
		var digest = crypto
			.createHmac('sha512', secret)
			.update(request, 'utf8', 'hex')
			.digest('hex');
		
		if(received_signature === digest) {
			guild = selectedGuild;
			body = JSON.parse(request.toString());
			return false;
		}else return true;
	});

	if(guild === undefined) {return -2} //If the every() function reaches the end of the allGuilds array and has not reached a true statement, return -1.

	//If the program has reached this point, you can be sure that the signatures are equal.
	switch(body.data.custom_fields.action){
		case "update":
			{
				const channelID = (body.data.custom_fields.ChannelID).substring(1);
				db.query('UPDATE channels SET expiresOn = DATE_ADD(expiresOn, INTERVAL ? DAY) WHERE channelID = ?',{
					replacements: [body.data.quantity, (channelID)],
					type: QueryTypes.UPDATE,
					logging: console.log,
				}).then(()=>{
					discordClient.channels.fetch((channelID).toString()).then((channel)=>{
						channel.send(`This channel has been renewed for ${body.data.quantity} days!`)
					});
				}
				)
				break;
			}
		case "create":
			{
				console.log("I have to create a channel!");

				const guildID = (body.data.custom_fields.guildID).substring(1);

				const masterUserID = (body.data.custom_fields.masterUser).substring(1);

				const categoryID = (body.data.custom_fields.categoryID).substring(1);
				
				toolkit.createChannel(discordClient, guildID, masterUserID, "Webhook", categoryID);

				break;
			}
		
		default: {
			console.log("yikes");
		}
	}

}

module.exports.processSellixWebhook = processSellixWebhook;