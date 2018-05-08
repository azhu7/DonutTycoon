/**
 * Author: Alexander Zhu
 * Date Created: May 3, 2018
 * Description: Donut object for Donut Tycoon.
 */

/**
 * [Donut description]
 * @param {string} flavor        Donut flavor.
 * @param {number} cost          Cost to make donut.
 * @param {number} rarity        Donut rarity.
 * @param {number[]} ingredients List of ingredient IDs.
 * @param {string} imagePath     Donut image path.
 */
function Donut(flavor, cost, rarity, ingredients, imagePath) {
	this.flavor = flavor;
	this.cost = cost;
	this.rarity = rarity;
	this.ingredients = ingredients;
	this.imagePath = imagePath;
}