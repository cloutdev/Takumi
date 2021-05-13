/* eslint-disable no-unreachable */
const Discord = require('discord.js');
const prisma = require('../../tools/prisma')
const toolkit = require("../../tools/toolkit")

//Here the command starts
module.exports = {
	//definition
	name: "setup", //the name of the command 
	category: "setup", //the category this will be listed at, for the help cmd
	aliases: ["s"], //every parameter can be an alias
	cooldown: 2, //this will set it to a 2 second cooldown
	usage: "say <Text>", //this is for the help command for EACH cmd
	description: "Resends the message", //the description of the command
	
	//running the command with the parameters: client, message, args, user, text, prefix
	// eslint-disable-next-line no-unused-vars
	run: async (client, message, args, user, text, prefix) => {
		
		const emoteFilter = (reaction, reactionUserSender) => {
			if(((reaction.emoji.name === '✅') || (reaction.emoji.name === '❌')) && (reactionUserSender.id === message.author.id)){
				return true;
			}else return false;
		};
		
		console.log(message.guild.roles.cache)
		
		let APIKey;
		let webhookSecret;
		let serverwideModeratorRole;
		let publicBotChannel;
		let privateBotChannel;
		let closedCategoryID;
		
		const messageFilter = receivedMsg => user.id === receivedMsg.author.id;
		
		const checkGuild = await prisma.settings.count({
			where:{
				guildID: message.guild.id
			}
		})
		
		if(checkGuild > 0){
			const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('This server has already been setup!')
			.setDescription('You do not need to run this command again.')
			
			message.reply(embed);
			return;
		}
		
		
		
		const checkDMsEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Please check your DMs!')
		.setDescription('We will continue the server\'s setup there.')
		
		
		message.reply(checkDMsEmbed)
		
		const firstMessageEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Are you sure you want to setup this bot in your server?')
		.setDescription('We will need to create new channels and new categories in your server. Needless to say, we would appreciate you giving us administrator roles, as we would like to avoid potential permissions-related errors.\n\n'+
		'Before we begin, it would be great if you could prepare some of the things we need to get you up and running.\n\n'+
		"- First of all, we will need the API key and webhook secret to your Shoppy.gg account. We need the API key to create the invoices that your clients will pay, and the webhook secret to automatically take action when a user pays an invoice.\n\n"+
		"- Then, we will need you to create a role that the server user(s) responsible for the shops will be in. We will use that to allow users in that role to manage the bot.\n\n"+
		"- Lastly, We will need you to create two channels. One of them will be available to the general public, for announcements related to the bot's actions, and then, a private bot channel, possibly with the role described above, where the bot will send information private to the shop owners (Shop expiry notifications, etc.)\n\n"+
		"Please make sure all of that has been prepared beforehand, as we will need all of that information shortly.\n\n"+
		
		'Please react with a ✅ if you are ready to start. Else, react with ❌.')
		
		const sentConfirmMessage = await user.send(firstMessageEmbed)
		
		await sentConfirmMessage.react('✅');
		await sentConfirmMessage.react('❌');
		let cancelledSetup = false;
		await sentConfirmMessage.awaitReactions(emoteFilter, { max: 1, time: 30000, errors: ['time'] })
		.then(async (receivedReactions)=>{
			const emoteReceived = receivedReactions.first().emoji.name;
			if(emoteReceived === '❌'){
				cancelledSetup = true;
				throw 'Rejected';
			}
		})
		.catch((err)=>{
			cancelledSetup = true;
			console.log(err)
			return;
		})
		
		if(cancelledSetup){
			const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('You stopped the setup process!')
			.setDescription('We\'re sorry to see you leave, \'till I see you again!')
			user.send(embed);
			return;
		}
		
		
		const embed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('We\'re so happy to see you!')
		.setDescription('We will now start the process of setting up your Discord server with our bot.')
		user.send(embed);
		
		const APIKeyEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Shoppy API Key')
		.setDescription('Please enter your Shoppy.gg API key, found by pressing above.')
		.setURL('https://shoppy.gg/user/settings')
		
		await user.send(APIKeyEmbed).then(async function(sentMessage){
			await sentMessage.channel.awaitMessages(messageFilter, { max: 1, time: 30000, errors: ['time'] })
			.then((received)=>{
				const receivedContent = received.first().content;
				
				APIKey = receivedContent;

				console.log('aite')
				
			})
			.catch(()=>{
				cancelledSetup = true;
			})
		})


		
		if(cancelledSetup){
			const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('You stopped the setup process!')
			.setDescription('We\'re sorry to see you leave, \'till I see you again!')
			user.send(embed);
			return;
		}

		console.log(APIKey)
		
		const secretEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Shoppy.gg Webhook Secret')
		.setDescription('Thanks for entering your API key. We will now need your Shoppy.gg Webhook Secret, in the same way you entered it before.')
		.setURL('https://shoppy.gg/user/settings')
		.addField('Shoppy API Key',APIKey)
				
		await user.send(secretEmbed).then(async function(sentMessage){
			await sentMessage.channel.awaitMessages(messageFilter, { max: 1, time: 30000, errors: ['time'] })
			.then((received)=>{
				const receivedContent = received.first().content;
				
				webhookSecret = receivedContent;
				
			})
			.catch(()=>{
				cancelledSetup = true;
			})
		});
		
		if(cancelledSetup){
			const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('You stopped the setup process!')
			.setDescription('We\'re sorry to see you leave, \'till I see you again!')
			user.send(embed);
			return;
		}
		
		console.log(webhookSecret)

		let availableRolesJSON = [];
		(message.guild.roles.cache).forEach(role => availableRolesJSON.push(role));
		availableRolesJSON = await availableRolesJSON.filter(role => (role.id != message.guild.id) && (role.managed === false))

		let rolesEmbedFields = [];
		availableRolesJSON.forEach(function(role, i){
			rolesEmbedFields.push({name: `Selection #${i+1}`, value:role.name, inline: false})
		});
		
		const serverModRoleEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Select a moderator role')
		.setDescription('Members that have this role will be able to modify some of the bot\'s data.')
		.addFields(rolesEmbedFields)
		
		await user.send(serverModRoleEmbed).then(async function(sentMessage){
			await sentMessage.channel.awaitMessages(messageFilter, { max: 1, time: 30000, errors: ['time'] })
			.then((received)=>{
				const receivedContent = received.first().content;
				
				if(isNaN(receivedContent)){
					throw 'NaN'
				}
				
				serverwideModeratorRole = availableRolesJSON[receivedContent-1]
			})
			.catch(()=>{
				cancelledSetup = true;
			})
		});
		
		if(cancelledSetup){
			const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('You stopped the setup process!')
			.setDescription('We\'re sorry to see you leave, \'till I see you again!')
			user.send(embed);
			return;
		}
		
		console.log(serverwideModeratorRole)

		let availableChannelsJSON = [];
		message.guild.channels.cache.forEach(channel => availableChannelsJSON.push(channel));
		availableChannelsJSON = await availableChannelsJSON.filter(channel => channel.type === 'text')

		let channelsEmbedFields = [];
		availableChannelsJSON.forEach(function(channel, i){
			channelsEmbedFields.push({name: `Selection #${i+1}`, value:channel.name, inline: false})
		});
		
		const publicChannelEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Public bot Channel')
		.setDescription('Please enter the channel you want the bot to send public announcements to.')
		.addFields(channelsEmbedFields)

		await user.send(publicChannelEmbed).then(async function(sentMessage){
			await sentMessage.channel.awaitMessages(messageFilter, { max: 1, time: 30000, errors: ['time'] })
			.then((received)=>{
				const receivedContent = received.first().content;
				
				if(isNaN(receivedContent)){
					throw 'NaN'
				}
				
				publicBotChannel = availableChannelsJSON[receivedContent-1]
			})
			.catch(()=>{
				cancelledSetup = true;
			})
		})
		
		if(cancelledSetup){
			const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('You stopped the setup process!')
			.setDescription('We\'re sorry to see you leave, \'till I see you again!')
			user.send(embed);
			return;
		}

		console.log(publicBotChannel)
		
		
		const privateChannelEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Private bot Channel')
		.setDescription('Please enter the channel you want the bot to send private messages to.')
		.addFields(channelsEmbedFields)
		
		await user.send(privateChannelEmbed).then(async function(sentMessage){
			await sentMessage.channel.awaitMessages(messageFilter, { max: 1, time: 30000, errors: ['time'] })
			.then((received)=>{
				const receivedContent = received.first().content;
				
				if(isNaN(receivedContent)){
					throw 'NaN'
				}
				
				privateBotChannel = availableChannelsJSON[receivedContent-1]
			})
			.catch(()=>{
				cancelledSetup = true;
			})
		});
		
		if(cancelledSetup){
			const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('You stopped the setup process!')
			.setDescription('We\'re sorry to see you leave, \'till I see you again!')
			user.send(embed);
			return;
		}

		console.log(privateBotChannel)

		const createClosedCategory = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('All done with the inputs!')
			.setDescription('We now need to create a category where all the closed shops will go. Nothing needs to be done by you!')

		
		await user.send(createClosedCategory).then(()=>{

			message.guild.channels.create("Closed Shops",{
				type: 'category',
				permissionOverwrites: [
					{
						id: message.guild.id,
						deny: ["VIEW_CHANNEL", "SEND_MESSAGES"],
					}
				]
			}).then((category)=>{
				console.log(category);
				closedCategoryID = category.id;

			})
		});
		const openCategoryEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Success!')
		.setDescription('We will now guide you through creating your own normal, open shop category. You can open lots more!')
		user.send(openCategoryEmbed);
		await toolkit.createCategory(user, message.guild).then(()=>{
			prisma.settings.create({
				data:{
					guildID: message.guild.id,
					closedCategoryID: closedCategoryID,
					publicBotChannel: publicBotChannel.id,
					privateBotChannel:privateBotChannel.id,
					owner: user.id,
					adminRoleID: serverwideModeratorRole.id,
					shoppyAPIKey: APIKey,
					shoppySecret: webhookSecret
				}
			}).then(()=>{
				const embed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle('All set up!')
					.setDescription('We are really happy to let you know that the initial setup for your server has been completed!')
				
					user.send(embed);
			})
		})
	}
}

// TODO: Fix this fucking shit what is this
/*


const closedCategoryID = (await message.guild.channels.create("Closed Shops",{
	type: 'category',
	permissionOverwrites: [
		{
			id: message.guild.id,
			deny: ["VIEW_CHANNEL", "SEND_MESSAGES"],
		}
	]
})
).id;





const count = await db.query("SELECT * from settings where guildID = ?",{
	replacements: [message.guild.id],
	type: QueryTypes.SELECT,
	logging: console.log,
});

if(count.length != 0) return;

const filter = (user) => (user.author.id === message.author.id);

let settings = [];

const firstEmbed = new discord.MessageEmbed()
.setColor('#0099ff')
.setTitle("Clout's Marketplace Bot Setup")
.setURL('https://clout.stocky.cc')
.setAuthor('Welcome!')
.setDescription("Please enter the name of the channel that you would like the bot to make **public** announcements")
.setTimestamp()
.setFooter(`Clout's Marketplace Bot, requested by ${user.tag}`);

await message.channel.send(firstEmbed).then(()=>{
	message.channel.awaitMessages(filter, {
		max: 1,
		time: 15000,
	}).then(
		(collected) => {
			console.log(collected.first().content);
			settings.push(collected.first().content);
			console.log(settings);
			message.channel.send("Thanks for your answer!");
			
			
			const secondEmbed = new discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle("Clout's Marketplace Bot Setup")
			.setURL('https://clout.stocky.cc')
			.setAuthor('Step 2')
			.setDescription("Please enter the Channel ID of the channel that you would like the bot to send confidential messages to. This should only have permissions for the owners/moderators of the server.")
			.setTimestamp()
			.setFooter(`Clout's Marketplace Bot, requested by ${user.tag}`);
			
			message.channel.send(secondEmbed).then(()=>{
				message.channel.awaitMessages(filter, {
					max: 1,
					time: 15000,
				}).then(
					(collected) => {
						console.log(collected.first().content);
						settings.push(collected.first().content);
						console.log(settings);
						message.channel.send("Thanks for your answer!");
						const thirdEmbed = new discord.MessageEmbed()
						.setColor('#0099ff')
						.setTitle("Clout's Marketplace Bot Setup")
						.setURL('https://clout.stocky.cc')
						.setAuthor('Step 2')
						.setDescription("Please enter the display name of the bot.")
						.setTimestamp()
						.setFooter(`Clout's Marketplace Bot, requested by ${user.tag}`);
						
						message.channel.send(thirdEmbed).then(()=>{
							message.channel.awaitMessages(filter, {
								max: 1,
								time: 15000,
							}).then(
								(collected) => {
									console.log(collected.first().content);
									settings.push(collected.first().content);
									console.log(settings);
									message.channel.send("Thanks for your answer!");
									const fourthEmbed = new discord.MessageEmbed()
									.setColor('#0099ff')
									.setTitle("Clout's Marketplace Bot Setup")
									.setURL('https://clout.stocky.cc')
									.setAuthor('Step 2')
									.setDescription("Please enter the display name of the bot.")
									.setTimestamp()
									.setFooter(`Clout's Marketplace Bot, requested by ${user.tag}`);
									
									message.channel.send(fourthEmbed).then(()=>{
										message.channel.awaitMessages(filter, {
											max: 1,
											time: 15000,
										}).then(
											(collected) => {
												console.log(collected.first().content);
												settings.push(collected.first().content);
												console.log(settings);
												message.channel.send("Thanks for your answer!");
											}
											).catch(()=>{message.channel.send("No message was received. Please try again."); return;})        
										});
									}
									).catch(()=>{message.channel.send("No message was received. Please try again."); return;})
								});
							}
							).catch(()=>{message.channel.send("No message was received. Please try again."); return;})
						});
					}
					).catch(()=>{message.channel.send("No message was received. Please try again."); return;})
				});
				
				settings.push(message.guild.id);
				await db.query('INSERT INTO settings (publicBotChannel, privateBotChannel, botName, botImg, guildID) values (?, ?, ?, ?, ?)',{
					replacements: [settings],
					type: QueryTypes.INSERT,
					logging: console.log,
				})
				
				*/