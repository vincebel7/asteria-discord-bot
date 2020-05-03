/**
 * An RPG/fun Discord bot
 * by vincebel
 */

/** 
 * Requirements
 */
var fs = require("fs");
var mysql = require('mysql');

const Discord = require('discord.js');
const client = new Discord.Client();

var mysql_pw = fs.readFileSync('/home/vince/asteria-bot/mysql_pw', 'utf8');
mysql_pw = mysql_pw.slice(0, mysql_pw.length - 1);

var con = mysql.createConnection({
  host: "localhost",
  user: "asteria",
  password: mysql_pw,
  database: "asteria"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("MySQL connection established");
});

/**
 * Definitions
 */
var houses = ["Vyperden", "Falconis", "Ferretot", "Puffinvoc"];

/**
 * Functions
 */

function db_setup(member) {
	//Check if exists
	sql = "SELECT id FROM users WHERE discord_id = ?";
	query = mysql.format(sql,[member.id]);
	con.query(query, function(err, result) {
		if (err) throw err;
		if (result == "") {
			insert_db(member);
		}
		else console.log("Existing member - no DB creation");
	});
}

function insert_db(member) {
	house = "Falconis";

	sql = "INSERT INTO users(discord_id, name, dt, house, balance) VALUES (?, ?, NOW(), ?, 200)";
	query = mysql.format(sql,[member.id, member.displayName, house]);
	con.query(query, function (err, result) {
		if (err) throw err;
		else console.log("User added to database");
	});
}

function assignHouse(member) {
	sql = "SELECT house COUNT(house) FROM users GROUP BY house ORDER BY `value_occurrence` DESC LIMIT 1";
	con.query(sql, function (err, result) {
		if (err) throw err;
		console.log("Query result: " + result);
	});
	
	return "Falconis";
}

function getJoinRank(member, guild) {
	const id = member.id;
	if(!guild.member(id)) return;
	
	var collection = guild.members.cache;
	var joinedTS = 0;

	for (const [sn, gm] of collection.entries()){
		if (id == sn) {
			joinedTS = gm.joinedTimestamp;
		}		
	}

	var rank = 0;
	for (const [sn, gm] of collection.entries()){
		if (joinedTS >= gm.joinedTimestamp) {
			rank = rank + 1;
		}
	}

	return rank;
}

function roll(dividend) {
	min = 1;
	max = dividend;
	return Math.floor(Math.random() * (max - min + 1) + min);
}


/**
 * Listens
 */

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	//client.user.setAvatar('http://vnus.tech/z/avatar.png');
});

client.on('guildMemberAdd', member => {
	console.log("New member joined");

	const channel = member.guild.channels.cache.find(ch => ch.id === '666845975045996545');
	if (!channel) return;

	const emojibun = client.emojis.cache.find(emoji => emoji.name == "BunnyLove");
	channel.send(`${member} joined! WELCOME PRECIOUS ${emojibun}`);

	//let role = member.guild.roles.cache.find(r => r.id === "659586601789292554");
	//member.roles.add(role).catch(console.error);
	
	db_setup(member);
});

client.on('guildMemberRemove', member => {
	console.log("Member left");

	const channel = member.guild.channels.cache.find(ch => ch.id === '666845975045996545');
	if (!channel) return;

	//const emojiskull = client.emojis.cache.find(emoji => emoji.name == "skull");
	leavestring = "**" + member.displayName + "** has left Hazelvale...";
	channel.send(leavestring);
});


client.on('message', msg => {
	// Check if user has data

	if (msg.content.slice(0,2) === 'a/') {
		var message = msg.content.slice(2)
		var message_word = message.split(' ');

		var author = msg.author.id
		console.log(msg.author.username + " issued command " + msg.content)

		/**
 		* GENERAL COMMANDS
 		*/

		if (message == '') {
			msg.channel.send("For help, use a/help")
		}

		else if (message == 'help') {
			var helpmsg = "```ini\nAsteria is Hazelvale's very own RPG bot!\n\nUsage: a/[command]\n\nCommands:";
			helpmsg += "\n[help] = The command you just ran. Gets all commands.";
			helpmsg += "\n[roll] = Rolls a number 1-6. To specify, use a/roll <num> or DND format a/roll 2d20";
			helpmsg += "\n[getrank] = Shows your join rank in Hazelvale.";
			helpmsg += "\n[stats] = View your stats";

			helpmsg += "```";
			msg.channel.send(helpmsg);
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
 		else if (message == "getrank") {
			msg.channel.send("Your join rank: " + getJoinRank(msg.author, msg.guild));
		}

		else if (message_word[0] == "roll") {
				var invalid_arg = true;
				var dividend = message_word[1];
				var default_dividend = 6;
				dividend_int = parseInt(dividend);
	
				//Check if DND format

			if(message_word[1]) {
				if(dividend.includes("d")){
					var index = dividend.indexOf("d");
					var v1 = parseInt(dividend.slice(0, index));
					if(index == 0) { v1 = 1; }
					var v2 = parseInt(dividend.slice(index + 1, dividend.length));

					console.log("|v1=" + v1 + ",v2=" + v2 + "|");

					if(Number.isInteger(v2)) {
					//if((Number.isInteger(v2)) && (Number.isInteger(v1))) {
						for (var i = 0; i < v1; i++) {
							msg.channel.send("[" + v1 + "d" + v2 + "] You rolled " + roll(v2));
						}
						invalid_arg = false;
					}
				}	
				else if(Number.isInteger(dividend_int)) {
					msg.channel.send("[1-" + dividend_int + "] You rolled: **" + roll(dividend_int) + "**");
					invalid_arg = false;
				}
			}

			if(invalid_arg) {
				msg.channel.send("Defaulting to " + default_dividend + "-sided die");
				msg.channel.send("[1-" + default_dividend + "] You rolled: **" + roll(default_dividend) + "**");
			}
		}

		else if (message == "kristal") {
			msg.channel.send("yee haw")	
		}

		else if (message == "woo") {
			msg.channel.send("goodnight")
		}
		

		/**
 		* DEV COMMANDS
 		*/
		else if (message == "gibhouse") {
			assignHouse(msg.author);
		}

		else {
			msg.channel.send("Command not recognized. Try a/help for help");
		}
}});

/**
 * Login
 */

var key = fs.readFileSync('/home/vince/asteria-bot/key', 'utf8');
key = key.slice(0, key.length - 1);
client.login(key).then().catch(console.error);
