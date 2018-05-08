/**
 * Author: Alexander Zhu
 * Date Created: May 6, 2018
 * Description: Logger object for Donut Tycoon.
 */

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

/**
 * Download logs (for debugging).
 * @param  {string[]} extraInfo Array of extra information to download.
 */
Logger.prototype.download = function(extraInfo) {
    console.save(this.logs.concat(extraInfo), this.logFilename);
}