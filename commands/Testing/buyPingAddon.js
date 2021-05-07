//Here the command starts
module.exports = {
    //definition
    name: "buyPing", //the name of the command 
    category: "fun", //the category this will be listed at, for the help cmd
    aliases: ["addon", "buyPings"], //every parameter can be an alias
    cooldown: 2, //this will set it to a 2 second cooldown
    usage: "buyPing", //this is for the help command for EACH cmd
    description: "Resends the message", //the description of the command

    //running the command with the parameters: client, message, args, user, text, prefix
    // eslint-disable-next-line no-unused-vars
    run: async (client, message, args, user, text, prefix) => {
        
    }
}