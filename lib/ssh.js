const connect = require("ssh2-connect");
const exec = require("ssh2-exec");

function execute(host, username, password, command) {
	connect(
		{ host: host, username: username, password: password },
		function (err, ssh) {
			exec(
				{ command: command, ssh: ssh },
				function (err, stdout, stderr, code) {
					console.info(stdout);
				}
			);
		}
	);
}

module.exports = { execute };
