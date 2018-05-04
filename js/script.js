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

/** Easter egg. */
function egg() {
    if (typeof egg.clicks === 'undefined') {
        egg.clicks = 0;
    }

    egg.clicks++;
    if (egg.clicks == 3) {
        $("#header").text("Alex and Benicia's Donut Shop");
    }
    else if (egg.clicks == 6) {
        $("#header").text("Donut Tycoon");
        egg.clicks = 0;
    }
}

/**
 * Round amount to the hundredth place.
 * @param  {number} amount Amount to round.
 * @return {number}        Rounded amount
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

/** Set player info based on current gameState (Day/Night). */
function flipPlayerInfo() {
    if (player.gameState === GameState.Day) {
        // Switching to night
        player.gameState = GameState.Night;
        var dayInfo = `Night ${player.day}`;
        var moneyInfo = displayMoney(player.money);
        var message = "Select donuts to make for tomorrow!";
    }
    else {
        // Switching to day
        player.gameState = GameState.Day;
        var dayInfo = `Day ${player.day}`;
        var moneyInfo = `${displayMoney(player.money)}. Profit: $${displayMoney(player.dayProfit)}.`
        var message = "Serve the customers!";
    }

    $("#dayInfo").html(dayInfo);
    $("#playerMoney").html(moneyInfo);
    $("#message").html(message);
}

/** Switch to donut selection view. */
function fillDonutSelection() {
    var donutInfoTemplate = _.template($("#donutInfoTemplate").html());

    // Populate donut menu
    $("#donutSelection > tbody").empty();  // Clear old entries
    for (var i = 0; i < constants.donuts.length; i++) {
        if (!player.donuts[i]) {
            continue;
        }

        var donut = constants.donuts[i];
        var donutInfo = donutInfoTemplate({
            img: `<img src="img/${donut.imagePath}" style="max-height: 100px; max-width: 100px;" />`,
            flavor: donut.flavor,
            cost: displayMoney(donut.cost),
            quantityId: `quantity${i}`,
            sellForId: `sellFor${i}`
        });

        $("#donutSelection > tbody").append(donutInfo);
    }

    // Fill with user's previous prices for subsequent days
    if (player.day > 1) {
        for (var i = 0; i < constants.donuts.length; i++) {
            if (!player.donuts[i]) {
                continue;
            }

            $(`#quantity${i}`).val(player.selectedQuantities[i]);
            $(`#sellFor${i}`).val(player.sellPrices[i]);
        }
    }
}

/** Switch to donut sell view. */
function fillDonutSell() {
    var donutSellTemplate = _.template($("#donutSellTemplate").html());

    // Get user's inputs
    player.sellPrices = [];
    player.quantities = [];
    for (var i = 0; i < constants.donuts.length; i++) {
        if (!player.donuts[i]) {
            player.sellPrices.push(0);
            player.quantities.push(0);
        }
        else {
            player.sellPrices.push(parseFloat($(`#sellFor${i}`).val()));
            player.quantities.push(parseInt($(`#quantity${i}`).val()));
        }
    }

    $.extend(true, player.selectedQuantities, player.quantities);

    // Populate donut menu
    $("#donutSelection > tbody").empty();  // Clear old entries
    for (var i = 0; i < constants.donuts.length; i++) {
        if (!player.donuts[i]) {
            continue;
        }

        var donut = constants.donuts[i];
        var donutInfo = donutSellTemplate({
            img: `<img src="img/${donut.imagePath}" style="max-height: 100px; max-width: 100px;" />`,
            flavor: donut.flavor,
            cost: displayMoney(player.sellPrices[i]),
            quantityId: `quantity${i}`,
            quantity: player.quantities[i]
        });

        $("#donutSelection > tbody").append(donutInfo);
    }
}

/**
 * Sleep for the specified time.
 * @param  {number} ms Time to sleep in milliseconds.
 * @return {Promise}   Sleep operation.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Select donut for customer, biased towards those in stock.
 * @return {number} Donut ID
 */
function selectDonut() {
    function roll() {
        return Math.floor(Math.random() * Math.min(player.donuts.length, player.numUnlocked + 2));
    }

    // Select ID from the first {numUnlocked + 2} donuts
    var donutId = roll();
    var rerolls = player.customerReconsider;
    while (!player.quantities[donutId] && rerolls) {
        donutId = roll();
        rerolls--;
    }

    return donutId;
}

/**
 * Randomly generate amount customer is willing to pay for the specified donut.
 * Amount is influenced by many upgradeable factors.
 * @param  {number} donutId Selected donut.
 * @return {number}         Customer's money per donut.
 */
function genCustomerMoneyPerDonut(donutId) {
    // Generate a number in the range: [Base, Base + Range)
    var customerMoneyFactor = player.customerMoneyBase + Math.random() * player.customerMoneyRange;
    var donut = constants.donuts[donutId];
    var overallFactor = customerMoneyFactor * player.customerGenerosity * donut.rarity;
    console.log(overallFactor);
    return roundMoney(donut.cost * overallFactor);
}

/** Simulate one day of customers. */
async function simulateDay() {
    // Hide button until day is over
    $("#startButton").attr("hidden", true);
    var numCustomers = Math.ceil(player.shopLocation * player.popularity);

    for (var i = 0; i < numCustomers; ++i) {
        var name = constants.names[Math.floor(Math.random() * constants.names.length)];
        var donutId = selectDonut();
        var donutName = constants.donuts[donutId].flavor;
        var customerMoneyPerDonut = genCustomerMoneyPerDonut(donutId);
        var numToBuy = 1;
        $("#feedContent").append(`${name} wants to buy ${numToBuy} ${donutName} Donut(s) for $${displayMoney(customerMoneyPerDonut)} each.<br/>`);
        var numBought = customerBuy(donutId, numToBuy, customerMoneyPerDonut);
        if (numBought) {
            var totalSpent = numBought * player.sellPrices[donutId];
            $("#feedContent").append(`${name} bought ${numBought} ${donutName} Donut(s) for $${displayMoney(totalSpent)}.<br/>`);
        }
        else {
            $("#feedContent").append(`${name} did not buy any donuts.<br/>`);
        }

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

    player.dayProfit = moneyRemaining - player.money;  // Negative profits
    player.money = moneyRemaining;
    flipPlayerInfo();
    fillDonutSell();

    // Update button. Hide until day is over.
    $("#startButton").attr("onclick", "startNight()");
    $("#startButton").text("End Day");

    // Hide lower info
    $("#lowerInfo").attr("hidden", true);

    // Show stream
    $("#feedContent").empty();
    $("#infoFeed").css({"display": "inline-block"});
    simulateDay();
}

/** Switch to night view. */
function startNight() {
    player.day += 1;
    player.money += player.support;

    flipPlayerInfo();
    fillDonutSelection();
    refreshTotalCost();

    // Turn off the stream
    $("#infoFeed").css({"display": "none"});

    // Show lower info
    $("#lowerInfo").attr("hidden", false);

    // Update button
    $("#startButton").attr("onclick", "startDay()");
    $("#startButton").text("Start Day");
}

/** Update total cost when user is selecting donut amounts. */
function refreshTotalCost() {
    var totalCost = 0;
    for (var i = 0; i < constants.donuts.length; ++i) {
        if (!player.donuts[i]) {
            continue;
        }

        var quantity = parseInt($(`#quantity${i}`).val());
        if (isNaN(quantity)) {
            continue;
        }
        
        totalCost += constants.donuts[i].cost * quantity;
    }

    var costText = `Total cost: $${displayMoney(totalCost)}`;
    var moneyRemainingText = `Money remaining: $${displayMoney(player.money - totalCost)}`;
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

/**
 * Handle customer purchases. Assume customer can afford.
 * @param  {number} donutId               Donut customer wants to buy.
 * @param  {number} numToBuy              Number of donuts to buy.
 * @param  {number} customerMoneyPerDonut Amount customer will pay per donut.
 * @return {number}                       Number of donuts bought.
 */
function customerBuy(donutId, numToBuy, customerMoneyPerDonut) {
    if (!player.quantities[donutId]) {
        return 0;  // Donut out of stock
    }

    var donutPrice = player.sellPrices[donutId];
    if (customerMoneyPerDonut < donutPrice) {
        return 0;
    }

    // Complete purchase
    numToBuy = Math.min(player.quantities[donutId], numToBuy)
    player.money += numToBuy * donutPrice;
    player.dayProfit += numToBuy * donutPrice;
    player.quantities[donutId] -= numToBuy;
    $(`#quantity${donutId}`).html(`Quantity: ${player.quantities[donutId]}`);
    $("#playerMoney").html(`${displayMoney(player.money)}. Profit: $${displayMoney(player.dayProfit)}.`);
    return numToBuy;
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