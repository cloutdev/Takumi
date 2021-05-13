const Discord = require("discord.js")
const { PrismaClient } = require('@prisma/client');
const toolkit = require('../../tools/toolkit')
const prisma = new PrismaClient()
//Here the command starts
module.exports = {
	//definition
	name: "create", //the name of the command 
	category: "fun", //the category this will be listed at, for the help cmd
	aliases: ["say", "sayit", "category"], //every parameter can be an alias
	cooldown: 2, //this will set it to a 2 second cooldown
	usage: "say <Text>", //this is for the help command for EACH cmd
	description: "Resends the message", //the description of the command
	
	//running the command with the parameters: client, message, args, user, text, prefix
	// eslint-disable-next-line no-unused-vars
	run: async (client, message, args, user, text, prefix) => {

		const guildSettings = await prisma.settings.findUnique({
			where: {
				guildID: message.guild.id
			}
		});
		
		if(!(message.member.roles.cache.has(guildSettings.adminRoleID))){
			const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('You do not have permission to do that!')
			.setDescription('The server\'s administation will need to give you access to the role to execute this command')
			.setFooter(`Clout's Marketplace Bot, requested by ${user.tag}`)
			
			message.reply(embed);
			
			return;
		}

		const checkDMsEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Please Check your DMs!')
		.setFooter(`Clout's Marketplace Bot, requested by ${user.tag}`)
		.setTimestamp()
		message.reply(checkDMsEmbed).then(()=>{
			toolkit.createCategory(user, message.guild)
		});
	}
}