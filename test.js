const { execute } = require("./lib/ssh");

execute(
	"45.137.65.27",
	"root",
	"RHFv8H2UEdnN",
	`cd /LBID/test/ ; sudo python3 /LBID/test/configurator.py -id 'DIGITAL_HOME_PP5ast' -table 'https://docs.google.com/spreadsheets/d/1LtVLeCU1n8DRGP8BES-LCRVATV1YrTL0DtIPTa04Xl8' -sheet 'Kaspi merchants settings'`
);
