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

function flipPlayerInfo() {
    var playerInfoTemplate = _.template($("#playerInfoTemplate").html());
    if (player.gameState === GameState.Day) {
        // Switching to night
        player.gameState = GameState.Night;
        var prefix = "Night";
        var message = "Select donuts to make for tomorrow!";
    }
    else {
        // Switching to day
        player.gameState = GameState.Day;
        var prefix = "Day";
        var message = "Serve the customers!";
    }

    var playerInfo = playerInfoTemplate({
        day: `${prefix} ${player.day}`,
        money: player.money,
        message: message
    });
    $("#playerInfo").html(playerInfo);
}

/** Switch to donut selectioin view. */
function fillDonutSelection() {
    var donutInfoTemplate = _.template($("#donutInfoTemplate").html());

    $("#donutSelection > tbody").empty();  // Clear old entries
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

    // Fill with user's previous prices for subsequent days
    if (player.day > 1) {
        for (var i = 0; i < player.donuts.length; i++) {
            $(`#sellFor${player.donuts[i]}`).val(player.sellPrices[i]);
        }
    }
}

/** Switch to donut sell view. */
function fillDonutSell() {
    var donutSellTemplate = _.template($("#donutSellTemplate").html());

    // Get user's inputs
    player.sellPrices = [];
    player.quantities = [];
    for (var i = 0; i < player.donuts.length; i++) {
        player.sellPrices.push(parseInt($(`#sellFor${player.donuts[i]}`).val()));
        player.quantities.push(parseInt($(`#quantity${player.donuts[i]}`).val()));
    }

    $("#donutSelection > tbody").empty();  // Clear old entries
    for (var i = 0; i < player.donuts.length; i++) {
        var donut = constants.donuts[player.donuts[i]];
        
        var donutInfo = donutSellTemplate({
            img: `<img src="img/${donut.imagePath}" style="max-height: 100px; max-width: 100px;" />`,
            name: donut.name,
            cost: player.sellPrices[i],
            quantity: player.quantities[i]
        });

        $("#donutSelection > tbody").append(donutInfo);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** Simulate one day of customers. */
async function simulateDay() {
    // Hide button until day is over
    $("#startButton").attr("hidden", true);

    for (var i = 0; i < player.shopLocation; ++i) {
        var name = constants.names[Math.floor(Math.random() * constants.names.length)];
        $("#feedContent").append(`${i}${name} wants to buy 2 Chocolate Donut(s) for $3 each.<br/>`);
        $("#feedContent").append(`${name} bought 1 Chocolate Donut for $3.<br/>`);
        $("#feedContent").scrollTop($("#feedContent")[0].scrollHeight);
        await sleep(1000);
    }

    $("#startButton").attr("hidden", false);
}

/** Switch to day view. */
function startDay() {
    // Make sure we can start the day
    var moneyRemaining = parseInt($("#lowerInfo").find("tr").eq(1).find("td").eq(0).text().split("$")[1]);
    if (isNaN(moneyRemaining)) {
        console.error("Money remaining is NaN.");
        return;
    }
    else if (moneyRemaining < 0) {
        console.log("Not enough money.")
        return;
    }

    player.money = moneyRemaining;
    flipPlayerInfo();
    fillDonutSell();

    // Update button. Hide until day is over.
    $("#startButton").attr("onclick", "startNight()");
    $("#startButton").text("End Day");

    // Turn on the stream
    $("#feedContent").empty();
    $("#infoFeed").css({"display": "inline-block"});
    simulateDay();
}

/** Switch to night view. */
function startNight() {
    player.day += 1;

    flipPlayerInfo();
    fillDonutSelection();
    refreshTotalCost();

    // Turn off the stream
    $("#infoFeed").css({"display": "none"});

    // Update button
    $("#startButton").attr("onclick", "startDay()");
    $("#startButton").text("Start Day");
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

    var costText = `Total cost: $${totalCost}`;
    var moneyRemainingText = `Money remaining: $${player.money - totalCost}`;
    $("#lowerInfo > tbody").empty();
    $("#lowerInfo > tbody").append(`<tr><td>${costText}</td></tr><tr><td>${moneyRemainingText}</td></tr>`);
    var fontColor = "green";
    var buttonClass = "buttonLit";
    if (totalCost > player.money) {
        fontColor = "red";
        buttonClass = "button";
    }

    // Update lower info color and button type
    $("#lowerInfo").find("tr").eq(0).find("td").eq(0).css({"color": fontColor})
    var button = $("#startButton");
    $("#startButton")[0].className = buttonClass;
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