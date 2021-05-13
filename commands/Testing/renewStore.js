const webhookSender = require("../../daemon/webhooks/webhookSender");
const Discord = require("discord.js");

//Here the command starts
module.exports = {
    //definition
    name: "renewStore", //the name of the command 
    category: "Testing", //the category this will be listed at, for the help cmd
    aliases: ["renew"], //every parameter can be an alias
    cooldown: 2, //this will set it to a 2 second cool  down
    usage: "renewStore", //this is for the help command for EACH cmd
    description: "Used to renew a store's subscription. DEPRECATED, ONLY USE THE INFORMATION MENU", //the description of the command

    //running the command with the parameters: client, message, args, user, text, prefix
    // eslint-disable-next-line no-unused-vars
    run: async (client, message, args, user, text, prefix) => {
        
        const checkDMsEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Please check your DMs')
        .setDescription('We have sent you a message directly and you will proceed with your request there.')
        
        message.reply(checkDMsEmbed);

      const successfulInputEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Thanks for your inputs!')
        .setDescription('Using your inputs, the guild ID, and your User ID, we will now make some behind-the-scenes magic to deliver you a Shoppy payment invoice.\n\n')
        .addFields(
          { name: 'Channel ID (Your store\'s ID)', value: message.channel.id, inline: true },
          { name: 'Guild ID', value: message.guild.id, inline: true },
        )
          
      user.send(successfulInputEmbed);

      const shoppyResponseBody = await webhookSender.createExtensionProductID(message.channel.id, message.guild);

      if(shoppyResponseBody === undefined){
        user.send("There has been a problem with your request. Please check your inputs and try again.")
      }
      else{
        const successfulWebhookReceivedEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Press here to be taken to the Shoppy invoice page!')
          .setDescription('When we receive your payment, we will renew your shop, with the days of subscription time that you requested.')
          .setURL(shoppyResponseBody);
        
      user.send(successfulWebhookReceivedEmbed);
      }

    }
}