const connect = require("ssh2-connect");
const exec = require("ssh2-exec");

function execute(host, username, password, command) {
	console.log(command);
	connect(
		{ host: host, username: username, password: password },
		function (err, ssh) {
			exec(
				{ command: command, ssh: ssh },
				function (err, stdout, stderr, code) {
					console.info(stdout);
					console.info(err);
				}
			);
		}
	);
}

module.exports = { execute };
