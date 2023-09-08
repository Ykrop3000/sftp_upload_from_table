const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

function get_document(table_url) {
	const SCOPES = [
		"https://www.googleapis.com/auth/spreadsheets",
		"https://www.googleapis.com/auth/drive.file",
	];

	console.log(process.env);
	const jwt = new JWT({
		email: process.env.CLIENT_EMAIL,
		key: process.env.PRIVATE_KEY,
		scopes: SCOPES,
	});

	const doc = new GoogleSpreadsheet(table_url, jwt);
	return doc;
}
module.exports = { get_document };

// (async function () {
// 	doc = get_document("1LtVLeCU1n8DRGP8BES-LCRVATV1YrTL0DtIPTa04Xl8");
// 	await doc.loadInfo(); // loads document properties and worksheets
// 	console.log(doc.title);
// 	const sheet = doc.sheetsByIndex[0];
// 	const rows = await sheet.getRows(); // can pass in { limit, offset }
// 	console.log(rows[0].headerValues);
// })();
// await doc.updateProperties({ title: "renamed doc" });

// const sheet = doc.sheetsByIndex[0]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
// console.log(sheet.title);
// console.log(sheet.rowCount);

// // adding / removing sheets
// const newSheet = await doc.addSheet({ title: "another sheet" });
// await newSheet.delete();
