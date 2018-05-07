/** Custom replacer that helps stringify Sets */
function setToJSON(key, value) {
	if (typeof value === 'object' && value instanceof Set) {
		return [...value];
	}
	
	return value;
}