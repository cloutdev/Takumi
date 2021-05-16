const axios = require("axios").default;
const prisma = require('../../tools/prisma')

const webhookURL =  "http://172.104.157.28:3000";

async function createExtensionProductID(submittedChannelID, discordGuild){
	console.log("here");
	console.log(submittedChannelID);

	const guildData = await prisma.settings.findFirst({
		where:{	
			guildID: discordGuild.id
		}
	})

console.log(guildData);

	const channel = await prisma.channels.findFirst({
		where:{
			channelID: submittedChannelID
		}
	})

	const categoryData = await prisma.categories.findFirst({
		where: {
			CategoryID: channel.categoryID
		}
	})

	const fields = [
		["Action", "update"],
		["ChannelID", submittedChannelID]
	]

	const variables = createVariablesString(fields);

	const payload = {
		"product": {
			"title": `Shop time renewal in ${discordGuild.name}`,
			"price": categoryData.pricePerDay,
			"currency": "USD",
			"webhook_urls": [
				webhookURL
			],
			'quantity': {
				"min" : categoryData.minimumDays,
				'max': 9999
			},
			'description': "When you pay this Shoppy invoice, we will automatically extend your subscription time of this channel by the days you have specified."+variables,
			"confirmations": 1
		}
	}
	const shoppyRequest = await axios({
		method: "POST",
		url: "https://shoppy.gg/api/v1/pay",
		data:payload,
		headers: {
			"User-Agent": "MarketplaceBotWebhooks",
			"Authorization" : `${guildData.shoppyAPIKey}`,
		}
	})
	.then((res)=>{
		console.log(res)
		if(res.data.status === false){
			console.log(res);
			throw `APIError ${res.data.status}`;	
		}
		console.log("success!");
		return res.data.details.urls.payment.url;
	})
	.catch((obj)=>{
		console.log("error");
		console.log(obj)
	});

return await shoppyRequest;

}

async function createCreationProductID(discordGuild, masterUser, discordCategory){

	const category = await prisma.categories.findFirst({
		where: {
			CategoryID: discordCategory.id
		}
	})

	const guildData = await prisma.settings.findFirst({
		where:{
			guildID: discordGuild.id
		}
	})

	const fields = 
	[	
		["Action", "create"],
		["guildID", discordGuild.id],
		["masterUserID", masterUser.id],
		["categoryID", discordCategory.id]
	]

	const variables = createVariablesString(fields);

	const payload = {
		"product": {
			"title": `Shop creation in the ${discordCategory.name} category of ${discordGuild.name}`,
			"price": category.pricePerDay,
			"currency": "USD",
			"webhook_urls": [
				webhookURL
			],
			'quantity': {
				"min" : category.minimumDays,
				"max" : 9999
			},
			'description': "When you pay this Shoppy invoice, we will automatically create a new shop channel for you to use."+variables,
			"confirmations": 1
		}
	}

	console.log(payload)

	const shoppyRequest = await axios({
		method: "POST",
		url: "https://shoppy.gg/api/v1/pay",
		data:payload,
		headers: {
			"User-Agent": "MarketplaceBotWebhooks",
			"Authorization" : `${guildData.shoppyAPIKey}`,
		}
	})
	.then((res)=>{
		console.log(res)
		if(res.data.status === false){
			console.log(res);
			throw `APIError ${res.data.status}`;	
		}
		console.log("success!");
		return res.data.details.urls.payment.url;
	})
	.catch((obj)=>{
		console.log("error");
		console.log(obj)
	});

return await shoppyRequest;
}

async function createPingAddonInvoice(channel, category){

	const guildData = await prisma.settings.findFirst({
		where:{
			guildID: channel.guild.id
		}
	})

	const categoryData = await prisma.categories.findFirst({
		where: {
			CategoryID: category.id
		}
	})
	const fields = [
		["Action", "buyPingAddon"],
		["ChannelID", channel.id],
	]

	const variables = createVariablesString(fields);

	const payload = {
		"product": {
			"title": `Ping addon in shop ${channel.name}`,
			"price": categoryData.pingAddonPrice,
			"currency": "USD",
			"webhook_urls": [
				webhookURL
			],
			'quantity': {
				"min" : 1,
				"max" : 1
			},
			'description': "When you pay this Shoppy invoice, we will automatically add 1 ping for you to use per day."+variables,
			"confirmations": 1
		}
	}

	const shoppyRequest = await axios({
			method: "POST",
			url: "https://shoppy.gg/api/v1/pay",
			data:payload,
			headers: {
				"User-Agent": "MarketplaceBotWebhooks",
				"Authorization" : `${guildData.shoppyAPIKey}`,
			}
		})
		.then((res)=>{
			console.log(res)
			if(res.data.status === false){
				console.log(res);
				throw `APIError ${res.data.status}`;	
			}
			console.log("success!");
			return res.data.details.urls.payment.url;
		})
		.catch((obj)=>{
			console.log("error");
			console.log(obj)
		});

	return await shoppyRequest;
}


function createVariablesString(varArray){
	let variables = "<br> ";
	for (const field of varArray) {
		variables = variables + `<br>${field[0]}: ${field[1]} `
		console.log(field[0] + "  " + field[1])
	}
	variables = variables + "<br>"
	
	return variables;
}

module.exports.createExtensionProductID = createExtensionProductID;
module.exports.createCreationProductID = createCreationProductID;
module.exports.createPingAddonInvoice = createPingAddonInvoice;