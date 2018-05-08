/**
 * Author: Alexander Zhu
 * Date Created: May 8, 2018
 * Description: Upgrade tab logic for Donut Tycoon.
 */

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
}

/**
 * Convert an array of ingredients to html list syntax.
 * Assigns classes per list item depending on if player owns ingredient or not.
 * @param  {array} array        Items to convert to html list syntax.
 * @param  {function} transform Function to map items. Default map to self.
 * @return {string}             Html list syntax.
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
}

/**
 * Handle purchasing an ingredient. Assume can afford ingredient.
 * @param  {number} ingredientId Index of ingredient player is buying.
 */
function buyIngredient(ingredientId) {
    if (player.ingredients[ingredientId]) {
        logger.error(`Ingredient ${ingredientId} already owned.`);
        return;
    }

    var ingredient = constants.ingredients[ingredientId];
    if (player.money < ingredient.cost) {
        logger.error(`Cannot afford ingredient ${ingredientId}.`);
        return;
    }

    player.money -= ingredient.cost;
    player.ingredients[ingredientId] = 1;

    // Update which recipes we have completed
    for (var i = 0; i < constants.donuts.length; i++) {
        if (player.donuts[i]) {
            continue;  // Skip donuts we already own
        }

        // Unlock donut if player now owns every ingredient
        if (constants.donuts[i].ingredients.every(ingredient => {
            return player.ingredients[ingredient];
        })) {
            player.donuts[i] = 1;
            player.unlockedDonuts.add(i);
            player.lockedDonuts.delete(i);
            logger.info(`Unlocked donut flavor: ${constants.donuts[i].flavor}`);
        }
    }

    // Update ingredients and recipe list
    fillIngredients();
    fillRecipes();
}

/** Populate list of upgrades. */
function fillUpgrades() {
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
}

/** Handle purchasing upgrade. Assume can afford ingredient. */
function buyUpgrade(upgradeId) {
    if (player.money < constants.upgrades[upgradeId].cost()) {
        logger.error(`Cannot afford upgrade ${upgradeId}.`);
        return;
    }

    player.money -= constants.upgrades[upgradeId].cost();
    constants.upgrades[upgradeId].upgrade();
    fillUpgrades();
}

/** Open upgrades tab. */
function openUpgrades(event) {
    saveDonutSelection();

    fillIngredients();
    fillRecipes();
    fillUpgrades();

    openTab(event, 'upgradesTab');
}