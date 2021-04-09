/* eslint-disable no-unreachable */
const discord = require('discord.js');
const db = require("../../tools/database.js");
const {QueryTypes} = require('sequelize');
//Here the command starts
module.exports = {
    //definition
    name: "setup", //the name of the command 
    category: "setup", //the category this will be listed at, for the help cmd
    aliases: ["s"], //every parameter can be an alias
    cooldown: 2, //this will set it to a 2 second cooldown
    usage: "say <Text>", //this is for the help command for EACH cmd
    description: "Resends the message", //the description of the command

    //running the command with the parameters: client, message, args, user, text, prefix
    // eslint-disable-next-line no-unused-vars
    run: async (client, message, args, user, text, prefix) => {

      const openCategoryID = (await message.guild.channels.create("Open Shops",{
        type: 'category',
        permissionOverwrites: [
          {
            id: message.guild.id,
            deny: ["SEND_MESSAGES", "MENTION_EVERYONE"],
            allow: ["ADD_REACTIONS"]
          }
        ]
      })
      ).id;

      const closedCategoryID = (await message.guild.channels.create("Closed Shops",{
        type: 'category',
        permissionOverwrites: [
          {
            id: message.guild.id,
            deny: ["VIEW_CHANNEL"]
          }
        ]
      })
      ).id;


      
      return;
      // TODO: Fix this fucking shit what is this

      const count = await db.query("SELECT * from settings where guildID = ?",{
        replacements: [message.guild.id],
        type: QueryTypes.SELECT,
        logging: console.log,
      });

      if(count.length != 0) return;

      const filter = (user) => (user.author.id === message.author.id);

      let settings = [];

      const firstEmbed = new discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle("Clout's Marketplace Bot Setup")
      .setURL('https://clout.stocky.cc')
      .setAuthor('Welcome!')
      .setDescription("Please enter the name of the channel that you would like the bot to make **public** announcements")
      .setTimestamp()
      .setFooter(`Clout's Marketplace Bot, requested by ${user.tag}`);

      await message.channel.send(firstEmbed).then(()=>{
        message.channel.awaitMessages(filter, {
          max: 1,
          time: 15000,
        }).then(
          (collected) => {
            console.log(collected.first().content);
            settings.push(collected.first().content);
            console.log(settings);
            message.channel.send("Thanks for your answer!");


            const secondEmbed = new discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle("Clout's Marketplace Bot Setup")
            .setURL('https://clout.stocky.cc')
            .setAuthor('Step 2')
            .setDescription("Please enter the Channel ID of the channel that you would like the bot to send confidential messages to. This should only have permissions for the owners/moderators of the server.")
            .setTimestamp()
            .setFooter(`Clout's Marketplace Bot, requested by ${user.tag}`);
      
            message.channel.send(secondEmbed).then(()=>{
              message.channel.awaitMessages(filter, {
                max: 1,
                time: 15000,
              }).then(
                (collected) => {
                  console.log(collected.first().content);
                  settings.push(collected.first().content);
                  console.log(settings);
                  message.channel.send("Thanks for your answer!");
                  const thirdEmbed = new discord.MessageEmbed()
                  .setColor('#0099ff')
                  .setTitle("Clout's Marketplace Bot Setup")
                  .setURL('https://clout.stocky.cc')
                  .setAuthor('Step 2')
                  .setDescription("Please enter the display name of the bot.")
                  .setTimestamp()
                  .setFooter(`Clout's Marketplace Bot, requested by ${user.tag}`);
            
                  message.channel.send(thirdEmbed).then(()=>{
                    message.channel.awaitMessages(filter, {
                      max: 1,
                      time: 15000,
                    }).then(
                      (collected) => {
                        console.log(collected.first().content);
                        settings.push(collected.first().content);
                        console.log(settings);
                        message.channel.send("Thanks for your answer!");
                        const fourthEmbed = new discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle("Clout's Marketplace Bot Setup")
                        .setURL('https://clout.stocky.cc')
                        .setAuthor('Step 2')
                        .setDescription("Please enter the display name of the bot.")
                        .setTimestamp()
                        .setFooter(`Clout's Marketplace Bot, requested by ${user.tag}`);
                  
                      message.channel.send(fourthEmbed).then(()=>{
                          message.channel.awaitMessages(filter, {
                            max: 1,
                            time: 15000,
                          }).then(
                            (collected) => {
                              console.log(collected.first().content);
                              settings.push(collected.first().content);
                              console.log(settings);
                              message.channel.send("Thanks for your answer!");
                            }
                          ).catch(()=>{message.channel.send("No message was received. Please try again."); return;})        
                      });
                      }
                    ).catch(()=>{message.channel.send("No message was received. Please try again."); return;})
                  });
                }
              ).catch(()=>{message.channel.send("No message was received. Please try again."); return;})
            });
          }
        ).catch(()=>{message.channel.send("No message was received. Please try again."); return;})
      });

      settings.push(message.guild.id);
      await db.query('INSERT INTO settings (publicBotChannel, privateBotChannel, botName, botImg, guildID) values (?, ?, ?, ?, ?)',{
				replacements: [settings],
				type: QueryTypes.INSERT,
				logging: console.log,
			})
    }
}