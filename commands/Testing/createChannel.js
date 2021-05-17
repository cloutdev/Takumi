const toolkit = require("../../tools/toolkit");
const Discord = require("discord.js");
const prisma = require("../../tools/prisma");
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
				.setFooter(`Takumi - Requested by ${user.tag}`)
				
				message.reply(embed);
				
				return;
			}

			const checkDMsEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Please Check your DMs!')
			.setFooter(`Takumi - requested by ${user.tag}`)
			.setTimestamp()
			message.reply(checkDMsEmbed);

			const validCategories = await prisma.categories.findMany({
				where: {
					guildID: message.guild.id
				}
			});

			for (let i = 0; i < validCategories.length; i++) {
				const fetchedChannel = await client.channels.fetch(validCategories[i].CategoryID)
				.catch(()=>{
					validCategories.splice(i, 1)
				})
				console.log(fetchedChannel)
			}
			
			const filter = response => {
				return (response.author.id === user.id)
			}

			if(validCategories.length === 0){
				const errEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle('Oops! We\'ve ran into a problem!')
					.setDescription('There are no available categories for you to buy a channel in. Please contact a member of the administration!')
				
				user.send(errEmbed);
				return;
			}

			console.log(validCategories);
			let categoriesEmbedJSON = [];

			for (let i = 0; i < validCategories.length; i++) {
				await client.channels.fetch(validCategories[i].CategoryID)
				.then((fetchedChannel)=>{
					categoriesEmbedJSON.push({ name: `Selection #${i+1}`, value: `**Category name**: ${fetchedChannel.name}\n**Category ID**: ${fetchedChannel.id}`})
				})
				.catch(()=>{
					return;
				})
			}
			
			const selectionEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('In which category do you want to make a channel in?')
			.setDescription('Please review the following available choices and enter the corresponding number.')
			.addFields(categoriesEmbedJSON)
			
			let userSelection;
			await user.send(selectionEmbed).then(async function(sentEmbed){
				await sentEmbed.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
        .then((receivedAnswer)=>{
					const selection = receivedAnswer.first().content;

					if(isNaN(selection)){
						throw 'NaN';
					}
					if(selection < 1){
						throw 'InvalidNumber';
					}
					
					if(selection > validCategories.length){
						throw 'InvalidNumber';
					}

					userSelection = selection-1;
        })
        .catch((err)=>{
					const embed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle('Oops! We stumbled upon an Error!')
					.setDescription('There has been an error while processing your request.\n\n'+
					'Maybe you did not enter a valid number, or you did not supply any number in the designated amount of time.')
					
					if(err === "NaN"){
						embed.addField("Error", "The number you entered is not a number.")
					}
					
					if(err === "InvalidNumber"){
						embed.addField("Error", "The value you entered is invalid for this use case. Please reenter the command and try again.")
					}
					
					console.log(err);
					sentEmbed.channel.send(embed);
					
					return;
        });
			});
			if (userSelection === undefined) return;

			const embed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('We will now attempt to create a new shop for you!')
				.setDescription('Thanks for using our bot!')
			
			user.send(embed);
			toolkit.createChannel(client, message.guild.id, user.id, user.id, validCategories[userSelection].CategoryID);
		}
}