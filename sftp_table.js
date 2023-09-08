const core = require("@actions/core");
const fs = require("fs");
const { get_document } = require("./lib/google_sheets");
const { get_client, execute } = require("./lib/ssh");
const path = require("path");

let Client = require("ssh2-sftp-client");

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
		let sftp = new Client();

		const host = row.get("host");
		const port = parseInt(row.get("port"));
		const username = row.get("username");
		const password = row.get("password");
		const agent = core.getInput("agent");
		const privateKeyIsFile = core.getInput("privateKeyIsFile");
		const passphrase = core.getInput("passphrase");

		var privateKey = core.getInput("privateKey");

		core.setSecret(password);
		if (passphrase != undefined) {
			core.setSecret(passphrase);
		}

		if (privateKeyIsFile == "true") {
			var privateKey = fs.readFileSync(privateKey);
			core.setSecret(privateKey);
		}

		const localPath = core.getInput("localPath");
		const remotePath = row.get("remoteDir");
		const additionalPaths = core.getInput("additionalPaths");

		sftp
			.connect({
				host: host,
				port: port,
				username: username,
				password: password,
				agent: agent,
				privateKey: privateKey,
				passphrase: passphrase,
			})
			.then(async () => {
				console.log("Connection established.");
				console.log("Current working directory: " + (await sftp.cwd()));
				await processPath(localPath, remotePath); //TODO: Instead of localPath, remotePath use key/value to uplaod multiple files at once.

				const parsedAdditionalPaths = (() => {
					try {
						const parsedAdditionalPaths = JSON.parse(additionalPaths);
						return Object.entries(parsedAdditionalPaths);
					} catch (e) {
						throw "Error parsing addtionalPaths. Make sure it is a valid JSON object (key/ value pairs).";
					}
				})();

				for (const [local, remote] of parsedAdditionalPaths) {
					await processPath(local, remote);
				}
			})
			.then(() => {
				console.log("Upload finished.");
				return sftp.end();
			})
			.catch((err) => {
				core.setFailed(`Action failed with error ${err}`);
				process.exit(1);
			});

		async function processPath(local, remote) {
			console.log("Uploading: " + local + " to " + remote);
			if (fs.lstatSync(local).isDirectory()) {
				return sftp.uploadDir(local, remote);
			} else {
				var directory = await sftp.realPath(path.dirname(remote));
				if (!(await sftp.exists(directory))) {
					await sftp.mkdir(directory, true);
					console.log("Created directories.");
				}

				var modifiedPath = remote;
				if (await sftp.exists(remote)) {
					if ((await sftp.stat(remote)).isDirectory) {
						var modifiedPath = modifiedPath + path.basename(local);
					}
				}

				return sftp.put(fs.createReadStream(local), modifiedPath);
			}
		}

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
