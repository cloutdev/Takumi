const prisma = require("../../tools/prisma")

//Here the command starts
module.exports = {
    //definition
    name: "remove", //the name of the command 
    category: "fun", //the category this will be listed at, for the help cmd
    aliases: [], //every parameter can be an alias
    cooldown: 2, //this will set it to a 2 second cooldown
    usage: "say <Text>", //this is for the help command for EACH cmd
    description: "Resends the message", //the description of the command

    //running the command with the parameters: client, message, args, user, text, prefix
    // eslint-disable-next-line no-unused-vars
    run: async (client, message, args, user, text, prefix) => {

	
		if(message.guild.ownerID !== user.id){
			const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('You do not have permission to do that!')
			.setDescription('The server\'s administation will need to give you access to the role to execute this command')
			.setFooter(`Takumi - Requested by ${user.tag}`)
			
			message.reply(embed);
			
			return;
		}
        
        await prisma.settings.update({
            where: {
                guildID: message.guild.id
            },
            data:{
                isActive: false
            }
        })

        await prisma.channels.updateMany({
            where: {
                guildID: message.guild.id
            },
            data:{
                isClosed: true
            }
        })


        console.log("success")


    }
}