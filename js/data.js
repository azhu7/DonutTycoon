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

var ShopLocation = Object.freeze({
	Home:15,
	Stand:25,
	SmallShop:40,
	Factory:60
});

var Support = Object.freeze({
	Grandma:1,
	Friends:5,
	Sponsor:25,
	VentureCapital:100
});

var Ads = Object.freeze({
	Posters:2,
	OnlineAds:4,
	TVAds:8,
	CelebrityEndorsement:16
});

/** Game values for a default Player. */
function Player() {
	this.money = 9;
	this.dayProfit = 0;
	this.day = 0;
	this.gameState = GameState.Day;

	// Donuts
	this.ingredients = [1, 0, 1, 1];
	this.donuts = [1, 1, 1, 1, 0];
	this.numUnlocked = 4;		   // Number of unlocked donuts
	this.sellPrices = [];		   // Remember selected
	this.selectedQuantities = [];  // Remember selected
	this.quantities = [];		   // Track current quantities

	// Number of Customers
	this.shopLocation = ShopLocation.Home;
	this.popularity = 1;
	
	// Passive Income
	this.support = Support.Grandma;

	// Customer Income
	this.customerMoneyRange = 1;  // Factor range for customer $
	this.customerMoneyBase = 1;	  // Base factor for customer $
	this.customerGenerosity = 1;  // Influences how much extra customer $
	this.customerHunger = 1;	  // Influences # donuts customer buys
	this.customerReconsider = 1;  // # times customer "rerolls" on unavailable donuts
}

function Debug() {
	this.loadSaved = false;
	this.autosave = false;
}

/** Constant strings. */
var constants = {
	ingredients: ["Dough", "Sprinkles", "Glaze", "Chocolate"],
	donuts: [
		new Donut("Plain", 1, 1, "plain.jpeg"),
		new Donut("Glazed", 1.5, 1.05, "glazed.jpg"),
		new Donut("Chocolate", 1.5, 1.05, "chocolate.jpg"),
		new Donut("Glazed Chocolate", 2, 1.1, "glazed_chocolate.jpg"),
		new Donut("Chocolate + Sprinkles", 2, 1.11, "chocolate_sprinkles.jpg"), ],

	names: ["Alex","Benicia","Umar","Davide","Danilo","Clayton","Brenden","Iacov","Dayne","Stuart","Kavin","Frankie-Ray","Amanjeet","Chidozie","Leonard","Shae","Jacek","Loic","Ayan","Alfie-John","Henry","Baljeet","Abdul-Nafi","Niko","Kornel","Muhammed","Jann","Abdelrahman","Bassiru","Cairn","Dayle","Lucas","Carlos","Franco","Malachi","Emilis","Ryan","Coire","Milosz","Jesse","Nicol","Anthony","Rohan","Cody-James","Calder","Samir","Bourdieu","Iman","Rhyan","Lloyd","Rory","Montgomery","Gerard","Caillan","Haider","Gray","Fallon","Rico","Erlend","Santiago","Yuan","Brandon","Graeme","Gedeon","Simon","Emile","Cruze","Shane","Kal","Arun","Daryl","Charlie","Amadou","Khai","Padraig","Arian","Abdul-Hakim","Braeden","Connal","Ilyas","Antoni","Darach","Rhuari","Keanu","Ted","Argyle","Hudson","Ifeanyichukwu","Barri","Emre","Zachary","Kaiden","Shayan","Tobias","Ideachi","Arne","Kieren","Scot","Mario","Dariusz","Winston","Arnav","Sebastian","Bryan","Innes","Nataniel","Aaston","Maxim","Troy","Bertram","Faris","Zakariya","Jake","Arshveer","Dainton","Aadyn","Clement","Aniket","Fletcher","Adhvik","Cass","Kalvyn","Alan-John","Areen","Cruize","Brennan","Arda","Aleksejs","Jorden","Fergie","Ernie","Findley","Jaivon","Kuba","Kier","Ray","Fardin","Usman","Rayaan","Aethan","Caydin","Timothy","Ignac","Dayn","Rocco","Conan","Jase-James","Emil","Jay","Christian","Dimitri","Dirko","Rehan","Elliot","Douglas","Kelvin","Chace","Travis","Eduard","Daegan","Brodyn","Braiden","Boden","Darren","Beau","Fearghal","Alexandru","Keagan","Fionan","Ryaan","Aymen","Ritchie","Ayaan","Madden","Lleyton","Keaton","Kalvin","Jaelyn","Kyren","Farrell","Steven","Deimantas","Morgan","Erin","Ahron","Lewis","Jared","Clae","Collin","Kain","Dorian","Fawwaz","Axel","Leo","Evan","Cooper","Fionnlagh","Derek","Jacen","Aidi","Blue","Thomas","Aleksander","Kristopher","Aidan","Vojtech","Wiktor","Casch","Aditya","Kael","Cailean","Geordie","Koby","Kirk","Bartlomiej","Orhan","Abdulrahim","Kerr","Kaden","Emirhan","Nelson","Claude","Abedraouf","Davie","Ossian","Ethan","Aqil","Mckinley","Leighton","Abobaker","Colby","Ahmad","Bobby-Joe","Faraj","Luc","Arshia","Jun","Elliott","Ellis","Gregory","Ameer","Gregoire","Jaxson","Harigovind","Dominic","Seamus","Rannoch","Dominykas","Aneirin","Konnor","Harrison-Blake","Adel","Dane","Igors","Kyan","Gio","Dominiks","Yuri","Andy","Alistair","Saul","Murray","Mieszko","Deklan","Hani","Zenon","Zakaria","Anmol","Thomas-James","Kabir","D'arcy","Evann","Gavin","Alisdair","Henley","Cox","Harley","Ashraf","Jia","Andrius","Stanislaw","Kole","Lochlan","Kelan","Dhruv","Aidan-Scott","Olli","Amir","Isaak","Jamey","Taylor","Adnan","Benedict","Derrak","Ajay","Corbie","Iulian","Izak","Anjan","Aliyan","Dawoud","Joe","Ross","Efetobore","Luka","Ash","Hashir","Jak","Yusuf","Cyril","Gaetano","Alasdhair","Jaydn","Hasan","Rossi","Deacan","Cornelius","Codyn","Chetanveer","Clinton","Abraham","Abdul","Gabrielius","Husnain","Ian","Dani","Jonasz","Drew","Fayaaz","Aki","Seth","Braidyn-Drew","Carrson","Rylie","Sameer","Ruaraidh","Brodie-Alexander","Marcel","Alwyn","Joss","Elio","Austyn","Brooklyn","Arhab","Maxwell","Gurseerit","Ayibatonye","Millar","Hunter","Leonid","Bodhi","Ezra","Oliver","Kenzi","Abubakar","Dayu","Emir","Hamzah","Callaghan","Igor","Anthony-John","Zac","Lukasz","Keiran","Kell","Greig","Blaike","Eden-Lionell","Maximus","Vaughn","Bryce","Jailyn","Ziyad","Cadan","Huck","Berk","Zak","Zachariah","Crawford","Abel","Kingsley","Keiron","Kobi","Ihsan","Buddy","Scott","Isaac","Codey","Hakki","Neil","Dubhglas","Avery","Eliot","Anayat","Syed","Shaye","Anamol","Kaleb","Issam","Cyrus","Clivejakson","Adley","Dillan","Henrik","Gleb","Ekam","Daanish","Digby","Dev","Jayme","Ismaeel","Flyn","Amrit","Dilbagh","Kevin","Ramin","Arden","Conor","Mohammed","Chaitanya","Daley","Jozef","Abhiram","Finnley","Wen","Albert","Odin","Musa","Bobby","Affan","Floyd","Hendrix","Olaf","Andrea","Eray","Ashton","Dalton","Joseph","Calvyn","Amine","Ronnie","Reigan","Cobie","Abdul-Rehman","Bailey","Finlaggan","Freddie","Klay","Jacob-John","Caeden","Areeb","Antonio","Abdurrhman","Lachlan","Jacko-Square","Drever","Henrique","Toby","Adhamh","Cailin","Kody","Eason","Calam","Armaghan","Miles","Corrigan","Jagjeevan","Hugo","Adil","Sylvan","Hank","Zane","Matt","Piotr","Callen","Jahan","Jago","Ralph","Abdirahman","Janek","Edidiong","Amiogho","Jarvie","Andres","Brodi","Muir","Gursharan","Diarmuid","Fareiz","Wilfred","Al-Houssen","Denzel","Johnnie","Caelan","Jenson","Emmanuel","Archie-Jay","Cael","Coben","Malcolm","John-Paul","Travi"],

    savedPlayer: "playerSave",
    version: "0.0.1"
};