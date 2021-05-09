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

        const emailRequestEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Please Enter your Email')
        .setDescription('We need your email to send you the receipts of purchase.\n\n'+
        'We are asking you this inside private DMs because we do not want other users to see your email. Thank us later 😉')
        .addFields(
          { name: 'Your Discord User Tag', value: user.tag, inline: true },
          { name: 'Your Discord User ID', value: user.id, inline: true },
          { name: "Discord Guild ID", value: message.guild.id, inline: true },
          { name: "Store's Price Per Day", value: guildData.pricePerDay, inline: true },
          { name: "Minimum Invoice Amount", value: config.minimumInvoicePrice+"EUR", inline: true },
        );

        await user.send(emailRequestEmbed).then(async function(sentEmbedMessage){
            await sentEmbedMessage.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
            .then((receivedResponses)=>{
                const collectedEmail = receivedResponses.first().content;

                if(!emailValidator.validate(collectedEmail)){
                    throw("invalidEmail");
                }

                const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Thanks for entering your email!')
          
                userEmail = collectedEmail;

                sentEmbedMessage.channel.send(embed);
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
                sentEmbedMessage.channel.send(embed);  
            });
        })

        if (userEmail === undefined) return;

        const subscriptionTimeEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Please enter the amount of days for which you would like to renew your shop on the server.')
        .setDescription('Below you will find the price that the server owner charges per day, and the minimum price of a Sellix invoice.')
        .addFields(
          { name: "Store's Price Per Day", value: guildData.pricePerDay, inline: true },
          { name: 'Minimum Invoice Amount', value: config.minimumInvoicePrice+"EUR", inline: true },
        );
        
        await user.send(subscriptionTimeEmbed).then(async function(sentEmbedMessage){
            await sentEmbedMessage.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
            .then((receivedResponses)=>{
                const receivedNumberOfDays = receivedResponses.first().content;

                if(isNaN(receivedNumberOfDays)){
                    throw 'NaN';
                }
                  
                if(receivedNumberOfDays*guildData.pricePerDay < config.minimumInvoicePrice){
                  throw 'LessThanMinimumInvoicePrice';
                } 
                
                amountOfDays = receivedNumberOfDays;
                
                const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Thanks for entering your email!')
          
                sentEmbedMessage.channel.send(embed);
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
              
              if(err === "LessThanMinimumDays"){
                embed.addField("Error", "The value you entered is less than the minimum days specified by the server owner.")
              }
              
              if(err === "LessThanMinimumInvoicePrice"){
                embed.addField("Error","The value you entered would create an invoice that costs less than the minimum invoice price.")
              }
              
              if(err.size === 0){
                embed.addField("Error", "We did not receive any messages in the specified time window. Please reenter the command and try again.");
              }
              
              console.log(err);
              sentEmbedMessage.channel.send(embed);
              return;
            })
        })
        if (amountOfDays === undefined) return;

        //If you have gotten this far, then all user inputs have been verified.

        

      const successfulInputEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Thanks for your inputs!')
        .setDescription('Using your inputs, the guild ID, and your User ID, we will now make some behind-the-scenes magic to deliver you a Sellix payment invoice.\n\n'+
        'When that invoice is paid, with any of the payment methods you would like, we will automatically renew the channel to which you sent the initial command.\n\n'+
        'We need to clarify that, for simplicity, safety, and ease of use, we are using Sellix.io as our payment processor. That means that, we do not receive any information pertraining to your payment information, including possibly credit card info or PayPal credentials. We only receive information relevant to the invoice that has been paid, not to **how** it has been paid.\n\n'+
        'Below you will find the information we will send to Sellix to make your payment, and the subsequent Store creation. If you want to, you can use them to verify the information you provided.') 
        .addFields(
          { name: 'Your Email', value: userEmail, inline: true },
          { name: 'Amount of Days of Subscription', value: amountOfDays, inline: true },
          { name: 'Channel ID (Your store\'s ID)', value: message.channel.id, inline: true },
          { name: 'Guild ID', value: message.guild.id, inline: true },
          )
          
      user.send(successfulInputEmbed);

      const sellixResponseBody = await webhookSender.createExtensionProductID(message.channel.id, userEmail, message.guild, amountOfDays);

      if(sellixResponseBody === undefined){
        user.send("There has been a problem with your request. Please check your inputs and try again.")
      }
      else{
        const successfulWebhookReceivedEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Press here to be taken to the Sellix invoice page!')
          .setDescription('When we receive your payment, we will renew your shop, with the days of subscription time that you requested.')
          .setURL(sellixResponseBody.data.url);
        
      user.send(successfulWebhookReceivedEmbed);
      }

    }
}