const db = require("../tools/database");
const {QueryTypes} = require('sequelize');
const moment = require('moment');
const prisma = require("../tools/prisma");
const Discord = require('discord.js');

async function closeChannel(channelToBeClosed, reason, discordClient){

	const modArray = (await db.query("SELECT * from mods WHERE channelID = ?",{
		replacements: [channelToBeClosed.id],
		type: QueryTypes.SELECT,
		logging: false,
	}));

	const guild = (await db.query("SELECT * from settings WHERE guildID = ?",{
		replacements: [channelToBeClosed.guild.id],
		type: QueryTypes.SELECT,
		logging: false,
	}))[0];

	const dbChannel = (await db.query("SELECT * from channels WHERE channelID = ?",{
		replacements: [channelToBeClosed.id],
		type: QueryTypes.SELECT,
		logging: false,
	}))[0];

	db.query('UPDATE channels SET isClosed = 1 WHERE channelID = ?',{
		replacements: [channelToBeClosed.id],
		type: QueryTypes.UPDATE,
		logging: false,
	}).then(()=>{
		channelToBeClosed.setParent(guild.closedCategoryID).then((channelToBeClosed)=>{
			channelToBeClosed.updateOverwrite(dbChannel.masterUser, 
				{
					"VIEW_CHANNEL": true
				}
			);
			modArray.forEach((modID) => {
				channelToBeClosed.updateOverwrite(modID.modID, {
					"VIEW_CHANNEL": true
				})
			});
		});

		discordClient.channels.fetch(guild.privateBotChannel).then((channel)=>{
			channel.send(channelToBeClosed.name+" Moved to Closed Channels!");
		});
		discordClient.users.fetch(dbChannel.masterUser).then((user)=>{

			const embed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Channel Closed')
				.setDescription(`Hello! We had to close the channel you had purchased at the server \`${channelToBeClosed.guild.name}\` for the following reason: \nReason: \`${reason}\``)
				.addFields(
					{ name: 'title', value: 'value', inline: false },
				)
			
			user.send(embed);
		});
	});
}

async function createChannel(discordClient, guildID, masterUserID, createdBy, categoryID){

	const discordGuild = await discordClient.guilds.fetch(guildID);

	const masterUser = await discordClient.users.fetch(masterUserID);

	const channelName = `${masterUser.username}'s Store`;
	const channelDesc = `This shop was opened on ${moment()}`;
	
	const categoryData = await prisma.categories.findFirst({
		where:{
			CategoryID: categoryID
		}
	})

	await discordGuild.channels.create(channelName,{
		topic : channelDesc,
		parent: categoryID,
	}).then((channel)=>{
		channel.updateOverwrite(masterUserID,
			{
				'MANAGE_CHANNELS': true,
				'SEND_MESSAGES': true,
				'MANAGE_MESSAGES': true,
				'EMBED_LINKS': true,
				'ATTACH_FILES': true,
			}
		);
		prisma.channels.create({
			data: {
				guildID: guildID,
				categoryID: categoryID,
				channelID: channel.id,
				createdBy: createdBy,
				masterUser: masterUserID,
				startsOn: moment().toISOString(),
				expiresOn: moment().add(1, 'minute').toISOString(),
				tagsPerDay: categoryData.BasePingsPerDay
			}
		}).then(()=>{
			const embed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Your channel has been successfully created!')

			
				masterUser.send(embed);
		})
		return channel.id;
	}).catch(()=>{
		masterUser.send("Something went wrong with your channel creation request. Please try again later or contact the server moderation team.");
		return;
	});


}

async function createCategory(discordUser, discordGuild){
	const embed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Create new Shop Category')
	.setDescription('We will guide you through creating a new shop category. Please do not do anything manually! We take care of everything through our bot.')
	
	discordUser.send(embed);
	
	const filter = response => {
		return (response.author.id === discordUser.id)
	}
	const questions = [
		"How many pings do you want shops to make per day?", 
		"What will be the price for the shops in this category per day?", 
		"What will be the price for a ping addon in this category per day?", 
		"What will be the minimum days for which a user will be able to buy a shop?", 
		"What do you want the maximum amount of open shops to be?"
	];
	let answers = {};
	
	for (const question of questions) {
		const QuestionEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle(question)
		.setDescription('We need this to create a new shop category for you.')
		
		let valueCheck;
		
		await discordUser.send(QuestionEmbed).then(async function(sentEmbed){
			await sentEmbed.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
			.then((receivedMessages)=>{
				const submittedValue = receivedMessages.first().content;
				if(isNaN(submittedValue)){
					throw 'NaN';
				}
				if(submittedValue < 0){
					throw 'LessThanZero';
				}
				
				answers[question] = submittedValue;
				valueCheck = submittedValue;
				const embed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Thanks! We have successfully received your input.')
				sentEmbed.channel.send(embed);
			})
			.catch((err)=>{
				const embed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Oops! We stumbled upon an Error!')
				.setDescription('There has been an error while processing your request.\n\n'+
				'Maybe you did not enter a valid number, or you did not supply any number in the designated amount of time.')
				
				if((err === "NaN") && (err === "LessThanZero")){
					embed.addField("Error", "The answer you submitted is not a number.")
				}
				
				console.log(err);
				sentEmbed.channel.send(embed);
				
				return;
			});
		});
		if (valueCheck === undefined) return;
	}
	questions.push("Should users be able to buy ping addons?");
	const pingAddonQuestion = "Should users be able to buy ping addons?";
	const pingAddonEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle(pingAddonQuestion)
	.setDescription('We need this to create a new shop category for you. Please press on the react you would like.')
	
	let valueCheck;
	await discordUser.send(pingAddonEmbed).then(async function(sentEmbed){
		await sentEmbed.react("✅");
		await sentEmbed.react("❌");

		const emoteFilter = (reaction, user) => (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") && user.id == discordUser.id;

		await sentEmbed.awaitReactions(emoteFilter, { max: 1, time: 30000, errors: ['time'] })
		.then((receivedMessages)=>{
			const submittedValue = receivedMessages.first().emoji.name;
			if(submittedValue === "✅"){
				answers[pingAddonQuestion] = true;
			}else if(submittedValue === "❌"){
				answers[pingAddonQuestion] = false;
			}

			valueCheck = submittedValue;
			const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Thanks! We have successfully received your input.')
			sentEmbed.channel.send(embed);
		})
		.catch((err)=>{
			const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Oops! We stumbled upon an Error!')
			.setDescription('There has been an error while processing your request.\n\n'+
			'Maybe you did not enter a valid number, or you did not supply any number in the designated amount of time.')

			if(err.size === 0){
				embed.addField("Error", "We did not receive any messages in the specified time window. Please reenter the command and try again.");
			}

			console.log(err);
			sentEmbed.channel.send(embed);
			
			return;
		});
	});
	if (valueCheck === undefined) return;
	
	console.log(answers)
	
	let valuesJSON = [];
	
	for (const question of questions) {
		valuesJSON.push({name: question, value: answers[question], inline: true})
	}
	
	const successEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('We will now create your category automatically!')
	.setDescription('You can change its title and physical position in whichever way you want to achieve the amount of exposure you personally would want.')
	.addFields(valuesJSON)
		
	discordUser.send(successEmbed);

	await discordGuild.channels.create(new Date(),{
		type: 'category',
		permissionOverwrites: [
			{
				id: discordGuild.id,
				deny: ["SEND_MESSAGES", "MENTION_EVERYONE"],
				allow: ["ADD_REACTIONS"]
			}
		]
	}).then((createdCategory)=>{
		prisma.categories.create({
			data: {
				CategoryID: createdCategory.id,
				guildID: discordGuild.id,
				pingAddonPrice: parseFloat(answers["What will be the price for a ping addon in this category per day?"]).toFixed(2),
				BasePingsPerDay: parseInt(answers["How many pings do you want shops to make per day?"]),
				pricePerDay: parseFloat(answers["What will be the price for the shops in this category per day?"]).toFixed(2),
				minimumDays: parseInt(answers["What will be the minimum days for which a user will be able to buy a shop?"]),
				maximumAmountOfChannels: parseInt(answers["What do you want the maximum amount of open shops to be?"]),
				pingAddonPurchasesAvailable: answers["Should users be able to buy ping addons?"]
			}
		}).then(()=>{
			const embed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Your category has been created!')
				.setDescription('You can now modify it in whichever way you would like! You are welcome to change its location and title to your needs!')
				.addFields(
					{ name: 'Category Name', value: createdCategory.name, inline: true },
					{ name: 'Category ID', value: createdCategory.id, inline: true },
				)
			discordUser.send(embed)
		})
	})
}

async function addPingAddon(discordClient, providedChannelID){

	const channelData = await prisma.channels.findFirst({
		where:{
			channelID: providedChannelID
		}
	})

	console.log(channelData)

	prisma.channels.updateMany({
		where:{
			channelID: providedChannelID
		},
		data: {
			tagsPerDay: {
				increment: 1
			}
		}
	}).then(async ()=>{
		const discordMasterUser = await discordClient.users.fetch(channelData.masterUser);
		console.log(discordMasterUser);
		const discordGuild = await discordClient.guilds.fetch(channelData.guildID);
		console.log(discordGuild.cache);
		const discordChannel = await discordClient.channels.fetch(channelData.channelID);
		console.log(discordChannel);
		const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Success!')
			.setDescription(`We have added 1 more ping for you to use per day on the ${discordChannel.name} store!`)
			.addFields(
				{ name: 'Discord Server Name', value: discordGuild.name, inline: true },
				{ name: 'Discord Store Name', value: discordChannel.name, inline: true },
				{ name: 'Current Pings per Day', value: channelData.tagsPerDay, inline: true }
			)
		
		discordMasterUser.send(embed);
	})
}

module.exports.closeChannel = closeChannel;
module.exports.createChannel = createChannel;
module.exports.createCategory = createCategory;
module.exports.addPingAddon = addPingAddon;