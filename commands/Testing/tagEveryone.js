const prisma = require('../../tools/prisma')
const Discord = require('discord.js')

const moment = require('moment')
//Here the command starts
module.exports = {
    //definition
    name: "tagEveryone", //the name of the command 
    category: "info", //the category this will be listed at, for the help cmd
    aliases: ["tag"], //every parameter can be an alias
    cooldown: 2, //this will set it to a 2 second cooldown
    usage: "ping", //this is for the help command for EACH cmd
    description: "Gives you information on how fast the Bot can respond to you", //the description of the command

    //running the command with the parameters: client, message, args, user, text, prefix
    // eslint-disable-next-line no-unused-vars
    run: async (client, message, args, user, text, prefix) => {

		const dbChannel = await prisma.channels.findFirst({
			where:{
				channelID: message.channel.id
			}
		})


		const guildSettings = await prisma.settings.findUnique({
			where: {
				guildID: message.guild.id
			}
		});
		
		if(!(message.member.roles.cache.has(guildSettings.adminRoleID))){

		}



		/*const dbChannel = (await db.query("SELECT * from channels WHERE channelID = ?",{
			replacements: [message.channel.id],
			type: QueryTypes.SELECT,
			logging: false,
		}))[0];*/


		const mods = await prisma.mods.findFirst({
			where:{
				channelID: message.channel.id,
				modID: user.id
			}
		})

		if(mods === undefined){
			const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('You do not have permission to do that!')
			.setDescription('The shop\'s administation will need to give you access to the shop\'s moderation team to execute this command')
			.setFooter(`Takumi - Requested by ${user.tag}`)
			
			message.reply(embed);
			
			return;
		}

		const tagCount = await prisma.sentpings.count({
			where:{
				channelID: message.channel.id,
				sentOn: {
					gt: moment().subtract(1, 'day').toISOString()
				}
			}
		})
		console.log(moment().add(1, 'day').toISOString())
		console.log(tagCount);

		/*const tagCount = (await db.query("SELECT count(*) as count from sentpings WHERE channelID = ? AND sentOn > DATE_SUB(now(), INTERVAL 1 DAY)",{
			replacements: [message.channel.id],
			type: QueryTypes.SELECT,
			logging: false,
		}))[0].count;*/

		console.log(dbChannel.tagsPerDay)	

		if(tagCount >= dbChannel.tagsPerDay){
			const embed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('You have reached the maximum amount of tags for today!')
				.setDescription('Please wait until tagging everyone again.')
			
				message.reply(embed);
			return;
		}

		message.channel.send("@everyone bump!");

		/*await db.query('INSERT INTO sentPings (channelID, sentBy) values (?, ?)',{
			replacements: [message.channel.id, user.id],
			type: QueryTypes.INSERT,
			logging: console.log,
		})*/

		await prisma.sentpings.create({
			data:{
				channelID: message.channel.id,
				sentBy: user.id
			}
		})
    }
}
