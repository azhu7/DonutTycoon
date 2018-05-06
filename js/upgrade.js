/**
 * [UpgradeTier description]
 * @param {[type]} name   [description]
 * @param {[type]} cost   [description]
 * @param {[type]} effect [description]
 */
function UpgradeTier(name, cost, effect) {
	this.name = name;
	this.cost = cost;
	this.effect = effect;
}

/**
 * Upgrade object.
 * @param {[type]} name              [description]
 * @param {[type]} description       [description]
 * @param {UpgradeTier[]} tiers             [description]
 * @param {[type]} effectDescription [description]
 */
function Upgrade(name, description, tiers, effectDescription) {
	this.name = name;
	this.description = description;
	this.tiers = tiers;
	this.current = 0;
	this.effectDescription = effectDescription;
}

Upgrade.prototype.effect = function() {
	return this.tiers[this.current].effect;
};

Upgrade.prototype.displayTier = function(tierId) {
	var current = this.tiers[tierId];
	return `${current.name} ${this.effectDescription(current.effect)}`
}

/**
 * Return cost to upgrade. Requires upgrade is not maxed out.
 * @return {[type]} [description]
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