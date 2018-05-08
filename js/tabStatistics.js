/**
 * Author: Alexander Zhu
 * Date Created: May 8, 2018
 * Description: Statistics tab logic for Donut Tycoon.
 */

/** Populate list of metrics. */
function fillMetrics() {

}

/** Sort donut shops by revenue, ascending. */
function compareDonutShop(lhs, rhs) {
	return (lhs[1] < rhs[1]) ? 1 : (lhs[1] > rhs[1]) ? -1 : 0;
}

/**
 * Populate leaderboard.
 * The leaderboard becomes out-of-date at the end of each day and whenever the
 * player changes their amount of money (e.g., from buying upgrades).
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

	logger.info("fillLeaderboard(): Filling leaderboard.");
	var leaderboardEntryTemplate = _.template($("#leaderboardEntryTemplate").html());

	// Leaderboard up-to-date.
	if (this.curDay == player.day && this.curPlayerMoney == player.money) {
		logger.info("fillLeaderboard(): Leaderboard up-to-date.");
		return;
	}

	// Leaderboard out-of-date. Refresh!
	logger.info("fillLeaderboard(): Leaderboard out-of-date. Refreshing.");
	this.curDay = player.day;
	this.curPlayerMoney = player.money;
	var leaderboard = shops.concat([[player.name, player.money]]);
	leaderboard.sort(compareDonutShop);
	
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
}

/** Open statistics tab. */
function openStatistics(event) {
	fillLeaderboard();

	openTab(event, 'statisticsTab');
}