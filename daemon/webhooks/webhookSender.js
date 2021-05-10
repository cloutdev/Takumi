const axios = require("axios").default;
const db = require("../../tools/database");
const {QueryTypes} = require('sequelize');
const prisma = require('../../tools/prisma')

const webhookURL =  "https://b6b923419856.ngrok.io";

async function createExtensionProductID(channelID, email, discordGuild, days){
	console.log("here");
	console.log(channelID);
	const guildID = (await db.query("SELECT guildID from channels WHERE channelID = ?",{
		replacements: [channelID],
		type: QueryTypes.SELECT,
		logging: console.log,
	}))[0].guildID; 

	const guild = (await db.query("SELECT * from settings WHERE guildID = ?",{
		replacements: [guildID],
		type: QueryTypes.SELECT,
		logging: false,
	}))[0]; 



	const payload = {
		"title": `${days}-day shop subscription in ${discordGuild.name}`,
		"gateway": "bitcoin",
		"value": guild.pricePerDay,
		"currency": "USD",
		"quantity": days,
		"confirmations": 1,
		"email": email,
		"custom_fields":  {
			"action": "update",
			"ChannelID": "C"+channelID.toString()
		},
		"webhook": webhookURL,
		"white_label": false,
		"return_url": webhookURL
	}

	console.log(payload);

	const sellixRequest = await axios({
			method: "POST",
			url: "https://dev.sellix.io/v1/payments",
			data:payload,
			headers: {
				"User-Agent": "MarketplaceBotWebhooks",
				"Authorization" : `Bearer ${guild.sellixAPIKey}`,
			}
	})
		.then((res)=>{
			if(res.data.status != 200){
				console.log(res);
				throw `APIError ${res.data.status}`;	
			}
			console.log("success!");
			console.log(res.data.data.url);
			return res.data;
		})
		.catch((obj)=>{
			console.log("error");
			console.log(obj)
		});

	return await sellixRequest;
}

async function createCreationProductID(email, discordGuild, masterUser, days, discordCategory){

	const guild = await prisma.settings.findUnique({
		where: {
			guildID: discordGuild.id
		}
	})

	const category = await prisma.categories.findFirst({
		where: {
			CategoryID: discordCategory.id
		}
	})


	const payload = {
		"title": `Shop creation in the ${discordCategory.name} category of ${discordGuild.name}`,
		"gateway": "bitcoin",
		"value": category.pricePerDay,
		"currency": "USD",
		"quantity": days,
		"confirmations": 1,
		"email": email,
		"custom_fields":  {
			"action": "create",
			"guildID": "G"+(discordGuild.id).toString(),
			"masterUser" : "U"+(masterUser.id).toString(),
			"categoryID": "C"+discordCategory.id
		},
		"webhook": webhookURL,
		"white_label": false,
		"return_url": webhookURL
	}

	console.log(payload)

	const sellixRequest = await axios({
		method: "POST",
		url: "https://dev.sellix.io/v1/payments",
		data:payload,
		headers: {
			"User-Agent": "MarketplaceBotWebhooks",
			"Authorization" : `Bearer ${guild.sellixAPIKey}`,
		}
	})
	.then((res)=>{
		if(res.data.status != 200){
			console.log(res);
			throw `APIError ${res.data.status}`;	
		}
		console.log("success!");
		console.log(res.data.data.url);
		return res.data;
	})
	.catch((obj)=>{
		console.log("error");
		console.log(obj)
	});

return await sellixRequest;
}

module.exports.createExtensionProductID = createExtensionProductID;
module.exports.createCreationProductID = createCreationProductID;