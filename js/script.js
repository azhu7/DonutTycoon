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
            img: `<img src="img/${donut.imagePath}" style="max-height: 100px; max-width: 100px;" />`,
            name: donut.name,
            cost: donut.cost,
            quantityId: `quantity${player.donuts[i]}`,
            sellForId: `sellFor${player.donuts[i]}`
        });

        $("#donutSelection > tbody").append(donutInfo);
    }
}

/** Switch to day view. */
function startDay() {
    var moneyRemaining = parseInt($("#moneyRemaining").text().split("$")[1]);
    alert(`Starting day with $${moneyRemaining} remaining.`)
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

function refreshTotalCost() {
    var totalCost = 0;
    for (var i = 0; i < player.donuts.length; ++i) {
        var quantity = parseInt($(`#quantity${player.donuts[i]}`).val());
        if (isNaN(quantity)) {
            continue;
        }
        
        totalCost += constants.donuts[player.donuts[i]].cost * quantity;
    }

    $("#totalCost").html(`Total cost: $${totalCost}`);
    $("#moneyRemaining").html(`Money remaining: $${player.money - totalCost}`);
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

/** Runs on startup. */
$(function() {
    console.log("Running start up code.");

    // Initialize player
    init();

    $("#versionNum").html(constants.version);

    startNight();

    if (debug.autosave) {
        setInterval(save, constants.saveIntervalInMilliseconds);
    }
    else {
        console.warn("Autosave is turned off for development purposes.");
    }

    console.log("Finished start up code.");
});