const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const config = require("../../config.json");
const e = require("express");

//Here the command starts
module.exports = {
    //definition
        name: "help", //the name of the command 
        category: "info", //the category this will be listed at, for the help cmd
        aliases: ["h", "commandinfo"], //every parameter can be an alias or empty for no aliases
        cooldown: 5, //this will set it to a 5 second cooldown
        usage: "help [Command]", //this is for the help command for EACH cmd
        description: "Returns all Commmands, or one specific command", //the description of the command

        //running the command with the parameters: client, message, args, user, text, prefix
    run: async (client, message, args, user, text, prefix) => {
        if(args[0]){ //if there are arguments then get the command help
            return getCMD(client,message,args[0]);
        }
        else{ //if not get all commands
            const ExplanationEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle("Hello! I'm <insert bot name here>")
            .setDescription('Welcome to **<insert bot name here>**!\n\n'+
            "I am a Discord bot designed to create a marketplace within your own Discord server!\n\n"+
            "You can think of it as a shopping mall right inside your Discord server!\n\n"+
            "I will have to first explain some things to you, to get you familiarized with the idea.\n\n"+
            "In its core, this Discord bot creates channels. Those channels are called shops. A shop can be used to advertise a service, a product, an event, or whatever a shop owner might imagine.\n\n"+
            "A member in a server with me in it can purchase a shop. By purchasing a shop, you are able to send messages in it. It is your own shop, you can rename it, manage it, delete or send messages, etc.\n\n"+
            "You buy a shop in a subscription-like manner. That means that you buy access to a channel for a set number of days, for which you pay beforehand. You can of course renew that shop whenever you want, if it is open. If it is not open, you can reopen an old channel or just purchase a new one.\n\n"+
            "A shop owner can specify members to have as a mod team. They can be used to manage the sent messages, send their own, and help in managing the shop. Think of them as employees of a shop in a shopping mall.\n\n"+
            "This bot also offers a limit in pings a shop can make each day. That means that the server owner specifies the amount of pings a shop can send per day, and shop owners also have the right to purchase more pings per day, if the server owner allows shop owners to. \n\n"+
            "A server owner can also create different shop categories. That means that people are able to buy shops in different categories, like different locations and floors in a big shopping mall. That means that shops in different categories will have different amounts of exposure, but they can also be used for better organization of the shops within the server.\n\n"+
            "These are my current features. This will be getting updated as new features are implemented.\n\n"
            /*"***Terms of Service***\n\n"+
            "- We, the creator(s) of this Discord bot, do not support, endorse, agree with, or partake in, the sale of any product through a channel created with our discord bot. We are merely providing the infrastructure for creating an online shop on the Discord messaging platform.\n\n"+
            "- We are prohibiting, and we are also dedicated to prohibiting, the use of our Discord bot by illegal entities, or for the promotion of any illegal services or products.\n\n"+
            "- TLDR; Don't be an idiot, please be legal."*/
            )
        
            message.reply(ExplanationEmbed);

            const TOSEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Terms of Service')
                .setDescription('- We, the creator(s) of this Discord bot, do not support, endorse, agree with, or partake in, the sale of any product through a channel created with our discord bot. We are merely providing the infrastructure for creating an online shop on the Discord messaging platform.\n\n'+
                "- We are prohibiting, and we are also dedicated to prohibiting, the use of our Discord bot by illegal entities, or for the promotion of any illegal services or products.\n\n"+
                "- TLDR; Don't be an idiot, please be legal.\n\n")
            
            message.reply(TOSEmbed);

            return getAll(client, message);
        }
    }
}

//function for getting all commands
function getAll(client,message){



const embed = new MessageEmbed() //defining the Embed
    .setColor("ORANGE")
    .setThumbnail(client.user.displayAvatarURL())
    .setTitle("HELP MENU")
    .setFooter(`TO see command descriptions and inforamtion, type: ${config.prefix}help [CMD NAME]`, client.user.displayAvatarURL())
    const commands = (category) => { //finding all commands and listing them into a string with filter and map
        return client.commands.filter(cmd => cmd.category === category)
                .map(cmd => `\`${cmd.name}\``).join(", ")
    }
    //get the command infostring
    const info = client.categories.map(cat => stripIndents`**__${cat[0].toUpperCase() + cat.slice(1)}__**\n> ${commands(cat)}`)
    .reduce((string, category) => string + "\n" + category);
    //sending the embed with the description
    return message.channel.send(embed.setDescription(info))
}

//function for all commands
function getCMD(client,message,input){
    const embed = new MessageEmbed() //creating a new Embed
    const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase())) //getting the command by name/alias
    if(!cmd){ //if no cmd found return info no infos!
        return message.channel.send(embed.setColor("RED").setDescription(`No Information found for command **${input.toLowerCase()}**`));
    }
    if(cmd.name) embed.addField("**Command name**", `\`${cmd.name}\``)
    if(cmd.description) embed.addField("**Description**", `\`${cmd.description}\``);

    if(cmd.aliases) embed.addField("**Aliases**", `\`${cmd.aliases.map(a => `${a}`).join("\`, \`")}\``)
    if(cmd.cooldown) embed.addField("**Cooldown**", `\`${cmd.cooldown} Seconds\``)
        else embed.addField("**Cooldown**", `\`1 Second\``)
    if(cmd.usage){
        embed.addField("**Usage**", `\`${config.prefix}${cmd.usage}\``);
        embed.setFooter("Syntax: <> = required, [] = optional"); 
    }
    //send the new Embed
    return message.channel.send(embed.setColor("ORANGE"))
}
