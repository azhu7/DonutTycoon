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

/** Increase # of customers. */
var ShopLocation = Object.freeze({
	tiers: [
		new UpgradeTier("None", 0, 0),
		new UpgradeTier("Home", 0, 15), 
		new UpgradeTier("Stand", 50, 40),
		new UpgradeTier("Small Shop", 125, 100),
		new UpgradeTier("Large Shop", 250, 200),
		new UpgradeTier("Factory", 500, 400)],
	effectDescription: effect => {
		return `(+${effect})`;
	}
});

/** Increase # customers. */
var Popularity = Object.freeze({
	tiers: [
		new UpgradeTier("None", 0, 1),
		new UpgradeTier("Posters", 25, 1.25),
		new UpgradeTier("Online Ads", 100, 1.5),
		new UpgradeTier("TV Ads", 200, 2),
		new UpgradeTier("Celebrity Endorsement", 400, 3)],
	effectDescription: effect => {
		return `(${effect}x)`;
	}
});

/** Passive income. */
var Support = Object.freeze({
	tiers: [
		new UpgradeTier("None", 0, 0),
		new UpgradeTier("Grandma", 0, 1),
		new UpgradeTier("Friends", 25, 5),
		new UpgradeTier("Sponsor", 100, 25),
		new UpgradeTier("Venture Capital", 200, 100)],
	effectDescription: effect => {
		return `(+$${effect})`;
	}
});

/** Game values for a default Player. */
function Player() {
	// Game info
	this.money = 20;
	this.dayProfit = 0;
	this.day = 1;
	this.gameState = GameState.Night;

	// Donuts
	this.ingredients = new Array(constants.ingredients.length).fill(0);  // Track all ingredients by index
	this.donuts = new Array(constants.donuts.length).fill(0);  // Track all donuts by index
	this.unlockedDonuts = new Set();  // Unlocked donut ids
	this.lockedDonuts = new Set([...Array(constants.donuts.length).keys()]);  // Locked donut ids
	this.sellPrices = [];  // Remember selected
	this.remainingQuantities = new Array(constants.donuts.length).fill(0);  // Track current quantities
	this.selectedQuantities = new Array(constants.donuts.length).fill(0);  // Remember selected

	// Default initialize donut trackers
	constants.donuts.forEach(donut => {
		this.sellPrices.push(donut.cost);
	});

	// Must store copy of levels here to update constants.upgrades on load
	this.upgradeLevels = new Array(constants.upgrades.length).fill(0);

	// Customer Income
	this.customerMoneyRange = 1;  // Factor range for customer $
	this.customerMoneyBase = 1;	  // Base factor for customer $
	this.customerGenerosity = 1;  // Influences how much extra customer $. From achievements.
	this.customerHunger = 1;	  // Influences # donuts customer buys
	this.customerReconsider = 1;  // # times customer "rerolls" on unavailable donuts

	// Statistics
	this.donutsMade = 0;
	this.donutsSold = 0;
	this.customersServed = 0;

	// Other
	this.name = "Shooby's Donut Shop";
	this.feedTotalTime = 4000;  // Time for feed to run
	this.maxCustomerFeedDelay = 500;
	this.saveIntervalId = null;  // Save this id to cancel when wiping player
	this.currentTab = null;  // Save current tab to avoid redundant reloading
}

/** Other donut shops and their revenues. */
/*var shops = [
	["Dooby Donuts", 1337],
	["Ypsilanti Dairy", 900],
	["Crunchy Creme", 740],
	["Moo Moo Pâtisserie", 566.60],
	["Duncan's Donuts", 499],
	["Bob's Bakery", 224],
	["Ratch Donuts", 42.42],
	["Ohio's Best Donuts", 4.44]
];*/

var shops = [
	["Dooby Donuts", 51.41],
	["Happy Chappy", 20]
];

/** Constants. */
var constants = {
	ingredients: [
		new Ingredient("Dough",0,"i_dough.jpg"),
		new Ingredient("Glaze",3,"i_glaze.jpg"),
		new Ingredient("Chocolate",5,"i_chocolate.jpg"),
		new Ingredient("Sprinkles",5,"i_sprinkles.jpg")],

	donuts: [
		new Donut("Plain",1,1,[0],"d_plain.jpeg"),
		new Donut("Glazed",1.5,1.05,[0,1],"d_glazed.jpg"),
		new Donut("Chocolate",1.5,1.05,[0,2],"d_chocolate.jpg"),
		new Donut("Glazed Chocolate",2,1.1,[0,1,2],"d_glazed_chocolate.jpg"),
		new Donut("Chocolate + Sprinkles",2,1.11,[0,2,3],"d_chocolate_sprinkles.jpg")],

	upgradeId: Object.freeze({
		Shop:0,
		Support:1,
		Popularity:2
	}),

	upgrades: [
		new Upgrade("Shop", "Affects number of customers.", ShopLocation.tiers, ShopLocation.effectDescription),
		new Upgrade("Support", "Affects passive income.", Support.tiers, Support.effectDescription),
		new Upgrade("Popularity", "Affects number of customers.", Popularity.tiers, Popularity.effectDescription)
	],

	advisor: {
		"Projected number of customers: ": player => {
			return Math.floor(constants.upgrades[constants.upgradeId.Shop].effect() * constants.upgrades[constants.upgradeId.Popularity].effect());
		},
		"The average customer pays a factor of: ": player => {
			return `${(player.customerMoneyBase + 0.5 * player.customerMoneyRange) * player.customerGenerosity}x`;
		},
		"Average donuts per customer: ": player => {
			return player.customerHunger;
		},
		"": player => { return ""; },
		"Passive income: ": player => {
			return `$${constants.upgrades[constants.upgradeId.Support].effect()}`;
		},
	},

	tabId: Object.freeze({
		DonutShop:"donutShopTab",
		Upgrades:"upgradesTab",
		Statistics:"statisticsTab",
		World:"worldTab",
		Settings:"settingsTab"
	}),

	names: ["Alex","Benicia","Umar","Davide","Danilo","Clayton","Brenden","Iacov","Dayne","Stuart","Kavin","Frankie-Ray","Amanjeet","Chidozie","Leonard","Shae","Jacek","Loic","Ayan","Alfie-John","Henry","Baljeet","Abdul-Nafi","Niko","Kornel","Muhammed","Jann","Abdelrahman","Bassiru","Cairn","Dayle","Lucas","Carlos","Franco","Malachi","Emilis","Ryan","Coire","Milosz","Jesse","Nicol","Anthony","Rohan","Cody-James","Calder","Samir","Bourdieu","Iman","Rhyan","Lloyd","Rory","Montgomery","Gerard","Caillan","Haider","Gray","Fallon","Rico","Erlend","Santiago","Yuan","Brandon","Graeme","Gedeon","Simon","Emile","Cruze","Shane","Kal","Arun","Daryl","Charlie","Amadou","Khai","Padraig","Arian","Abdul-Hakim","Braeden","Connal","Ilyas","Antoni","Darach","Rhuari","Keanu","Ted","Argyle","Hudson","Ifeanyichukwu","Barri","Emre","Zachary","Kaiden","Shayan","Tobias","Ideachi","Arne","Kieren","Scot","Mario","Dariusz","Winston","Arnav","Sebastian","Bryan","Innes","Nataniel","Aaston","Maxim","Troy","Bertram","Faris","Zakariya","Jake","Arshveer","Dainton","Aadyn","Clement","Aniket","Fletcher","Adhvik","Cass","Kalvyn","Alan-John","Areen","Cruize","Brennan","Arda","Aleksejs","Jorden","Fergie","Ernie","Findley","Jaivon","Kuba","Kier","Ray","Fardin","Usman","Rayaan","Aethan","Caydin","Timothy","Ignac","Dayn","Rocco","Conan","Jase-James","Emil","Jay","Christian","Dimitri","Dirko","Rehan","Elliot","Douglas","Kelvin","Chace","Travis","Eduard","Daegan","Brodyn","Braiden","Boden","Darren","Beau","Fearghal","Alexandru","Keagan","Fionan","Ryaan","Aymen","Ritchie","Ayaan","Madden","Lleyton","Keaton","Kalvin","Jaelyn","Kyren","Farrell","Steven","Deimantas","Morgan","Erin","Ahron","Lewis","Jared","Clae","Collin","Kain","Dorian","Fawwaz","Axel","Leo","Evan","Cooper","Fionnlagh","Derek","Jacen","Aidi","Blue","Thomas","Aleksander","Kristopher","Aidan","Vojtech","Wiktor","Casch","Aditya","Kael","Cailean","Geordie","Koby","Kirk","Bartlomiej","Orhan","Abdulrahim","Kerr","Kaden","Emirhan","Nelson","Claude","Abedraouf","Davie","Ossian","Ethan","Aqil","Mckinley","Leighton","Abobaker","Colby","Ahmad","Bobby-Joe","Faraj","Luc","Arshia","Jun","Elliott","Ellis","Gregory","Ameer","Gregoire","Jaxson","Harigovind","Dominic","Seamus","Rannoch","Dominykas","Aneirin","Konnor","Harrison-Blake","Adel","Dane","Igors","Kyan","Gio","Dominiks","Yuri","Andy","Alistair","Saul","Murray","Mieszko","Deklan","Hani","Zenon","Zakaria","Anmol","Thomas-James","Kabir","D'arcy","Evann","Gavin","Alisdair","Henley","Cox","Harley","Ashraf","Jia","Andrius","Stanislaw","Kole","Lochlan","Kelan","Dhruv","Aidan-Scott","Olli","Amir","Isaak","Jamey","Taylor","Adnan","Benedict","Derrak","Ajay","Corbie","Iulian","Izak","Anjan","Aliyan","Dawoud","Joe","Ross","Efetobore","Luka","Ash","Hashir","Jak","Yusuf","Cyril","Gaetano","Alasdhair","Jaydn","Hasan","Rossi","Deacan","Cornelius","Codyn","Chetanveer","Clinton","Abraham","Abdul","Gabrielius","Husnain","Ian","Dani","Jonasz","Drew","Fayaaz","Aki","Seth","Braidyn-Drew","Carrson","Rylie","Sameer","Ruaraidh","Brodie-Alexander","Marcel","Alwyn","Joss","Elio","Austyn","Brooklyn","Arhab","Maxwell","Gurseerit","Ayibatonye","Millar","Hunter","Leonid","Bodhi","Ezra","Oliver","Kenzi","Abubakar","Dayu","Emir","Hamzah","Callaghan","Igor","Anthony-John","Zac","Lukasz","Keiran","Kell","Greig","Blaike","Eden-Lionell","Maximus","Vaughn","Bryce","Jailyn","Ziyad","Cadan","Huck","Berk","Zak","Zachariah","Crawford","Abel","Kingsley","Keiron","Kobi","Ihsan","Buddy","Scott","Isaac","Codey","Hakki","Neil","Dubhglas","Avery","Eliot","Anayat","Syed","Shaye","Anamol","Kaleb","Issam","Cyrus","Clivejakson","Adley","Dillan","Henrik","Gleb","Ekam","Daanish","Digby","Dev","Jayme","Ismaeel","Flyn","Amrit","Dilbagh","Kevin","Ramin","Arden","Conor","Mohammed","Chaitanya","Daley","Jozef","Abhiram","Finnley","Wen","Albert","Odin","Musa","Bobby","Affan","Floyd","Hendrix","Olaf","Andrea","Eray","Ashton","Dalton","Joseph","Calvyn","Amine","Ronnie","Reigan","Cobie","Abdul-Rehman","Bailey","Finlaggan","Freddie","Klay","Jacob-John","Caeden","Areeb","Antonio","Abdurrhman","Lachlan","Jacko-Square","Drever","Henrique","Toby","Adhamh","Cailin","Kody","Eason","Calam","Armaghan","Miles","Corrigan","Jagjeevan","Hugo","Adil","Sylvan","Hank","Zane","Matt","Piotr","Callen","Jahan","Jago","Ralph","Abdirahman","Janek","Edidiong","Amiogho","Jarvie","Andres","Brodi","Muir","Gursharan","Diarmuid","Fareiz","Wilfred","Al-Houssen","Denzel","Johnnie","Caelan","Jenson","Emmanuel","Archie-Jay","Cael","Coben","Malcolm","John-Paul","Travi"],

	imgSize: 64,
    savedPlayer: "playerSave",
    saveInterval: 3000,  // In milliseconds
    eggName: "Alex and Benicia's Donut Shop",
    version: "0.9.5"
};

/** Debug settings. */
var debug = {
    loadSaved: true,
    autosave: true,
    askPlayerName: true,
    saveLogs: true,
    logFilename: "logs.json"
};