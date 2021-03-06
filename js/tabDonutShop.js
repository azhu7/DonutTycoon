/**
 * Author: Alexander Zhu
 * Date Created: May 8, 2018
 * Description: Donut Shop tab logic for Donut Tycoon.
 */

/** Format night player info. */
function setNightPlayerInfo() {
	logger.info("setNightPlayerInfo(): Setting night player info.");
    $("#dayInfo").html(`Night ${player.day}`);
    $("#playerMoney").html(displayMoney(player.money));
    $("#message").html("Select donuts to make for tomorrow!");
}

/** Format day player info. */
function setDayPlayerInfo() {
	logger.info("setDayPlayerInfo(): Setting day player info.");
    $("#dayInfo").html(`Day ${player.day}`);
    $("#playerMoney").html(`${displayMoney(player.money)}<br/>Profit: $${displayMoney(player.dayProfit)}`);
    $("#message").html("Serve the customers!");
}

/** Refresh the player info section depending on current GameState. */
function refreshPlayerInfo() {
    if (player.gameState === GameState.Night) {
        setNightPlayerInfo();
    }
    else {
        setDayPlayerInfo();
    }
}

/** Refresh donut list depending on current GameState. */
function refreshDonutList() {
    if (player.gameState === GameState.Day) {
        fillDonutSell();
    }
    else {
        fillDonutCreation();
    }
}

/** Populate list of donuts to select from. */
function fillDonutCreation() {
	logger.info("fillDonutCreation(): Filling donut creation list.");
    var donutCreateTemplate = _.template($("#donutCreateTemplate").html());

    // Populate donut menu
    $("#donutSelection > tbody").empty();  // Clear old entries
    for (var i = 0; i < constants.donuts.length; i++) {
        if (!player.donuts[i]) {
            continue;
        }

        var donut = constants.donuts[i];
        var donutInfo = donutCreateTemplate({
            img: `<img src="img/${donut.imagePath}" style="max-height: ${constants.imgSize}px; max-width: ${constants.imgSize}px;" />`,
            flavor: donut.flavor,
            cost: displayMoney(donut.cost),
            createId: `create${i}`,
            sellForId: `sellFor${i}`,
            id: i
        });

        $("#donutSelection > tbody").append(donutInfo);
    }

    if (!player.unlockedDonuts.size) {
        $("#donutSelection > tbody").append("No donuts. Head to the Upgrades tab to buy some ingredients!");
    }

    // Fill with user's previous prices
    for (var i = 0; i < constants.donuts.length; i++) {
        if (!player.donuts[i]) {
            continue;
        }

        $(`#create${i}`).val(player.selectedQuantities[i]);
        $(`#sellFor${i}`).val(player.sellPrices[i]);
    }

    $("#donutSelling").hide();
    $("#donutSelection").show();
    logger.info("fillDonutCreation(): Filled donut creation list.");
}

function updateQuantity(id) {
	player.selectedQuantities[id] = parseInt($(`#create${id}`).val());
	logger.info(`updateQuantity(): donut ${id} quantity is now ${player.selectedQuantities[id]}.`);
}

function updateSellPrice(id) {
	player.sellPrices[id] = parseFloat($(`#sellFor${id}`).val()).toFixed(2);
	logger.info(`updateSellPrice(): donut ${id} price is now $${player.sellPrices[id]}.`);
}

/** Update total cost when user is selecting donut amounts. */
function refreshTotalCost() {
    if (player.gameState !== GameState.Night) {
        return;  // Only refresh at night
    }

    var totalCost = 0;
    for (var i = 0; i < player.unlockedDonuts.size; ++i) {
        var quantity = parseInt($(`#create${i}`).val());
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
    	// Can't start if can't afford
        fontColor = "red";
        buttonClass = "button";
    }
    else if (!totalCost) {
    	// Can't start without any donuts
    	buttonClass = "button";
    }

    // Update lower info color and button type
    $("#lowerInfo").find("tr").eq(0).find("td").eq(0).css({"color": fontColor});
    $("#startButton")[0].className = buttonClass;
}

/** Populate list of donuts sold. */
function fillDonutSell() {
	logger.info("fillDonutSell(): Filling donut sell list.");
    var donutSellTemplate = _.template($("#donutSellTemplate").html());

    // Populate donut menu
    $("#donutSelling > tbody").empty();  // Clear old entries
    for (var i = 0; i < constants.donuts.length; i++) {
        if (!player.donuts[i]) {
            continue;
        }

        var donut = constants.donuts[i];
        var donutInfo = donutSellTemplate({
            img: `<img src="img/${donut.imagePath}" style="max-height: ${constants.imgSize}px; max-width: ${constants.imgSize}px;" />`,
            flavor: donut.flavor,
            cost: displayMoney(player.sellPrices[i]),
            sellId: `sell${i}`,
            quantity: player.remainingQuantities[i]
        });

        $("#donutSelling > tbody").append(donutInfo);
    }

    $("#donutSelection").hide();
    $("#donutSelling").show();
    logger.info("fillDonutSell(): Filled donut sell list.");
}

/** Populate advisor information. */
function fillAdvisor() {
	logger.info("fillDonutAdvisor(): Filling donut advisor.");
    if (player.gameState !== GameState.Night) {
        return;  // Only fill at night
    }

    var advisorTemplate = _.template($("#advisorTemplate").html());

    $("#advisorContent > tbody").empty();
    $.each(constants.advisor, function(k, v) {
        var advisorInfo = advisorTemplate({
            "description": k,
            "amount": v(player)
        });

        $("#advisorContent > tbody").append(advisorInfo);
    });

    logger.info("fillDonutAdvisor(): Filled donut advisor.");
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
 * @return {number} Donut ID.
 */
function selectDonut() {
    function roll() {
        return Math.floor(Math.random() * player.donuts.length);
    }

    // Select ID
    var donutId = roll();
    var rerolls = player.customerReconsider;
    while (!player.remainingQuantities[donutId] && rerolls) {
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
    //logger.info(`donutId: ${donutId}...factor: ${overallFactor}`);
    return roundMoney(donut.cost * overallFactor);
}

/** Simulate one day of customers and apply end-of-day effects. */
async function simulateDay() {
    // Hide button until day is over
    $("#startButton").hide();
    var numCustomers = Math.ceil(constants.upgrades[constants.upgradeId.Shop].effect() * constants.upgrades[constants.upgradeId.Popularity].effect());
    logger.info(`simulateDay(): # Customers: ${numCustomers}.`);

    var customerFeedDelayTime = Math.min(player.feedTotalTime / numCustomers, player.maxCustomerFeedDelay);
    
    // Track this to end day early when out of donuts
    var totalDonuts = player.remainingQuantities.reduce((accumulator, currentVal) => accumulator + currentVal);
    logger.info(`simulateDay(): Starting with ${totalDonuts} donuts.`);
    player.donutsMade += totalDonuts;  // Track stats

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
            totalDonuts -= numBought;
            player.donutsSold += numBought;  // Track stats
            player.customersServed++;
            $("#feedContent").append(`${name} bought ${numBought} ${donutName} Donut(s) for $${displayMoney(totalSpent)}.<br/>`);
        }
        else {
            $("#feedContent").append(`${name} did not buy any donuts.<br/>`);
        }

        $("#infoFeed").scrollTop($("#infoFeed")[0].scrollHeight);

        if (!totalDonuts) {
        	// No more donuts. End the day early!
        	$("#feedContent").append("Donuts sold out! Closing shop early.");
        	break;
        }

        await sleep(customerFeedDelayTime);
    }
    
    $("#startButton").show();
    logger.info(`simulateDay(): Ended day with ${totalDonuts} donuts remaining.`);

    // Apply end of day effects.
    // Important because on load, we always start at night, so if player exits
    // before manually ending the day, we would like to start on the next night.
    // We do this at the end of this function as it must occur after the customers.
    player.day += 1;
    player.money += constants.upgrades[constants.upgradeId.Support].effect();
    player.money = roundMoney(player.money);
    iterateOtherShops();
    var win = fillLeaderboard();  // Update leaderboard at the end of the day
    logger.info(`simulateDay(): Ending day. Day is now ${player.day}.`);
    logger.info(`simulateDay(): Applying passive income. Player now has $${player.money}.`);

    if (win) {
    	logger.info(`simulateDay(): Player won! Transitioning to world tab.`);
    	$("#worldTabButton").click();
    }
}

/** Increment money for other donut shops. */
function iterateOtherShops() {
	logger.info("iterateOtherShops(): Not implemented.");
	fillLeaderboard();
}

/** Switch to day view. */
function startDay() {
	// Make sure we can start the day
    var moneyRemaining = parseFloat($("#lowerInfo").find("tr").eq(1).find("td").eq(0).text().split("$")[1]);
    if (isNaN(moneyRemaining)) {
        logger.error("startDay(): Money remaining is NaN.");
        return;
    }
    else if (moneyRemaining < 0) {
        logger.error("startDay(): Not enough money.");
        return;
    }

    logger.info(`startDay(): Starting day ${player.day}.`);
    player.gameState = GameState.Day;

    // Apply cost to make donuts
    player.dayProfit = moneyRemaining - player.money;  // Negative profits
    player.money = moneyRemaining;

    // Populate UI
    setDayPlayerInfo();
    $.extend(true, player.remainingQuantities, player.selectedQuantities);
    fillDonutSell();

    // Update button. Hide until day is over.
    $("#startButton").attr("onclick", "startNight()");
    $("#startButton").text("End Day");

    // Hide night components
    $("#lowerInfo").hide();
    $("#advisorColumn").hide();

    // Show stream
    $("#feedContent").empty();
    $("#infoFeed").css({"display": "inline-block"});

    logger.info("startDay(): Done setting up day.");
    simulateDay();  // async
}

/** Switch to night view. */
function startNight() {
    logger.info(`startNight(): Starting night ${player.day}.`);
    player.gameState = GameState.Night;

    // Populate UI
    setNightPlayerInfo();
    fillDonutCreation();
    fillAdvisor();
    refreshTotalCost();

    $("#lowerInfo").show();
    $("#infoFeed").hide();
    $("#advisorColumn").show();

    // Update button
    $("#startButton").attr("onclick", "startDay()");
    $("#startButton").text("Start Day");
    logger.info(`startNight(): Done setting up night.`);
}

/**
 * Handle customer purchases. Assume customer can afford.
 * @param  {number} donutId               Donut customer wants to buy.
 * @param  {number} numToBuy              Number of donuts to buy.
 * @param  {number} customerMoneyPerDonut Amount customer will pay per donut.
 * @return {number}                       Number of donuts bought.
 */
function customerBuy(donutId, numToBuy, customerMoneyPerDonut) {
    if (!player.remainingQuantities[donutId]) {
        return 0;  // Donut out of stock
    }

    var donutPrice = player.sellPrices[donutId];
    if (customerMoneyPerDonut < donutPrice) {
        return 0;
    }

    // Complete purchase
    numToBuy = Math.min(player.remainingQuantities[donutId], numToBuy);
    player.money += numToBuy * donutPrice;
    player.dayProfit += numToBuy * donutPrice;
    player.remainingQuantities[donutId] -= numToBuy;
    $(`#sell${donutId}`).html(`Quantity: ${player.remainingQuantities[donutId]}`);
    $("#playerMoney").html(`${displayMoney(player.money)}. Profit: $${displayMoney(player.dayProfit)}.`);
    return numToBuy;
}

/** Open donut shop tab. */
function openDonutShop(event) {
	if (player.currentTab === constants.tabId.DonutShop) {
		return;
	}

	player.currentTab = constants.tabId.DonutShop;

	// Must update every time in case player purchased upgrades.
    refreshPlayerInfo();
    refreshDonutList();
    fillAdvisor();
    refreshTotalCost();

    openTab(event, constants.tabId.DonutShop);
}
