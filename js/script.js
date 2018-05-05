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
 * Switch to selected tab.
 * @param  {Event} evt      Event that triggered this function.
 * @param  {string} tabName Name of tab to open.
 */
function openTab(evt, tabName) {
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
}

/**
 * Make sure everything is in check.
 * @return {bool} True is invariants are held.
 */
function checkInvariants() {
    // Player donuts, ingredients same length as constants
    // Player num unlocked donuts less than max
    return true;
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

/** Refresh the player info section. */
function refreshPlayerInfo() {
    if (player.gameState === GameState.Night) {
        var dayInfo = `Night ${player.day}`;
        var moneyInfo = displayMoney(player.money);
        var message = "Select donuts to make for tomorrow!";
    }
    else {
        var dayInfo = `Day ${player.day}`;
        var moneyInfo = `${displayMoney(player.money)}. Profit: $${displayMoney(player.dayProfit)}.`
        var message = "Serve the customers!";
    }

    $("#dayInfo").html(dayInfo);
    $("#playerMoney").html(moneyInfo);
    $("#message").html(message);
}

/** Refresh donut list depending on current GameState. */
function refreshDonutList() {
    if (player.gameState === GameState.Day) {
        fillDonutSell();
    }
    else {
        fillDonutSelection();
    }
}

/** Populate list of donuts to select from. */
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

/** Populate list of donuts sold. */
function fillDonutSell() {
    var donutSellTemplate = _.template($("#donutSellTemplate").html());

    // Get user's inputs
    player.sellPrices = [];
    player.quantities = [];
    for (var i = 0; i < constants.donuts.length; i++) {
        if (!player.donuts[i]) {
            player.sellPrices.push(constants.donuts[i].cost);
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
    return roundMoney(donut.cost * overallFactor);
}

/** Simulate one day of customers. */
async function simulateDay() {
    // Hide button until day is over
    $("#startButton").hide();
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

        $("#infoFeed").scrollTop($("#infoFeed")[0].scrollHeight);
        await sleep(player.customerDelayTime);
    }

    $("#startButton").show();
}

/** Switch to day view. */
function startDay() {
    // Make sure we can start the day
    var moneyRemaining = parseFloat($("#lowerInfo").find("tr").eq(1).find("td").eq(0).text().split("$")[1]);
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
    $("#lowerInfo").hide();

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
    $("#lowerInfo").show();

    // Update button
    $("#startButton").attr("onclick", "startDay()");
    $("#startButton").text("Start Day");
}

/** Update total cost when user is selecting donut amounts. */
function refreshTotalCost() {
    if (player.gameState !== GameState.Night) {
        return;  // Only refresh at night
    }

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

/** Populate list of ingredients. */
function fillIngredients() {
    var unownedIngredientTemplate = _.template($("#unownedIngredientTemplate").html());
    var ownedIngredientTemplate = _.template($("#ownedIngredientTemplate").html());

    // Populate ingredient menu
    $("#unownedIngredients > tbody").empty();  // Clear old entries
    $("#ownedIngredients > tbody").empty();  // Clear old entries

    for (var i = 0; i < constants.ingredients.length; i++) {
        var ingredient = constants.ingredients[i];
        if (!player.ingredients[i]) {
            var unownedIngredientInfo = unownedIngredientTemplate({
                img: `<img src="img/${ingredient.imagePath}" style="max-height: 100px; max-width: 100px;" />`,
                name: ingredient.name,
                cost: displayMoney(ingredient.cost),
                ingredientId: `ingredient${i}`,
                id: i
            });

            $("#unownedIngredients > tbody").append(unownedIngredientInfo);
            var canAfford = player.money >= ingredient.cost;
            $(`#ingredient${i}`)[0].className = canAfford ? "buttonLit" : "button";
        }
        else {
            var ownedIngredientInfo = ownedIngredientTemplate({
                img: `<img src="img/${ingredient.imagePath}" style="max-height: 100px; max-width: 100px;" />`,
                name: ingredient.name
            });

            $("#ownedIngredients > tbody").append(ownedIngredientInfo);
        }
    }
}

/**
 * Convert an array of items to html list syntax.
 * "<li>array[0]</li>...<li>array[n-1]</li>"
 * @param  {array} array        Items to convert to html list syntax
 * @param  {function} transform Function to map items. Default map to self.
 * @return {string}             Html list syntax
 */
function formatIngredientArrayAsHtml(array) {
    var html = ""
    array.forEach(function(item) {
        var className = player.ingredients[item] ? "ownedIngredient" : "unownedIngredient";
        html += `<li class="${className}">${constants.ingredients[item].name}</li>`;
    });

    return html;
}

/** Populate list of recipes. */
function fillRecipes() {
    var inProgressRecipeTemplate = _.template($("#inProgressRecipeTemplate").html());
    var completedRecipeTemplate = _.template($("#completedRecipeTemplate").html());

    // Populate ingredient menu
    $("#inProgressRecipes > tbody").empty();  // Clear old entries
    $("#completedRecipes > tbody").empty();  // Clear old entries

    for (var i = 0; i < constants.donuts.length; i++) {
        var donut = constants.donuts[i];
        if (!player.donuts[i]) {
            var inProgressRecipeInfo = inProgressRecipeTemplate({
                img: `<img src="img/${donut.imagePath}" style="max-height: 100px; max-width: 100px;" />`,
                flavor: donut.flavor,
                ingredients: formatIngredientArrayAsHtml(donut.ingredients)
            });

            $("#inProgressRecipes > tbody").append(inProgressRecipeInfo);
            //var canAfford = player.money >= ingredient.cost;
            //$(`#ingredient${i}`)[0].className = canAfford ? "buttonLit" : "button";
        }
        else {
            var completedRecipeInfo = completedRecipeTemplate({
                img: `<img src="img/${donut.imagePath}" style="max-height: 100px; max-width: 100px;" />`,
                flavor: donut.flavor
            });

            $("#completedRecipes > tbody").append(completedRecipeInfo);
        }
    }
}

function buyIngredient(ingredientId) {
    if (player.ingredients[ingredientId]) {
        console.error(`Ingredient ${ingredientId} already owned.`);
        return;
    }

    var ingredient = constants.ingredients[ingredientId];
    if (player.money < ingredient.cost) {
        console.error(`Cannot afford ingredient ${ingredientId}.`);
        return;
    }

    player.money -= ingredient.cost;
    player.ingredients[ingredientId] = 1;

    // Update which recipes we have completed
    for (var i = 0; i < constants.donuts.length; i++) {
        if (player.donuts[i]) {
            continue;  // Skip donuts we already own
        }

        if (constants.donuts[i].ingredients.every(ingredient => {
            return player.ingredients[ingredient];
        })) {
            player.donuts[i] = 1;
            player.numUnlocked++;
            alert(`Unlocked donut flavor: ${constants.donuts[i].flavor}`);
        }
    }

    // Update ingredients and recipe list
    fillIngredients();
    fillRecipes();
}

function refreshDonutShop() {
    refreshPlayerInfo();
    refreshDonutList();
    refreshTotalCost();
}

function refreshUpgrades() {
    fillIngredients();
    fillRecipes();
}

/** Runs on startup. */
$(function() {
    console.log("Running start up code.");

    // Initialize player
    init();

    $("#versionNum").html(constants.version);

    // Start at night
    startNight();

    // Open default tab
    $("#defaultOpen").click();

    if (debug.autosave) {
        setInterval(save, constants.saveIntervalInMilliseconds);
    }
    else {
        console.warn("Autosave is turned off for development purposes.");
    }

    if (!checkInvariants()) {
        console.error("Invariant check failed!");
    }

    console.log("Finished start up code.");
});