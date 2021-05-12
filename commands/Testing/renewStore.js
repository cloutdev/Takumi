const webhookSender = require("../../daemon/webhooks/webhookSender");
const emailValidator = require('email-validator');
const Discord = require("discord.js");
const config = require("../../config.json");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

//Here the command starts
module.exports = {
    //definition
    name: "renewStore", //the name of the command 
    category: "Testing", //the category this will be listed at, for the help cmd
    aliases: ["renew"], //every parameter can be an alias
    cooldown: 2, //this will set it to a 2 second cooldown
    usage: "renewStore", //this is for the help command for EACH cmd
    description: "Used to renew a store's subscription.", //the description of the command

    //running the command with the parameters: client, message, args, user, text, prefix
    // eslint-disable-next-line no-unused-vars
    run: async (client, message, args, user, text, prefix) => {
        let userEmail;
        let amountOfDays;
        
        const filter = receivedMsg => user.id === receivedMsg.author.id;

        const guildData = await prisma.settings.findUnique({
          where: {
            guildID: message.guild.id
          }
        });
        
        const checkDMsEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Please check your DMs')
        .setDescription('We have sent you a message directly and you will proceed with your request there.')
        
        message.reply(checkDMsEmbed);

      const successfulInputEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Thanks for your inputs!')
        .setDescription('Using your inputs, the guild ID, and your User ID, we will now make some behind-the-scenes magic to deliver you a Sellix payment invoice.\n\n'+
        'When that invoice is paid, with any of the payment methods you would like, we will automatically renew the channel to which you sent the initial command.\n\n'+
        'We need to clarify that, for simplicity, safety, and ease of use, we are using Sellix.io as our payment processor. That means that, we do not receive any information pertraining to your payment information, including possibly credit card info or PayPal credentials. We only receive information relevant to the invoice that has been paid, not to **how** it has been paid.\n\n'+
        'Below you will find the information we will send to Sellix to make your payment, and the subsequent Store creation. If you want to, you can use them to verify the information you provided.') 
        .addFields(
          { name: 'Amount of Days of Subscription', value: amountOfDays, inline: true },
          { name: 'Channel ID (Your store\'s ID)', value: message.channel.id, inline: true },
          { name: 'Guild ID', value: message.guild.id, inline: true },
          )
          
      user.send(successfulInputEmbed);

      const sellixResponseBody = await webhookSender.createExtensionProductID(message.channel.id, message.guild);

      if(sellixResponseBody === undefined){
        user.send("There has been a problem with your request. Please check your inputs and try again.")
      }
      else{
        const successfulWebhookReceivedEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Press here to be taken to the Sellix invoice page!')
          .setDescription('When we receive your payment, we will renew your shop, with the days of subscription time that you requested.')
          .setURL(sellixResponseBody);
        
      user.send(successfulWebhookReceivedEmbed);
      }

    }
}