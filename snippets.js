function isValidDate(dateString) {
	// Regular expressions for different date formats
	const formats = [
		/^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
		/^\d{2}-[A-Za-z]{3}-\d{4}$/, // DD-Mon-YYYY
		/^\d{2}-\d{2}-\d{2}$/, // DD-MM-YY
		/^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
		/^\d{2}-[A-Za-z]{3}$/, // DD-Mon
	];

	// Check against each format
	for (const pattern of formats) {
		if (pattern.test(dateString)) {
			return validateDate(dateString, pattern);
		}
	}

	return false; // Invalid format
}

function validateDate(dateString, pattern) {
	const [day, month, year] = parseDate(dateString, pattern);

	// Adjust year if necessary
	if (year.length === 2) {
		year[0] = '20' + year[0]; // Assuming years are in 21st century
	}

	// Create a date object
	const date = new Date(year[0], month - 1, day);

	// Check if the date is valid
	return (
		date.getFullYear() == year[0] &&
		date.getMonth() == month - 1 &&
		date.getDate() == day
	);
}

function parseDate(dateString, pattern) {
	// Month mapping for textual month formats
	const monthMap = {
		Jan: 1,
		Feb: 2,
		Mar: 3,
		Apr: 4,
		May: 5,
		Jun: 6,
		Jul: 7,
		Aug: 8,
		Sep: 9,
		Oct: 10,
		Nov: 11,
		Dec: 12,
	};

	let day, month, year;

	if (pattern.test(/^\d{4}-\d{2}-\d{2}$/)) {
		[year, month, day] = dateString.split('-').map(Number);
	} else if (pattern.test(/^\d{2}-[A-Za-z]{3}-\d{4}$/)) {
		[day, month, year] = dateString.split('-');
		month = monthMap[month];
	} else if (pattern.test(/^\d{2}-\d{2}-\d{2}$/)) {
		[day, month, year] = dateString.split('-');
		year = [year]; // Keep as string array for century logic
	} else if (pattern.test(/^\d{2}\/\d{2}\/\d{4}$/)) {
		[day, month, year] = dateString.split('/').map(Number);
	} else if (pattern.test(/^\d{2}-[A-Za-z]{3}$/)) {
		[day, month] = dateString.split('-');
		month = monthMap[month];
		year = [new Date().getFullYear()]; // Current year
	}

	return [Number(day), month, year];
}

// Example usage
console.log(isValidDate('2023-09-02')); // true
console.log(isValidDate('02-Sep-2023')); // true
console.log(isValidDate('02-09-23')); // true
console.log(isValidDate('02/09/2023')); // true
console.log(isValidDate('02-Sep')); // true
console.log(isValidDate('2023-02-30')); // false (Invalid date)
console.log(isValidDate('09/02/2023')); // false (Invalid format)
