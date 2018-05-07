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
    }
})(console);

/**
 * Logger object.
 * @param {boolean} saveLogs     True to save logs.
 * @param {string} logFilename   Name of log file.
 * @param {function} getMetadata Function that generates log metadata.
 */
function Logger(saveLogs, logFilename, getMetadata=null) {
    this.saveLogs = saveLogs;
    this.logFilename = logFilename;
    this.logs = ["--- Beginning of logs ---"];
    this.metadata = getMetadata !== null ? getMetadata : function() {
        return new Date(Date.now()).toLocaleString();
    };

    if (saveLogs) {
        Logger.prototype.log = text => {
            this.logs.push(`${this.metadata()} Log: ${text}`);
            console.log(text);
        }

        Logger.prototype.info = text => {
            this.logs.push(`${this.metadata()} Info: ${text}`);
            console.info(text);
        }

        Logger.prototype.warn = text => {
            this.logs.push(`${this.metadata()} Warn: ${text}`);
            console.warn(text);
        }

        Logger.prototype.error = text => {
            this.logs.push(`${this.metadata()} Error: ${text}`);
            console.error(text);
        }
    }
    else {
        Logger.prototype.log = text => { console.log(text); }
        Logger.prototype.info = text => { console.info(text); }
        Logger.prototype.warn = text => { console.warn(text); }
        Logger.prototype.error = text => { console.error(text); }
    }
}

/** Download logs (for debugging). */
Logger.prototype.download = function() {
    extraInfo = [
        "--- Additional debug information ---",
        {player: player}];
    console.save(this.logs.concat(extraInfo), this.logFilename);
}