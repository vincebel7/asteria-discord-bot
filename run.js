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
	var json = JSON.stringify(obj, null, 2);
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

function setBalance(u, change) {
	var old_balance = getBalance(u);
	var new_balance = parseInt(old_balance) + parseInt(change);
	var fs = require('fs');
	var filename = './users/' + u + ".json";
	var file = require(filename);

	file.balance = new_balance;

	var json = JSON.stringify(file, null, 2)
	fs.writeFileSync(filename, json);
}

function balanceLeaderboard(channel) {
	var balanceMap = {};

	fs.readdir("./users/", function(err, filenames) {
		if (err) {
			onError(err);
			return;
		}
		filenames.forEach(function(filename) {
			var uid = filename.substring(0, filename.length - 5);
			fs.readFile("./users/" + filename, "utf-8", function(err, content) {
				if (err) {
					onError(err);
					return;
				}
				balanceMap[uid] = balanceMap[uid] || [];
				balanceMap[uid].push(getBalance(uid));
				console.log(balanceMap);
			});
		});
		console.log(balanceMap);
		for (var key in balanceMap) {
			console.log(balanceMap[key]);
			channel.send(key);
		}
	});
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
		var message_word = message.split(' ');

		var author = msg.author.id
		getBalance(author); //makes sure user has JSON file
		console.log(msg.author.username + " issued command " + msg.content)

		/**
 		* GENERAL COMMANDS
 		*/

		if (message == '') {
			msg.channel.send("For help, use a/help")
		}

		else if (message == 'help') {
			var helpmsg = "```ini\nAsteria is a general-purpose bot.\n\nUsage: a/[command]\n\nCommands:";
			helpmsg += "\n[help] = The command you just ran. Gets all commands.";
			helpmsg += "\n[bal] = Gets your current balance";
			helpmsg += "\n[pay @user amount] = Pay a user";
			helpmsg += "\n[coinflip amount side] = Bet on a coin flip";
			helpmsg += "\n[stats] = View your stats";

			helpmsg += "```";
			msg.channel.send(helpmsg);
		}

		/**
 		* ECONOMY COMMANDS
 		*/ 

		else if (message == 'bal') {
			var bal = getBalance(author);
			msg.channel.send(msg.author.username + "'s balance: $" + bal)
		}

		else if (message == 'baltop') {
			balanceLeaderboard(msg.channel);		
		}

		else if (message_word[0] == 'pay') {
			var amount = message_word[2];
			amount = parseInt(amount);
			if (!Number.isInteger(amount)){
				msg.channel.send("Specify how much to pay.");
			}
			else {
				if (amount <= 0){
					msg.channel.send("Amount must be greater than 0.");
				}
				else {
					var recipient = msg.mentions.users.first();
	
					//check if enough
					if (getBalance(author) < amount){
						msg.channel.send("You don't have that kind of cash! You only have $" + getBalance(author) + ".");
					}
					else {
						msg.channel.send("Pay " + recipient + " $" + amount);
						setBalance(author, (0 - amount)); //sender
						setBalance(recipient.id, amount); //recipient
					}
				}
				
			}
		}

		else if (message_word[0] == 'coinflip') {
			var amount = message_word[2];
			amount = parseInt(amount);
			if (!Number.isInteger(amount)){
				msg.channel.send("How much do you want to bet? Please specify.")
			}
			else {
				if (amount <= 0) {
					msg.channel.send("Amount must be greater than 0.")
				}
				else {
					if (getBalance(author) < amount){
						msg.channel.send("You don't have that kind of cash! You only have $" + getBalance(author) + ".");
					}
					else {
						var side = message_word[1];
						var result;
						if ((side != "heads") && (side != "tails")) {
							msg.channel.send("Please pick either heads or tails.")
						}
						else {
							if (Math.random() < 0.5) {
								result = "heads";
							}
							else {
								result = "tails";
							}
	
							if (result == side) {
								msg.channel.send("It's " + result + "! You won $" + amount);
								setBalance(author, amount);
							}
							else {
								msg.channel.send("Uh oh, it landed on " + result + " and you lost.");
								setBalance(author, (0 - amount));
							}
						}
					}
				}
			}

		}


		/**
 		* RPG COMMANDS
 		*/

		else if (message_word[0] == 'stats') {
			if(message_word.length == 1) {
				msg.channel.send("```\n" + msg.author.username + "'s stats:\nSpeed:\t\t2\nIntelligence:\t3\nStrength:\t\t1\nCharisma:\t\t6\nAttractiveness:\t0\nHacking:\t\t11\n```")
			}

			var skill = message_word[1];
			
		}	 

		/**
 		* FUN COMMANDS
 		*/
 
		else if (message == "kristal") {
			msg.channel.send("yee haw")	
		}

		else {
			msg.channel.send("Command not recognized. Try a/help for help");
		}
}});

/**
 * Login
 */

var key = fs.readFileSync('../key', 'utf8');
key = key.slice(0, key.length - 1);
client.login(key).then().catch(console.error);
