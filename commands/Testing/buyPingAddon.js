const Discord = require('discord.js')
const prisma = require('../../tools/prisma')
const webhookSender = require('../../daemon/webhooks/webhookSender')
//Here the command starts
module.exports = {
	//definition
	name: "buyPing", //the name of the command
	category: "Testing", //the category this will be listed at, for the help cmd
	aliases: ["addon", "buyPings"], //every parameter can be an alias
	cooldown: 2, //this will set it to a 2 second cooldown
	usage: "buyPing", //this is for the help command for EACH cmd
	description: "Purchases a Ping addon.", //the description of the command
	
	//running the command with the parameters: client, message, args, user, text, prefix
	// eslint-disable-next-line no-unused-vars
	run: async (client, message, args, user, text, prefix) => {
		
		const categoryData = await prisma.categories.findFirst({
			where:{
				CategoryID: message.channel.parentID
			}
		})
		
		if(!(categoryData.pingAddonPurchasesAvailable)){
			const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Oops! There\'s been an error!')
			.setDescription('The server owner has specified that users are not allowed to purchase ping addons.\n\n'+
			'If you believe that this is a mistake, make sure to contact the server owner, or the administration team.')
			
			message.reply(embed);
			return;
		}
		const checkDMsEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Please check your DMs')
		.setDescription('We have sent you a message directly and you will proceed with your request there.')
		
		message.reply(checkDMsEmbed);
		
		
		const channelData = await prisma.channels.findFirst({
			where:{
				channelID: message.channel.id
			}
		})
		
		let userEmail;
		const embed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Are you sure you want to proceed?')
		.setDescription('You can find information relevant to your purchase below.')
		.addFields(
			{ name: 'Store Name', value: message.channel.name, inline: true },
			{ name: 'Category Name', value: message.channel.parent.name, inline: true },
			{ name: 'Current Pings per Day', value: channelData.tagsPerDay, inline: true }
		)
		.addFields(
			{ name: 'Ping Addon Price', value: categoryData.pingAddonPrice, inline: true },
			{ name: 'Server Name', value: message.guild.name, inline: true },
			{ name: 'Shop\'s Price per Day', value: categoryData.pricePerDay, inline: true },
		)
				
		user.send(embed);
				
				
		const shoppyResponseBody = await webhookSender.createPingAddonInvoice(message.channel, message.channel.parent, message.guild, userEmail);
		if(shoppyResponseBody === undefined){
			user.send("There has been a problem with your request. Please check your inputs and try again.")
		}else{
			const successfulWebhookReceivedEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Press here to be taken to the Shoppy invoice page!')
			.setDescription('When we receive your payment, we will create your new shop, with the days of subscription time that you requested.')
			.setURL(shoppyResponseBody);
			
			user.send(successfulWebhookReceivedEmbed);
		}
	}
}