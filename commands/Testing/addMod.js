const prisma = require('../../tools/prisma')
const Discord = require('discord.js')

//Here the command starts
module.exports = {
    //definition
    name: "addMod", //the name of the command 
    category: "fun", //the category this will be listed at, for the help cmd
    aliases: ["add"], //every parameter can be an alias
    cooldown: 2, //this will set it to a 2 second cooldown
    usage: "say <Text>", //this is for the help command for EACH cmd
    description: "Resends the message", //the description of the command

    //running the command with the parameters: client, message, args, user, text, prefix
    // eslint-disable-next-line no-unused-vars
    run: async (client, message, args, user, text, prefix) => {

		const dbChannel = await prisma.channels.findFirst({
			where: {
				channelID: message.channel.id
			}
		})

		if(dbChannel === undefined){

			const noChannelFoundEmbed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle("you are not in a valid channel!")
				.setDescription('Please go to a valid channel and try to use the command there.');
				message.reply(noChannelFoundEmbed);

			return;
		}

		if(user.id != dbChannel.masterUser){

			const embed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('No moderators Found!')
				.setDescription("you did not provide any users to add as a moderator.\n\nPlease try to tag them.")
			
				message.reply(embed);
			return;
		}

		if(args.length == 0){

			const embed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('No moderators Found!')
				.setDescription("you did not provide any users to add as a moderator.\n\nPlease try to tag them.")
			
				message.reply(embed);
			return;
		}
		
		args.forEach((mention) => {
			const mod = getUserFromMention(mention);

			message.channel.updateOverwrite(mod.id, 
				{
					'MANAGE_MESSAGES': true,
					'SEND_MESSAGES': true,
					'EMBED_LINKS' : true,
				}
			);

			prisma.mods.create({
				data:{
					channelID: message.channel.id,
					modID: mod.id,
					addedBy: user.id
				}
			})
		});

		const successEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Added!')
			.setDescription('All the moderators you specified have been added to the moderation team.')
		
		message.channel.send(successEmbed);

		function getUserFromMention(mention) {
			if (!mention) return;
		
			if (mention.startsWith('<@') && mention.endsWith('>')) {
				mention = mention.slice(2, -1);
		
				if (mention.startsWith('!')) {
					mention = mention.slice(1);
				}
		
				return client.users.cache.get(mention);
			}
		}
    }
}