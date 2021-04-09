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
    run: async (client, message, args, user, text, prefix) => {
		const res = await webhookSender.createProductID(message.channel.id, "adonisdounis1@mail.com");
		message.reply(res);
    }
}