const db = require("../../tools/database.js");
const {QueryTypes} = require('sequelize');
//Here the command starts
module.exports = {
    //definition
    name: "test", //the name of the command 
    category: "fun", //the category this will be listed at, for the help cmd
    aliases: ["t"], //every parameter can be an alias
    cooldown: 2, //this will set it to a 2 second cooldown
    usage: "say <Text>", //this is for the help command for EACH cmd
    description: "Resends the message", //the description of the command

    //running the command with the parameters: client, message, args, user, text, prefix '581575466578870302', '675476898926559239'
    // eslint-disable-next-line no-unused-vars
    run: async (client, message, args, user, text, prefix) => {
		const guild = (await db.query("SELECT * from settings WHERE guildID = ?",{
			replacements: [message.guild.id],
			type: QueryTypes.SELECT,
		}))[0];

		const channelName = "Test1";
		const channelDesc = "GAyyyyyyyyyy";
		
		const testArr = [];

		let permsArray = [
			{
				id: user.id,
				type: 'member',
				allow: [
					['MANAGE_CHANNELS', 'SEND_MESSAGES']
				]
			}
		];
		console.log(permsArray);
		console.log(guild.openCategoryID);
		const createdChannelID = await message.guild.channels.create(channelName,{
			topic : channelDesc,
			parent: guild.openCategoryID,
		}).then((channel)=>{
			channel.updateOverwrite(user.id, 
				{
					'MANAGE_CHANNELS': true,
					'SEND_MESSAGES': true,
					'MANAGE_MESSAGES': true,
					'EMBED_LINKS': true,
					'ATTACH_FILES': true,
				}
			);
			testArr.forEach((modID) => {
				channel.updateOverwrite(modID, {
					'MANAGE_MESSAGES': true,
					'EMBED_LINKS' : true,
				})
			});
			return channel.id;
		}).catch(()=>{
			message.reply("Something went wrong. Please try again later.");
			return;
		});

		console.log(
			await db.query('INSERT INTO channels (guildID, channelID, createdBy, masterUser, startsOn, expiresOn) values (?, ?, ?, ?, now(), DATE_ADD(now(), INTERVAL ? MINUTE))',{
				replacements: [message.guild.id, createdChannelID, user.id, user.id, 1],
				type: QueryTypes.INSERT,
				logging: console.log,
			})
		);

		console.log(
			await db.query("SELECT * from channels where expiresOn >= now()")
		);
    }
}