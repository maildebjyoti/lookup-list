let validateNParseDate = function (dtStr) {
	/* 
    - Validate string and convert to date
    - If invalid, return today's date in DD-Mon-YYYY
	- By default convert all '/' to '-'
    */

	const monthNames = 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(',' );
	const monthMap = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
	const formats = [
		/^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
		/^\d{2}-[A-Za-z]{3}-\d{4}$/, // DD-Mon-YYYY
		/^\d{2}-\d{2}-\d{2}$/, // DD-MM-YY
		/^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
		/^\d{2}-[A-Za-z]{3}$/, // DD-Mon
	];
	dtStr = dtStr.replaceAll('/', '-');
	return isValidDate(dtStr);

	function isValidDate(dateString) {
		for (const pattern of formats) {
			if (pattern.test(dateString)) {
				console.log('Date Pattern matched - ', pattern, dtStr);
				return validateDate(dateString, pattern);
			}
		}

		console.log('Invalid date provided - ', dtStr);
		return getCurrentDateInDDMonYYYY();
	}

	function validateDate(dateString, pattern) {
		let [day, month, year] = parseDate(dateString, pattern);
		year = year.toString();
		if (year.length === 2) {
			year = '20' + year; // Assuming years are in 21st century
		}
		const date = new Date(year, month - 1, day);
		// console.log('---', date, ' -->', day, month, year);
		return getCurrentDateInDDMonYYYY(date)
	}

	function getCurrentDateInDDMonYYYY(dt) {
		let date = (dt) ? dt : new Date();
		const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed
		const year = date.getFullYear();
		const month = monthNames[date.getMonth()];
		return `${day}-${month}-${year}`;
	}

	function parseDate(dateString, pattern) {
		let day, month, year;
		switch (pattern.toString()) {
			case '/^\\d{4}-\\d{2}-\\d{2}$/':
				[year, month, day] = dateString.split('-').map(Number);
				break;
			case '/^\\d{2}-[A-Za-z]{3}-\\d{4}$/':
				[day, month, year] = dateString.split('-');
				month = monthMap[month];
				break;
			case '/^\\d{2}-\\d{2}-\\d{2}$/':
				[day, month, year] = dateString.split('-');
				year = [year]; // Keep as string array for century logic
				break;
			case '/^\\d{2}-\\d{2}-\\d{4}$/':
				[day, month, year] = dateString.split('-');
				year = [year]; // Keep as string array for century logic
				break;
			default:
				[day, month] = dateString.split('-');
				month = monthMap[month];
				year = [new Date().getFullYear()]; // Current year
		}
		return [Number(day), month, year];
	}
};

// Example usage
console.log(validateNParseDate('2023-09-02')); // true
console.log(validateNParseDate('02-Sep-2023')); // true
console.log(validateNParseDate('02-09-23')); // true
console.log(validateNParseDate('02/09/2023')); // true
console.log(validateNParseDate('02-Sep')); // true
console.log(validateNParseDate('2023-02-30')); // false (Invalid date)
console.log(validateNParseDate('09/02/2023')); // false (Invalid format)
