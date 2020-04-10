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

var mysql_pw = fs.readFileSync('../mysql_pw', 'utf8');
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


/**
 * Listens
 */

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', member => {
	console.log("New member joined: " + member);

	//const channel = client.channels.find("id", "659579641199067146");
	//if (!channel) return;
	//channel.send(`Welcome to the server, ${member}`);

	//member.addRole(role);
	
	db_setup(member);
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
		else if (message == "kristal") {
			msg.channel.send("yee haw")	
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

var key = fs.readFileSync('../key', 'utf8');
key = key.slice(0, key.length - 1);
client.login(key).then().catch(console.error);
