/**
 * Author: Alexander Zhu
 * Date Created: May 8, 2018
 * Description: Profile tab logic for Donut Tycoon.
 */

/** Open profile tab. */
function openWorld(event) {
	if (player.currentTab === constants.tabId.World) {
        return;
    }

    player.currentTab = constants.tabId.World;
	openTab(event, constants.tabId.World);
}