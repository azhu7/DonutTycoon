/**
 * Author: Alexander Zhu
 * Date Created: May 3, 2018
 * Description: Data for Donut Tycoon.
 */

/** Enum for game state. */
var GameState = Object.freeze({
	Day:1,
	Night:2
});

/** Game values for a default Player. */
function Player() {
	this.money = 10;
	this.day = 0;
	this.gameState = GameState.Day;

	this.ingredients = [0, 2, 3];
	this.donuts = [0, 1, 2, 3];
	this.sellPrices = [];
}

function Debug() {
	this.loadSaved = false;
	this.autosave = false;
}

/** Constant strings. */
var constants = {
	ingredients: ["Dough", "Sprinkles", "Glaze", "Chocolate"],
	donuts: [
		new Donut("Plain", 1, "plain.jpeg"),
		new Donut("Glazed", 2, "glazed.jpg"),
		new Donut("Chocolate", 2, "chocolate.jpg"),
		new Donut("Glazed Chocolate", 3, "glazed_chocolate.jpg"),
		new Donut("Chocolate + Sprinkles", 3, "chocolate_sprinkles.jpg"), ],

    savedPlayer: "playerSave",
    version: "0.0.1"
};