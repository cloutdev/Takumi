const webhookSender = require("../../daemon/webhooks/webhookSender");
const emailValidator = require('email-validator');
const Discord = require("discord.js");
const config = require("../../config.json");
const {QueryTypes} = require('sequelize');
const db = require("../../tools/database");

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
        let sellixResponseBody;
        let userEmail;
        let amountOfDays;
        
        const filter = receivedMsg => user.id === receivedMsg.author.id;

        const guildData = (await db.query("SELECT * FROM settings where guildID = ? LIMIT 1",{
          replacements: [message.guild.id],
          type: QueryTypes.SELECT,
          logging: console.log,
        }))[0];
        
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

        const daysRequestEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Please enter the amount of days for which you would like to renew your shop on the server.')
        .setDescription('Below you will find the price that the server owner charges per day, and the minimum price of a Sellix invoice.')
        .addFields(
          { name: "Store's Price Per Day", value: guildData.pricePerDay, inline: true },
          { name: 'Minimum Invoice Amount', value: config.minimumInvoicePrice+"EUR", inline: true },
        );
        
        await user.send(subscriptionTimeEmbed).then(async function(sentEmbedMessage){
            await subscriptionTimeEmbed.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
            .then((receivedResponses)=>{
                const receivedNumberOfDays = receivedResponses.first().content;

                if(isNaN(receivedNumberOfDays)){
                    throw 'NaN';
                }
                if(receivedNumberOfDays < guildData.minimumDays){
                    throw 'LessThanMinimumDays';
                }
                  
                if(receivedNumberOfDays*guildData.pricePerDay < config.minimumInvoicePrice){
                  throw 'LessThanMinimumInvoicePrice';
                }

                
            })
            .catch((err)=>{

            })
        })

        if(args[0] == "u"){
            sellixResponseBody = await webhookSender.createExtensionProductID((message.channel.id).toString(), args[1], message.guild, args[2]);
        }


    }
}