/**
 * Author: Alexander Zhu
 * Date Created: May 8, 2018
 * Description: Profile tab logic for Donut Tycoon.
 */

/** Open profile tab. */
function openProfile(event) {
	if (player.currentTab === constants.tabId.Profile) {
        return;
    }

    player.currentTab = constants.tabId.Profile;
	openTab(event, constants.tabId.Profile);
}