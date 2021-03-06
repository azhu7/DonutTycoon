/**
 * Author: Alexander Zhu
 * Date Created: May 3, 2018
 * Description: Main game logic for Donut Tycoon.
 */

var player = {};
var logger = new Logger(debug.saveLogs, debug.infoFilename);

function createNewPlayer() {
    logger.info("createNewPlayer(): Creating new player.");
    player = new Player();
    if (debug.askPlayerName) {
        var name = prompt("Hello! What is your name?", "");
        player.name = `${name}'s Donut Shop`;
        logger.info(`createNewPlayer(): Player name is ${player.name}.`);
    }
    else {
        logger.warn("createNewPlayer(): Player name is turned off for development purposes.");
    }
}

/** Initialize player. */
function initPlayer() {
    if (debug.loadSaved) {
        if (localStorage.getItem(constants.savedPlayer)) {
            logger.info("init(): Found saved file.");
            load();
        }
        else {
            logger.info("init(): Did not find saved file.");
            createNewPlayer();
        }
    }
    else {
        logger.warn("init(): Loading is turned off for development purposes.");
        createNewPlayer();
    }
}

/** Synchronize constants.upgrades levels with player's levels. */
function syncUpgradeLevels() {
    for (var i = 0; i < constants.upgrades.length; i++) {
        constants.upgrades[i].current = player.upgradeLevels[i];
    }
}

/** Easter egg. */
function egg() {
    if (typeof this.clicks === 'undefined') {
        this.clicks = 0;
    }

    this.clicks++;
    if (this.clicks === 3) {
        if (player.name !== constants.eggName) {
            player.name = constants.eggName;
            $("#header").text(player.name);
            fillLeaderboard();  // Name changed
        }

        this.clicks = 0;
    }
}

/**
 * Switch to selected tab.
 * @param  {Event} evt      Event that triggered this function.
 * @param  {string} tabName Name of tab to open.
 */
function openTab(evt, tabName) {
    logger.info(`openTab(): Opening ${tabName} tab.`);
    var tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = $(".tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = $(".tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    $(`#${tabName}`)[0].style.display = "flex";
    evt.target.className += " active";
    logger.info(`openTab(): Opened ${tabName} tab.`);
}

/**
 * Make sure everything is in check.
 * @return {bool} True is invariants are held.
 */
function checkInvariants() {
    logger.info("checkInvariants(): Not implemented.");
    return true;

    logger.info("checkInvariants(): Checking invariants.");
    // Player donuts, ingredients same length as constants
    // Player num unlocked donuts less than max
    logger.info("checkInvariants(): All invariants held.");
    return true;
}

/** Download logs and player info. */
function downloadLogs() {
    extraInfo = [
        "--- Additional debug information ---",
        {player: player}];
    logger.download(extraInfo);
}

/** Initialize the application. */
function initApplication() {
    // Initialize player
    initPlayer();
    syncUpgradeLevels();

    $("#header").html(player.name);
    $("#versionNum").html(constants.version);

    // Start at night
    startNight();

    // Open default tab
    $("#defaultOpen").click();

    if (!checkInvariants()) {
        return;
    }

    if (debug.autosave) {
        logger.info(`initApplication(): Autosave every ${constants.saveInterval} milliseconds.`);
        player.saveIntervalId = setInterval(save, constants.saveInterval);
    }
    else {
        logger.warn("initApplication(): Autosave is turned off for development purposes.");
    }
}

/** Runs on startup. */
$(function() {
    logger.info("main(): Running start up code.");
    initApplication();
    logger.info("main(): Finished start up code.");
});