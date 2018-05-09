/**
 * Author: Alexander Zhu
 * Date Created: May 7, 2018
 * Description: Utility functions for Donut Tycoon.
 */

/** Enable console to download logs. */
(function(console) {
    /**
     * Download the data as a json file.
     * @param  {object} data     Object to serialize and download.
     * @param  {string} filename Name of downloaded file.
     */
    console.save = function(data, filename) {
        if (!data) {
            console.error('Console.save: No data');
            return;
        }

        if (!filename) filename = 'console.json';

        if (typeof data === "object"){
            data = JSON.stringify(data, setToJSON, 4);
        }

        var blob = new Blob([data], {type: 'text/json'});
        var e = document.createEvent('MouseEvents');
        var a = document.createElement('a');

        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':');
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    };
})(console);

/** Custom replacer that helps stringify Sets */
function setToJSON(key, value) {
	if (typeof value === 'object' && value instanceof Set) {
		return [...value];
	}
	
	return value;
}

/**
 * Round amount to the hundredth place.
 * @param  {number} amount Amount to round.
 * @return {number}        Rounded amount.
 */
function roundMoney(amount) {
    return Math.round(100 * amount) / 100;
}

/**
 * Format money for displaying.
 * @param  {number} amount Amount to display.
 * @return {string}        Formatted amount.
 */
function displayMoney(amount) {
    return parseFloat(roundMoney(amount)).toFixed(2);
}