/**
 * Author: Alexander Zhu
 * Date Created: May 8, 2018
 * Description: Settings tab logic for Donut Tycoon.
 */

/** Open settings tab. */
function openSettings(event) {
	if (player.currentTab === constants.tabId.Settings) {
        return;
    }

    player.currentTab = constants.tabId.Settings;
	openTab(event, constants.tabId.Settings);
}