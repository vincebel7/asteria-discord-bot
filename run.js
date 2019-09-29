/**
 * An RPG/fun Discord bot
 * by vincebel
 */

/** 
 * Requirements
 */
var fs = require("fs");
const Discord = require('discord.js');
const client = new Discord.Client();
//console.log(client)

/**
 * Funtions
 */

function createWallet(u) {
	var obj = [];
	obj.push({balance: "100"})
	var json = JSON.stringify(obj, null, 4);
	json = json.substring(1,json.length-1);
	var filename = "users/" + u + ".json";
	var fs = require('fs');

	fs.writeFileSync(filename, json);
	console.log("Wallet has been created for user ", u);
}

function getBalance(u) {
	if(!fs.existsSync("users/" + u + ".json")) {
		createWallet(u);
	}

	var content = fs.readFileSync("users/" + u + ".json")
	var jsonContent = JSON.parse(content);
	return jsonContent.balance;
}

/**
 * Listens
 */

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
	if (msg.content.slice(0,2) === 'a/') {
		var message = msg.content.slice(2)
		var author = msg.author.id
		//msg.reply(`I am Asteria. Your message is ${message}`);

		/**
 		* GENERAL COMMANDS
 		*/

		if (message == '') {
			msg.channel.send("For help, use a/help")
		}

		if (message == 'help') {
			msg.channel.send("```ini\nAsteria is a general-purpose bot.\n\nUsage: a/[command]\n\nCommands:\n[help] = The command you just ran. Gets all commands.\n[bal] = Gets your current balance.```")
		}

		/**
 		* ECONOMY COMMANDS
 		*/ 

		if (message == 'bal') {
			var bal = getBalance(author);
			msg.channel.send(msg.author.username + "'s balance: $" + bal)
		}


		/**
 		* FUN COMMANDS
 		*/
 
		if (message == "levi") {
			msg.channel.send("Levi is a big pee pee doo doo head")
		}
}});

/**
 * Login
 */

var key = fs.readFileSync('../key', 'utf8');
key = key.slice(0, key.length - 1);
client.login(key).then().catch(console.error);
