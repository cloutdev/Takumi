const axios = require("axios").default;
const db = require("../../tools/database");
const {QueryTypes} = require('sequelize');

async function createProductID(channelID, email){
	console.log("here");

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
		"title": "Demo Payment",
		"gateway": "BITCOIN",
		"value": 0.5,
		"currency": "EUR",
		"quantity": 3,
		"confirmations": 1,
		"email": email,
		"custom_fields":  {
			"ChannelID": channelID
		},
		"webhook": "http://a82bf2491bc8.ngrok.io",
		"white_label": false,
		"return_url": "http://a82bf2491bc8.ngrok.io"
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
				throw `APIError ${res.data.status}`;
			}
			console.log("success!");
			console.log(res.data.data.url);
			return res.data.data.url;
		})
		.catch((obj)=>{
			console.log("error");
			console.log(obj)
		});

	return await sellixRequest;
}

module.exports.createProductID = createProductID;