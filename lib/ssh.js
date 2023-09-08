const Client = require("ssh2").Client;

function get_client(host, username, password) {
	// Create a new SSH client instance
	const sshClient = new Client();

	// Configure the connection parameters
	const connectionParams = {
		host: host,
		username: username,
		password: password,
	};

	// Connect to the SSH server
	sshClient.connect(connectionParams);
	return sshClient;
}

function execute(sshClient, command) {
	// Prompt the user to enter a command
	sshClient.exec(command, (err, stream) => {
		if (err) throw err;

		stream
			.on("close", (code, signal) => {
				console.log("Command execution closed");
				sshClient.end();
				rl.close();
			})
			.on("data", (data) => {
				console.log("Command output:", data.toString());
			})
			.stderr.on("data", (data) => {
				console.error("Command error:", data.toString());
			});
	});
}

module.exports = { get_client, execute };
