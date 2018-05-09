/**
 * Author: Alexander Zhu
 * Date Created: May 8, 2018
 * Description: Upgrade tab logic for Donut Tycoon.
 */

/** Populate list of ingredients. */
function fillIngredients() {
    logger.info("fillIngredients(): Filling ingredients list.");

    var unownedIngredientTemplate = _.template($("#unownedIngredientTemplate").html());
    var ownedIngredientTemplate = _.template($("#ownedIngredientTemplate").html());

    // Populate ingredient menu
    $("#unownedIngredients > tbody").empty();  // Clear old entries
    $("#ownedIngredients > tbody").empty();  // Clear old entries

    for (var i = 0; i < constants.ingredients.length; i++) {
        var ingredient = constants.ingredients[i];
        if (!player.ingredients[i]) {
            var unownedIngredientInfo = unownedIngredientTemplate({
                img: `<img src="img/${ingredient.imagePath}" style="max-height: ${constants.imgSize}px; max-width: ${constants.imgSize}px;" />`,
                name: ingredient.name,
                cost: displayMoney(ingredient.cost),
                ingredientId: `ingredient${i}`,
                id: i
            });

            $("#unownedIngredients > tbody").append(unownedIngredientInfo);
            var canAfford = player.money >= ingredient.cost;
            $(`#ingredient${i}`)[0].className = "upgradeButton " + (canAfford ? "buttonLit" : "button");
        }
        else {
            var ownedIngredientInfo = ownedIngredientTemplate({
                img: `<img src="img/${ingredient.imagePath}" style="max-height: ${constants.imgSize}px; max-width: ${constants.imgSize}px;" />`,
                name: ingredient.name
            });

            $("#ownedIngredients > tbody").append(ownedIngredientInfo);
        }
    }

    logger.info("fillIngredients(): Filled ingredients list.");
}

/**
 * Convert an array of ingredients to html list syntax.
 * Assigns classes per list item depending on if player owns ingredient or not.
 * @param  {array} array        Items to convert to html list syntax.
 * @param  {function} transform Function to map items. Default map to self.
 * @return {string}             Html list syntax.
 */
function formatIngredientArrayAsHtml(array) {
    var html = "";
    array.forEach(function(item) {
        var className = player.ingredients[item] ? "ownedIngredient" : "unownedIngredient";
        html += `<li class="${className}">${constants.ingredients[item].name}</li>`;
    });

    return html;
}

/** Populate list of recipes. */
function fillRecipes() {
    logger.info("fillRecipes(): Filling recipes list.");

    var inProgressRecipeTemplate = _.template($("#inProgressRecipeTemplate").html());
    var completedRecipeTemplate = _.template($("#completedRecipeTemplate").html());

    // Populate ingredient menu
    $("#inProgressRecipes > tbody").empty();  // Clear old entries
    $("#completedRecipes > tbody").empty();  // Clear old entries

    for (var i = 0; i < constants.donuts.length; i++) {
        var donut = constants.donuts[i];
        if (!player.donuts[i]) {
            var inProgressRecipeInfo = inProgressRecipeTemplate({
                img: `<img src="img/${donut.imagePath}" style="max-height: ${constants.imgSize}px; max-width: ${constants.imgSize}px;" />`,
                flavor: donut.flavor,
                ingredients: formatIngredientArrayAsHtml(donut.ingredients)
            });

            $("#inProgressRecipes > tbody").append(inProgressRecipeInfo);
        }
        else {
            var completedRecipeInfo = completedRecipeTemplate({
                img: `<img src="img/${donut.imagePath}" style="max-height: ${constants.imgSize}px; max-width: ${constants.imgSize}px;" />`,
                flavor: donut.flavor
            });

            $("#completedRecipes > tbody").append(completedRecipeInfo);
        }
    }

    logger.info("fillRecipes(): Filled recipes list.");
}

/**
 * Handle purchasing an ingredient. Assume can afford ingredient.
 * @param  {number} ingredientId Index of ingredient player is buying.
 */
function buyIngredient(ingredientId) {
    if (player.ingredients[ingredientId]) {
        logger.error(`buyIngredient(): Ingredient ${ingredientId} already owned.`);
        return;
    }

    var ingredient = constants.ingredients[ingredientId];
    if (player.money < ingredient.cost) {
        logger.error(`buyIngredient(): Cannot afford ingredient ${ingredientId}.`);
        return;
    }

    logger.info(`buyIngredient(): Player buying ingredient ${ingredientId}.`);
    player.money -= ingredient.cost;
    player.ingredients[ingredientId] = 1;

    // Update which recipes we have completed
    for (var i = 0; i < constants.donuts.length; i++) {
        if (player.donuts[i]) {
            continue;  // Skip donuts we already own
        }

        // Unlock donut if player now owns every ingredient
        if (constants.donuts[i].ingredients.every(ingredientId => {
            return player.ingredients[ingredientId];
        })) {
            player.donuts[i] = 1;
            player.unlockedDonuts.add(i);
            player.lockedDonuts.delete(i);
            logger.info(`buyIngredient(): Unlocked donut flavor: ${constants.donuts[i].flavor}`);
        }
    }

    // Update ingredients and recipe list
    fillIngredients();
    fillRecipes();
    logger.info(`buyIngredient(): Player bought ingredient ${ingredientId}`);
}

/** Populate list of upgrades. */
function fillUpgrades() {
    logger.info("fillUpgrades(): Filling upgrades list.");
    var upgradeTemplate = _.template($("#upgradeTemplate").html());

    $("#upgrades > tbody").empty();  // Clear old entries
    for (var i = 0; i < constants.upgrades.length; i++) {
        var upgrade = constants.upgrades[i];
        var upgradeInfo = upgradeTemplate({
            upgradeId: `upgrade${i}`,
            id: i,
            name: upgrade.name,
            description: upgrade.description,
            current: upgrade.displayTier(upgrade.current),
            next: upgrade.displayTier(upgrade.current + 1),
            cost: upgrade.cost()
        });

        $("#upgrades > tbody").append(upgradeInfo);
        var canAfford = player.money >= upgrade.cost();
        $(`#upgrade${i}`)[0].className = "upgradeButton " + (canAfford ? "buttonLit" : "button");
    }

    logger.info("fillUpgrades(): Filled upgrades list.");
}

/** Handle purchasing upgrade. Assume can afford ingredient. */
function buyUpgrade(upgradeId) {
    if (player.money < constants.upgrades[upgradeId].cost()) {
        logger.error(`Cannot afford upgrade ${upgradeId}.`);
        return;
    }

    logger.info(`buyUpgrade(): Player buying upgrade ${upgradeId}.`);
    player.money -= constants.upgrades[upgradeId].cost();
    constants.upgrades[upgradeId].upgrade();
    fillUpgrades();
    logger.info(`buyUpgrade(): Player bought upgrade ${upgradeId}.`);
}

/** Refresh all upgrade tab sections. */
function refreshUpgradeTab() {
    fillIngredients();
    fillRecipes();
    fillUpgrades();
}

/** Open upgrades tab. */
function openUpgrades(event) {
    if (typeof this.curMoney === "undefined") {
        this.curMoney = null;
    }

    if (player.currentTab === constants.tabId.Upgrades) {
        return;
    }

    player.currentTab = constants.tabId.Upgrades;

    // Only refresh columns if player's money has changed.
    if (player.money != this.curMoney) {
        this.curMoney = player.money;
        refreshUpgradeTab();
    }

    openTab(event, constants.tabId.Upgrades);
}