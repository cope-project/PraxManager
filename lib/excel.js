/**
 * Excel file export module
 * This module will create a excel file form javascript array
 */
var XLSX = require('xlsx')

/**
 * This class is the wrapper for the whole workbook
 */
function Workbook() {
	this.SheetNames = [];
	this.Sheets = {};
}

/**
 * Add a new sheet to the workbook
 */
Workbook.prototype.addSheet = function (sheet) {
	this.SheetNames.push(sheet.sheetName);
	this.Sheets[sheet.sheetName] = sheet;
}

Workbook.prototype.toStream = function () {
	return XLSX.write(this, {type: 'buffer'});
};


/**
 * Sheet object definition
 */
function Sheet() {
	this.sheetName = 'Sheet1';
}


/**
 * Create a new sheet from array
 */
Sheet.fromArray = function (data) {
	var ws = new Sheet();
	var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };

	for (var row = 0; row != data.length; ++row) {
		for (var column = 0; column != data[row].length; ++column) {
			if (range.s.r > row) range.s.r = row;
			if (range.s.c > column) range.s.c = column;
			if (range.e.r < row) range.e.r = row;
			if (range.e.c < column) range.e.c = column;

			var cell_value = data[row][column];
			if (cell_value === null) { continue; }
			var cell_ref = XLSX.utils.encode_cell({ c: column, r: row });
			var cell = new Cell(cell_value);
			ws[cell_ref] = cell;
		}
	}

	if (range.s.c < 10000000) {
		ws['!ref'] = XLSX.utils.encode_range(range)
	};

	return ws;
}

/**
 * Cell definition 
 */
function Cell(value) {
	this.v = value;
	this.t = 's'; // string
	
	switch (typeof value) {
		case 'number':
			this.t = 'n';
			break;
		case 'boolean':
			this.t = 'b';
		case 'object':
			if (value instanceof Date) {
				this.t = 'n';
				this.z = XLSX.SSF._table[14];
				this.v = this.datenum(value)
			}
	}
}

/**
 * Format time
 */
Cell.prototype.datenum = function (v, date1904) {
	if (date1904) v += 1462;
	var epoch = Date.parse(v);
	return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}



// export module
module.exports = {
	'Cell': Cell,
	'Workbook': Workbook,
	'Sheet': Sheet
};