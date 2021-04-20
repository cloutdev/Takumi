const toolkit = require("../../tools/toolkit");
//Here the command starts
module.exports = {
    //definition
    name: "test", //the name of the command 
    category: "fun", //the category this will be listed at, for the help cmd
    aliases: ["t"], //every parameter can be an alias
    cooldown: 2, //this will set it to a 2 second cooldown
    usage: "say <Text>", //this is for the help command for EACH cmd
    description: "Resends the message", //the description of the command

    //running the command with the parameters: client, message, args, user, text, prefix '581575466578870302', '675476898926559239'
    // eslint-disable-next-line no-unused-vars
    run: async (client, message, args, user, text, prefix) => {
		toolkit.createChannel(client, message.guild.id, user.id, user.id);
    }
}