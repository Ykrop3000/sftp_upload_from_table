const core = require("@actions/core");
const fs = require("fs");
const { Deployer } = require("./lib/deployer");
const { get_document } = require("./lib/google_sheets");
const { get_client, execute } = require("./lib/ssh");

const options = {
	dryRun: JSON.parse(core.getInput("dryRun")), // Enable dry-run mode. Default to false.
	exclude: core.getInput("exclude").split(","), // exclude patterns (glob) like .gitignore.
	forceUpload: JSON.parse(core.getInput("forceUpload")), // Force uploading all files, Default to false(upload only newer files).
	removeExtraFilesOnServer: JSON.parse(
		core.getInput("removeExtraFilesOnServer")
	), // Remove extra files on server, default to false.
};

(async function () {
	const doc = get_document(
		core.getInput("sheetUrl"),
		core.getInput("email"),
		core.getInput("key")
	);
	await doc.loadInfo();
	const sheet = doc.sheetsByIndex[0];
	const rows = await sheet.getRows();
	rows.forEach((row) => {
		const config = {
			host: row.get("host"), // Required.
			port: row.get("port"), // Optional, Default to 22.
			username: row.get("username"), // Required.
			password: row.get("password"), // Optional.
			privateKey: "", // Optional.
			passphrase: "", // Optional.
			algorithms: {}, // Optional. Default to false.
			agent: "", // Optional, path to the ssh-agent socket.
			localDir: core.getInput("localDir"), // Required, Absolute or relative to cwd.
			remoteDir: row.get("remoteDir"), // Required, Absolute path only.
		};

		new Deployer(config, options)
			.sync()
			.then(() => console.log("sftp upload success!"));

		const sshClient = get_client(
			row.get("host"),
			row.get("username"),
			row.get("password")
		);
		execute(
			sshClient,
			`python3 ${row.get("remoteDir")}/configurator.py -id ${row.get(
				"id"
			)} -table ${core.getInput("sheetUrl")} -sheet ${core.getInput(
				"sheetName"
			)}`
		);
	});
})();
