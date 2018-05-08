/**
 * Author: Alexander Zhu
 * Date Created: May 6, 2018
 * Description: Upgrade object for Donut Tycoon.
 */

/**
 * Upgrade object.
 * @param {string} name                Upgrade name.
 * @param {string} description         Description of upgrade effect.
 * @param {UpgradeTier[]} tiers        Array of UpgradeTiers.
 * @param {function} effectDescription Function that formats effect for displaying,
 */
function Upgrade(name, description, tiers, effectDescription) {
	this.name = name;
	this.description = description;
	this.tiers = tiers;
	this.current = 0;
	this.effectDescription = effectDescription;
}

/**
 * Return current upgrade effect.
 * @return {number} Current upgrade effect.
 */
Upgrade.prototype.effect = function() {
	return this.tiers[this.current].effect;
};

/**
 * Format specified tier for displaying.
 * @param  {number} tierId Tier to display.
 * @return {string}        Formatted tier description.
 */
Upgrade.prototype.displayTier = function(tierId) {
	var current = this.tiers[tierId];
	return `${current.name} ${this.effectDescription(current.effect)}`
}

/**
 * Return cost to upgrade. Requires upgrade is not maxed out.
 * @return {number} Cost to upgrade.
 */
Upgrade.prototype.cost = function() {
	return this.tiers[this.current + 1].cost;
}

/**
 * Upgrade this upgrade.
 * @return {boolean} True if maxed out.
 */
Upgrade.prototype.upgrade = function() {
	if (this.current >= this.tiers.length) {
		console.error(`Upgrade ${this.name} is already maxed out.`);
		return;
	}

	this.current++;
	return this.current === this.tiers.length;
}

/**
 * UpgradeTier object.
 * @param {string} name   Tier name.
 * @param {number} cost   Tier cost.
 * @param {number} effect Tier effect.
 */
function UpgradeTier(name, cost, effect) {
	this.name = name;
	this.cost = cost;
	this.effect = effect;
}
