//Here the command starts
const webhookSender = require("../../daemon/webhooks/webhookSender");

module.exports = {
    //definition
    name: "send", //the name of the command 
    category: "fun", //the category this will be listed at, for the help cmd
    aliases: ["say", "sayit"], //every parameter can be an alias
    cooldown: 2, //this will set it to a 2 second cooldown
    usage: "say <Text>", //this is for the help command for EACH cmd
    description: "Resends the message", //the description of the command

    //running the command with the parameters: client, message, args, user, text, prefix
    // eslint-disable-next-line no-unused-vars
    run: async (client, message, args, user, text, prefix) => {
		const sellixResponseBody = await webhookSender.createExtensionProductID((message.channel.id).toString(), args[0], message.guild, args[1]);

    if(sellixResponseBody === undefined){
      message.reply("There has been a problem with your request. Please check your inputs and try again.")
    }else{



      message.reply(`when you press on the following link, you will be redirected to a Sellix payment webpage, that when paid, will grant you an additional ${args[1]} day(s) of channel subscription time **for the channel that you are currently in.** \n ${sellixResponseBody.data.url}`);
    }
		
    }
}