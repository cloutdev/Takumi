const crypto = require('crypto');
const db = require("../../tools/database");
const {QueryTypes} = require('sequelize');
const toolkit = require('../../tools/toolkit');
const prisma = require('../../tools/prisma')
const moment = require('moment')

async function processShoppyWebhook(request, headers, discordClient){
	const allGuilds = await db.query("SELECT * from settings",{
        type: QueryTypes.SELECT,
	});

	console.log(request);
	console.log(headers);

	let guild;
	let body;

	//If you do not know what Iterable.every() is, Google it
	await allGuilds.every((selectedGuild) => {
		const secret = "XdPoMfZX6YZjv6Kw";
		const received_signature = headers["x-shoppy-signature"];
		var digest = crypto
			.createHmac('sha512', secret)
			.update(request, 'utf8', 'hex')
			.digest('hex');
		
			console.log(digest)
		if(received_signature === digest) {
			guild = selectedGuild;
			body = JSON.parse(request.toString());
			console.log(body)
			return false;
		}else return true;
	});

	if(guild === undefined) {return -2} //If the every() function reaches the end of the allGuilds array and has not reached a true statement, return -1.
	//const gay = 'ChannelID: 841641687327440916 <br> Action: buyPingAddon <br><br>Testing! <br><br> XDDDDDDDD'
	const action = getStringBetween(body.data.product.description, "Action: ", " ") 

	console.log(action);

	//If the program has reached this point, you can be sure that the signatures are equal.
	switch(action){
		case "update":
			{
				const receivedChannelID = getStringBetween(body.data.product.description, "ChannelID: ", " ");

				prisma.channels.updateMany({
					where:{
						channelID: receivedChannelID
					},
					data:{
						expiresOn: moment().add(1, 'days').toISOString()
					}
				}).then(()=>{
					discordClient.channels.fetch((receivedChannelID).toString()).then((channel)=>{
						channel.send(`This channel has been renewed for ${body.data.quantity} days!`)
					});
				})
				break;
			}
		case "create":
			{
				console.log("I have to create a channel!");

				const guildID = getStringBetween(body.data.product.description, "guildID: ", " ");

				const masterUserID = getStringBetween(body.data.product.description, "masterUserID: ", " ");

				const categoryID = getStringBetween(body.data.product.description, "categoryID: ", " ");
				
				toolkit.createChannel(discordClient, guildID, masterUserID, "Webhook", categoryID);

				break;
			}
		
		case "buyPingAddon":{

			console.log('Received order to add ping addon.')

			const channelID = getStringBetween(body.data.product.description, "ChannelID: ", " ")

			toolkit.addPingAddon(discordClient, channelID)
			break;
		}
		default: {
			console.log("yikes");
		}
	}

}

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
		
		case "buyPingAddon":{

			console.log('Received order to add ping addon.')

			

			break;
		}
		default: {
			console.log("yikes");
		}
	}

}

function getStringBetween(string, prefix, suffix) {
	let s = string;
	var i = s.indexOf(prefix);
	if (i >= 0) {
		s = s.substring(i + prefix.length);
	}
	else {
		return '';
	}
	if (suffix) {
		i = s.indexOf(suffix);
		if (i >= 0) {
			s = s.substring(0, i);
		}
		else {
		return '';
		}
	}
	return s;
}

module.exports.processSellixWebhook = processSellixWebhook;
module.exports.processShoppyWebhook = processShoppyWebhook;