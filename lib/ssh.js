const exec = require("ssh-exec");

function execute(host, username, password, command) {
	exec(command, {
		user: username,
		host: host,
		password: password,
	}).pipe(process.stdout, function (err, data) {
		if (err) {
			console.log(v_host);
			console.log(err);
		}
		console.log(data);
	});
}

module.exports = { execute };
