/**
 * Author: Alexander Zhu
 * Date Created: May 3, 2018
 * Description: Main game logic for Donut Tycoon.
 */

var player = {};
var debug = new Debug();

/** Initialize player. */
function init() {
    if (debug.loadSaved) {
        if (localStorage.getItem(constants.savedPlayer)) {
            console.log("Found saved file. Loading.");
            load();
        }
        else {
            player = new Player();
        }
    }
    else {
        console.warn("Loading is turned off for development purposes.");
        player = new Player();
    }
}

function fillDonutSelection() {
    var donutInfoTemplate = _.template($("#donutInfoTemplate").html());


    for (var i = 0; i < player.donuts.length; i++) {
        var donut = constants.donuts[player.donuts[i]];
        var donutInfo = donutInfoTemplate({
            img: `<img src="img/` + donut.imagePath + `" style="max-height: 100px; max-width: 100px;" />`,
            name: donut.name,
            cost: donut.cost,
            quantityId: "quantity"+player.donuts[i],
            sellForId: "sellFor"+player.donuts[i]
        });

        $("#donutSelection > tbody").append(donutInfo);
    }
}

/** Switch to day view. */
function startDay() {

}

/** Switch to night view. */
function startNight() {
    var nightInfoTemplate = _.template($("#nightInfoTemplate").html());
    var donutInfoTemplate = _.template($("#donutInfoTemplate").html());

    var nightInfo = nightInfoTemplate({
        day: player.day,
        money: player.money
    });

    fillDonutSelection();

    $("#night").html(nightInfo);
    refreshTotalCost()
}

/** Refresh values in day view. */
function refreshDay() {

}

/** Refresh values in night view. */
function refreshNight() {
    
}

function refreshTotalCost() {
    console.log("refreshed!");
    var totalCost = 0;
    for (var i = 0; i < player.donuts.length; ++i) {
        var num = $("#quantity" + player.donuts[i]).val();
        if (num === "") {
            continue;
        }
        
        quantity = parseInt(num);
        totalCost += constants.donuts[player.donuts[i]].cost * quantity;
    }

    $("#totalCost").html("Total cost: $" + totalCost);
    var fontColor = 'green';
    var buttonClass = 'buttonLit';
    if (totalCost > player.money) {
        fontColor = 'red';
        buttonClass = 'button';
    }

    $("#totalCost").css({'color': fontColor});
    var button = $("#startDayButton");
    $("#startDayButton")[0].className = buttonClass;
}

function refreshAll() {
    if (player.gameState == GameState.Day) {
        refreshDay();
    }
    else if (player.gameState == GameState.Night) {
        refreshNight();
    }
}

/** Game update function. */
var refresh = function() {
    if (typeof refresh.before == 'undefined') {
        refresh.before = new Date();
    }

    var now = new Date();
    var elapsedTime = now.getTime() - refresh.before.getTime();
    refreshAll();
    refresh.before = new Date();
    setTimeout(refresh, 1000);
};

/** Runs on startup. */
$(function() {
    console.log("Running start up code.");

    // Initialize player
    init();

    $("#versionNum").html(constants.version);

    startNight();
    //refresh();

    if (debug.autosave) {
        setInterval(save, constants.saveIntervalInMilliseconds);
    }
    else {
        console.warn("Autosave is turned off for development purposes.");
    }

    console.log("Finished start up code.");
});