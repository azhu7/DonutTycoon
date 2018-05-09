/**
 * Author: Alexander Zhu
 * Date Created: May 8, 2018
 * Description: Statistics tab logic for Donut Tycoon.
 */

/** Populate list of metrics. */
function fillStatistics() {
	var statisticsEntryTemplate = _.template($("#statisticsEntryTemplate").html());
	$("#statisticsContent > tbody").empty();
	var statisticsEntries = [];
	statisticsEntries.push(statisticsEntryTemplate({
		description: "Donuts made:",
		amount: player.donutsMade
	}));

	statisticsEntries.push(statisticsEntryTemplate({
		description: "Donuts sold:",
		amount: player.donutsSold
	}));

	statisticsEntries.push(statisticsEntryTemplate({
		description: "Customers served:",
		amount: player.customersServed
	}));

	statisticsEntries.forEach(entry => $("#statisticsContent > tbody").append(entry));
}

/** Sort donut shops by revenue, ascending. */
function compareDonutShop(lhs, rhs) {
	return (lhs[1] < rhs[1]) ? 1 : (lhs[1] > rhs[1]) ? -1 : 0;
}

/**
 * Populate leaderboard.
 * The leaderboard becomes out-of-date at the end of each day and whenever the
 * player changes their amount of money (e.g., from buying upgrades).
 * @return {bool} True if player is at top of the leaderboard.
 */
function fillLeaderboard() {
	if (typeof this.curDay === "undefined") {
		// Track day the leaderboard was last updated
		this.curDay = player.day - 1;  // Start one day back to force sorting
	}
	if (typeof this.curPlayerMoney === "undefined") {
		// Track player's current money on leaderboard
		this.curPlayerMoney = player.money;
	}
	if (typeof this.curPlayerName === "undefined") {
		this.curPlayerName = player.name;
	}

	logger.info("fillLeaderboard(): Filling leaderboard.");
	var leaderboardEntryTemplate = _.template($("#leaderboardEntryTemplate").html());

	// Leaderboard up-to-date.
	if (this.curDay === player.day && this.curPlayerMoney === player.money && this.curPlayerName === player.name) {
		logger.info("fillLeaderboard(): Leaderboard up-to-date.");
		return;
	}

	// Leaderboard out-of-date. Refresh!
	logger.info("fillLeaderboard(): Leaderboard out-of-date. Refreshing.");
	this.curDay = player.day;
	this.curPlayerMoney = player.money;
	this.curPlayerName = player.name;
	var leaderboard = shops.concat([[player.name, player.money]]);
	leaderboard.sort(compareDonutShop);
	var win = leaderboard[0][0] === player.name;

	if (win) {
		$("#winText").text("You topped the leaderboard! Head to the World tab to continue.");
	}
	else {
		$("#winText").text("");
	}
	
	// Remove all except header row
	var v = $("#leaderboardContent");
	$("#leaderboardContent > tbody").find("tr:not(:first)").remove();
	//$("#leaderboardContent > tbody").empty();
	for (var i = 0; i < leaderboard.length; i++) {
		var leaderboardEntry = leaderboardEntryTemplate({
			rank: i + 1,
			name: leaderboard[i][0],
			revenue: displayMoney(leaderboard[i][1])
		});

		$("#leaderboardContent > tbody").append(leaderboardEntry);
	}

	logger.info("fillLeaderboard(): Filled leaderboard.");
	logger.info(`fillLeaderboard(): Player won? ${win}`);
	return win;
}

/** Open statistics tab. */
function openStatistics(event) {
	if (player.currentTab === constants.tabId.Statistics) {
        return;
    }

    player.currentTab = constants.tabId.Statistics;
    fillStatistics();
	fillLeaderboard();

	openTab(event, constants.tabId.Statistics);
}