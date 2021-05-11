const Discord = require('discord.js')
const prisma = require('../../tools/prisma')
const {minimumInvoicePrice} = require('../../config.json')
const emailValidator = require('email-validator')
const webhookSender = require('../../daemon/webhooks/webhookSender')

const toolkit = require('../../tools/toolkit')
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

		toolkit.addPingAddon(client, message.channel.id)

		return;

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
		const filter = receivedMsg => user.id === receivedMsg.author.id;
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

				const emailRequestEmbed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Please Enter your Email')
				.setDescription('We need your email to send you the receipts of purchase.\n\n'+
				'We are asking you this inside private DMs because we do not want other users to see your email. Thank us later 😉')
				.addFields(
					{ name: 'Your Discord User Tag', value: user.tag, inline: true },
					{ name: 'Your Discord User ID', value: user.id, inline: true },
					{ name: "Discord Guild ID", value: message.guild.id, inline: true })
					.addFields(
						{name: "Category Name", value: message.guild.name, inline: true},
						{ name: 'Shop\'s Price per Day', value: categoryData.pricePerDay, inline: true },
						{ name: "Minimum Invoice Amount", value: minimumInvoicePrice+"EUR", inline: true }
						);


						await user.send(emailRequestEmbed).then(async function(sentMessage){
							await sentMessage.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
							.then((receivedAnswer)=>{
								const enteredEmail = receivedAnswer.first().content;
								if(!emailValidator.validate(enteredEmail)){
									throw("invalidEmail");
								}
								userEmail = enteredEmail;
								const embed = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setTitle('Thanks for entering your email!')

								sentMessage.channel.send(embed);
							})
							.catch((err)=>{
								const embed = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setTitle('Oops! An error has occurred!')
								.setDescription('We had some issues fetching your email. Maybe the available time ran out?\n\n'+
								'If you want to start again, please resend the command wherever you sent it so we can fetch the needed data.')

								if(err === "invalidEmail"){
									embed.addField("Error", "You entered an invalid email. Please reenter the command and try again.");
								}else
								if(err.size === 0){
									embed.addField("Error", "We did not receive any messages in the specified time window. Please reenter the command and try again.");
								}
								console.log(err);
								sentMessage.channel.send(embed);
							});
						});

						if (userEmail === undefined) return;

						//If you've gotten this far, you can be sure that the data that has been given by the user is valid.
								const successfulInputEmbed = new Discord.MessageEmbed()
								.setColor('#0099ff')
								.setTitle('Thanks for your inputs!')
								.setDescription('Using your inputs, the guild ID, and your User ID, we will now make some behind-the-scenes magic to deliver you a Sellix payment invoice.\n\n'+
								'When that invoice is paid, with any of the payment methods you would like, we will automatically create a channel for you where you will be the owner.\n\n'+
								'We need to clarify that, for simplicity, safety, and ease of use, we are using Sellix.io as our payment processor. That means that, we do not receive any information pertraining to your payment information, including possibly credit card info or PayPal credentials. We only receive information relevant to the invoice that has been paid, not to **how** it has been paid.\n\n'+
								'Below you will find the information we will send to Sellix to make your payment, and the subsequent Store creation.') 
								.addFields(
									{ name: 'Your Discord User Tag', value: user.tag, inline: true },
									{ name: 'Your Discord User ID', value: user.id, inline: true },
									{ name: "Discord Guild ID", value: message.guild.id, inline: true })
									.addFields(
										{name: "Category Name", value: message.guild.name, inline: true},
										{ name: 'Shop\'s Price per Day', value: categoryData.pricePerDay, inline: true },
										{ name: "Minimum Invoice Amount", value: minimumInvoicePrice+"EUR", inline: true }
										);
									
									user.send(successfulInputEmbed);
		
	const sellixResponseBody = await webhookSender.createPingAddonInvoice(message.channel, message.channel.parent, message.guild, userEmail);
	if(sellixResponseBody === undefined){
		user.send("There has been a problem with your request. Please check your inputs and try again.")
	}else{
		const successfulWebhookReceivedEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Press here to be taken to the Sellix invoice page!')
		.setDescription('When we receive your payment, we will create your new shop, with the days of subscription time that you requested.')
		.setURL(sellixResponseBody.data.url);
		
		user.send(successfulWebhookReceivedEmbed);
	}
	if(sellixResponseBody === undefined){
		message.reply("There has been a problem with your request. Please check your inputs and try again.")
	}else{
		message.reply(`when you press on the following link, you will be redirected to a Sellix payment webpage, that when paid, will grant you an additional ${args[1]} day(s) of channel subscription time **for the channel that you are currently in.** \n ${sellixResponseBody.data.url}`);
	}
}
				}