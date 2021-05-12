const Discord = require('discord.js')
const prisma = require('../../tools/prisma')
const moment = require('moment')

const webhookSender = require('../../daemon/webhooks/webhookSender')

//Here the command starts
module.exports = {
    //definition
    name: "info", //the name of the command 
    category: "fun", //the category this will be listed at, for the help cmd
    aliases: ["info"], //every parameter can be an alias
    cooldown: 2, //this will set it to a 2 second cooldown
    usage: "say <Text>", //this is for the help command for EACH cmd
    description: "Resends the message", //the description of the command

    //running the command with the parameters: client, message, args, user, text, prefix
    // eslint-disable-next-line no-unused-vars
    run: async (client, message, args, user, text, prefix) => {

      console.log(client.user)

        const channelData = await prisma.channels.findFirst({
            where:  {
                channelID: message.channel.id
            }
        })

        if(channelData===undefined){
            const channelNotFoundEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Oops! We have stumbled upon an error!')
            .setDescription('We were unable to fetch your shop\'s data. Are you sure you are using this in a shop channel?')

            message.channel.send(channelNotFoundEmbed);
            return;
        }
        const categoryData = await prisma.categories.findFirst({
            where:{
                CategoryID: message.channel.parentID
            }
        })

        let actionsJSON = [];

        actionsJSON.push({ name: 'To Renew your Store Time', value: 'Press on the ⏲ Reaction', inline: true })

        if(categoryData.pingAddonPurchasesAvailable){
            actionsJSON.push({ name: 'To Purchase one more Ping', value: 'Press on the <:pingReaction:842005597527605248> Reaction', inline: true })
        }

        actionsJSON.push({ name: 'To purchase a new store', value: 'Press on the 🏬 Reaction', inline: true })


        function getPingAddonPrice(){
            if(!categoryData.pingAddonPurchasesAvailable){
                return "Ping Addon Purchases Not Available"
            }
            
            return categoryData.pingAddonPrice;
        }

        const countMembers = message.guild.members.cache.filter(m => message.channel.permissionsFor(m).has('VIEW_CHANNEL')).size
        const mainMenuEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(client.user.username, client.user.displayAvatarURL(), 'https://github.com/cloutdev/MarketplaceBot')
        .setTitle('Channel Information and Actions')
        .addFields(
            { name: 'Shop Name', value: message.channel.name, inline: true },
            { name: 'Category Name', value: message.channel.parent.name, inline: true },
            { name: 'Server Name', value: message.guild.name, inline: true },
        )
        .addFields(
            { name: 'Shop Expiry On', value: (channelData.expiresOn).toLocaleString('en-GB',{ timeZone: 'UTC' })+"\n"+moment(channelData.expiresOn).fromNow(), inline: true },
            { name: 'Shop Opened On', value: (channelData.startsOn).toLocaleString('en-GB',{ timeZone: 'UTC' })+"\n"+moment(channelData.createdOn).fromNow(), inline: true },
            { name: 'Pings per Day', value: channelData.tagsPerDay+" Pings", inline: true}
        )
        .addFields(
            { name: 'Ping Addon Price', value: getPingAddonPrice().toFixed(2), inline: true },
            { name: 'Shop\'s Price per Day', value: categoryData.pricePerDay.toFixed(2), inline: true },
            { name: 'Member reach', value: countMembers+" members", inline: true } ,
        )
        .addField('\u200B', '\u200B')
        .addField('Channel Actions', '\u200B')  
        .addFields(actionsJSON)
        
        const sentInfoMessage = await message.channel.send(mainMenuEmbed);

        await sentInfoMessage.react('⏲');
        await sentInfoMessage.react('<:pingReaction:842005597527605248>');
        await sentInfoMessage.react('🏬');

        const filter = (reaction, reactionUserSender) => {

            if(((reaction.emoji.name === '⏲') || (reaction.emoji.name === 'pingReaction') || (reaction.emoji.name === '🏬')) && (reactionUserSender.id === message.author.id)){
                return true;
            }else return false;
        };

        sentInfoMessage.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
            .then(async (collected) => {
                const emoteReceived = collected.first().emoji.name;

                sentInfoMessage.reactions.resolve(collected.first()).users.remove(user.id)
                switch (emoteReceived) {
                    case '⏲': {
                      const checkDMsEmbed = new Discord.MessageEmbed()
                      .setColor('#0099ff')
                      .setTitle('Please Check your DMs!')
                      .setDescription('We have sent you a message directly and you will proceed with your request there.')
                      .setFooter(`Clout's Marketplace Bot, requested by ${user.tag}`)
                      .setTimestamp()
                      message.reply(checkDMsEmbed);

                      const shoppyResponseBody = await webhookSender.createExtensionProductID(message.channel.id, message.guild)

                      if(shoppyResponseBody === undefined){
                        user.send("There has been a problem with your request. Please check your inputs and try again.")
                      }else{
                        const successfulWebhookReceivedEmbed = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('Press here to be taken to the Shoppy invoice page!')
                        .setDescription('When we receive your payment, we will renew your shop, with the days of subscription time that you requested.')
                        .setURL(shoppyResponseBody);
                        
                        user.send(successfulWebhookReceivedEmbed);
                      }
                       break;
                    }
                    case 'pingReaction': {
                      const checkDMsEmbed = new Discord.MessageEmbed()
                      .setColor('#0099ff')
                      .setTitle('Please Check your DMs!')
                      .setFooter(`Clout's Marketplace Bot, requested by ${user.tag}`)
                      .setDescription('We have sent you a message directly and you will proceed with your request there.')
                      .setTimestamp()
                      message.reply(checkDMsEmbed);
                      const shoppyResponseBody = await webhookSender.createPingAddonInvoice(message.channel, message.channel.parent)
                      if(shoppyResponseBody === undefined){
                        user.send("There has been a problem with your request. Please check your inputs and try again.")
                      }else{
                        const successfulWebhookReceivedEmbed = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('Press here to be taken to the Shoppy invoice page!')
                        .setDescription('When we receive your payment, we will add one ping for you to use per day on your shop.')
                        .setURL(shoppyResponseBody);
                        
                        user.send(successfulWebhookReceivedEmbed);
                      }
                      break;
                    }
                    case '🏬': {
                      const checkDMsEmbed = new Discord.MessageEmbed()
                      .setColor('#0099ff')
                      .setTitle('Please Check your DMs!')
                      .setFooter(`Clout's Marketplace Bot, requested by ${user.tag}`)
                      .setDescription('We have sent you a message directly and you will proceed with your request there.')
                      .setTimestamp()
                      message.reply(checkDMsEmbed);

                      await buyNewStore(client, message, args, user);
                      break;
                    }
                }

            })
            .catch((err) => {
                console.log(err);
                sentInfoMessage.reactions.removeAll();
            });

    }
}

async function buyNewStore(client, message, args, user){

      
      let shoppyResponseBody;
     
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

            //If you've gotten this far, you can be sure that the data that has been given by the user is valid.
            const successfulInputEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Thanks for your inputs!')
            .setDescription('Using your inputs, the guild ID, and your User ID, we will now make some behind-the-scenes magic to deliver you a Sellix payment invoice.\n\n'+
            'When that invoice is paid, with any of the payment methods you would like, we will automatically create a channel for you where you will be the owner.\n\n'+
            'We need to clarify that, for simplicity, safety, and ease of use, we are using Sellix.io as our payment processor. That means that, we do not receive any information pertraining to your payment information, including possibly credit card info or PayPal credentials. We only receive information relevant to the invoice that has been paid, not to **how** it has been paid.\n\n'+
            'Below you will find the information we will send to Sellix to make your payment, and the subsequent Store creation.') 
            .addFields(
            { name: 'Master User ID (Your Discord ID)', value: user.id, inline: true },
            { name: 'Guild ID', value: message.guild.id, inline: true },
            { name: 'Category Name', value: selectedDiscordCategory.name, inline: true}
            )
             
            user.send(successfulInputEmbed);
              
              
              shoppyResponseBody = await webhookSender.createCreationProductID(message.guild, user, selectedDiscordCategory);
              if(shoppyResponseBody === undefined){
                user.send("There has been a problem with your request. Please check your inputs and try again.")
              }else{
                const successfulWebhookReceivedEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Press here to be taken to the Shoppy invoice page!')
                .setDescription('When we receive your payment, we will create your new shop, with the days of subscription time that you requested.')
                .setURL(shoppyResponseBody);
                
                user.send(successfulWebhookReceivedEmbed);
              }
              
            
          }