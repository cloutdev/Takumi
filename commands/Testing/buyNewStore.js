//Here the command starts
const webhookSender = require("../../daemon/webhooks/webhookSender");
const emailValidator = require('email-validator');
const Discord = require("discord.js");
const config = require("../../config.json");
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = {
  //definition
  name: "buyStore", //the name of the command 
  category: "fun", //the category this will be listed at, for the help cmd
  aliases: ["buy", "send", "create"], //every parameter can be an alias
  cooldown: 2, //this will set it to a 2 second cooldown
  usage: "buyStore", //this is for the help command for EACH cmd
  description: "Used to purchase a store in the server you are currently in.", //the description of the command
  
  //running the command with the parameters: client, message, args, user, text, prefix
  // eslint-disable-next-line no-unused-vars
  run: async (client, message, args, user, text, prefix) => {
    
    let shoppyResponseBody;
    let userEmail;
    let amountOfDays;
    
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
    
    
    //AwaitMessages for the category in which the user wants to create a new channel.
    
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
    
    const filter = receivedMsg => user.id === receivedMsg.author.id;
    
    if(validCategories.length === 0){
      const errEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Oops! We\'ve ran into a problem!')
      .setDescription('There are no available categories for you to buy a channel in. Please contact a member of the administration!')
      
      user.send(errEmbed);
      return;
    } 
    let categoriesEmbedJSON = [];
    
    for (let i = 0; i < validCategories.length; i++) {
      await client.channels.fetch(validCategories[i].CategoryID)
      .then((fetchedChannel)=>{
        categoriesEmbedJSON.push({ name: `Selection #${i+1}`, value: `**Category name**: ${fetchedChannel.name}\n**Category ID**: ${fetchedChannel.id}\n**Category Price/Day:**${validCategories[i].pricePerDay}\n**Category Pings/Day**:${validCategories[i].BasePingsPerDay}\n**Category Addon Purchases**:${validCategories[i].pingAddonPurchasesAvailable ? "Yes" : "No"}`})
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

    let categoryUserSelection;
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
        
        categoryUserSelection = selection-1;
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
    if (categoryUserSelection === undefined) return;
    const selectedDiscordCategory = await client.channels.fetch(validCategories[categoryUserSelection].CategoryID)
    
    
        ///AwaitMessages for number of rental days. Check for minimum days as per database.
    const daysRequestEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Please enter the amount of days for which you would like to buy a server spot on the server.')
        .setDescription('Below you will find the minimum amount of days you will be able to purchase. This is specified by the owner.')
        .addFields(
          { name: 'Minimum amount of days', value: guildData.minimumDays, inline: true },
          { name: "Store's Price Per Day", value: validCategories[categoryUserSelection].pricePerDay, inline: true },
          { name: 'Minimum Invoice Amount', value: config.minimumInvoicePrice+"EUR", inline: true },
          )
          .addFields(
            { name: 'Your Discord User Tag', value: user.tag, inline: true },
            {name: "Category Name", value: selectedDiscordCategory.name, inline: true},
            { name: "Discord Guild ID", value: message.guild.id, inline: true })  
          ;
          
    await user.send(daysRequestEmbed).then(async function(sentEmbed){
            await sentEmbed.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
            .then((receivedMessages)=>{
              const numberOfDays = receivedMessages.first().content;
              if(isNaN(numberOfDays)){
                throw 'NaN';
              }
              if(numberOfDays < guildData.minimumDays){
                throw 'LessThanMinimumDays';
              }
              
              if(numberOfDays*guildData.pricePerDay < config.minimumInvoicePrice){
                throw 'LessThanMinimumInvoicePrice';
              }
              
              amountOfDays = numberOfDays;
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
              sentEmbed.channel.send(embed);
              
              return;
            });
    });
    if (amountOfDays === undefined) return;
          
          
          
          //If you've gotten this far, you can be sure that the data that has been given by the user is valid.
          const successfulInputEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Thanks for your inputs!')
          .setDescription('Using your inputs, the guild ID, and your User ID, we will now make some behind-the-scenes magic to deliver you a Sellix payment invoice.\n\n'+
          'When that invoice is paid, with any of the payment methods you would like, we will automatically create a channel for you where you will be the owner.\n\n'+
          'We need to clarify that, for simplicity, safety, and ease of use, we are using Sellix.io as our payment processor. That means that, we do not receive any information pertraining to your payment information, including possibly credit card info or PayPal credentials. We only receive information relevant to the invoice that has been paid, not to **how** it has been paid.\n\n'+
          'Below you will find the information we will send to Sellix to make your payment, and the subsequent Store creation.') 
          .addFields(
            { name: 'Your Email', value: userEmail, inline: true },
            { name: 'Amount of Days of Subscription', value: amountOfDays, inline: true },
            { name: 'Master User ID (Your Discord ID)', value: user.id, inline: true },
            { name: 'Guild ID', value: message.guild.id, inline: true },
            { name: 'Category Name', value: selectedDiscordCategory.name, inline: true}
            )
            
            user.send(successfulInputEmbed);
            
            
            shoppyResponseBody = await webhookSender.createCreationProductID(userEmail, message.guild, user, amountOfDays, selectedDiscordCategory);
            if(shoppyResponseBody === undefined){
              user.send("There has been a problem with your request. Please check your inputs and try again.")
            }else{
              const successfulWebhookReceivedEmbed = new Discord.MessageEmbed()
              .setColor('#0099ff')
              .setTitle('Press here to be taken to the Shoppy invoice page!')
              .setDescription('When we receive your payment, we will create your new shop, with the days of subscription time that you requested.')
              .setURL(shoppyResponseBody.data.url);
              
              user.send(successfulWebhookReceivedEmbed);
            }
            
            if(shoppyResponseBody === undefined){
              message.reply("There has been a problem with your request. Please check your inputs and try again.")
            }else{
              message.reply(`when you press on the following link, you will be redirected to a Sellix payment webpage, that when paid, will grant you an additional ${args[1]} day(s) of channel subscription time **for the channel that you are currently in.** \n ${shoppyResponseBody.data.url}`);
            }
            
          }
        }