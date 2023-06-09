var config = {
	type: Phaser.AUTO,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 1280,
		height: 720
	},
	scene: {
		preload: preload,
		create: create,
		update: update
	},
	pixelart:true
};

const sampleProfile = {
	name: "guest",
	clicks: 0,
	balance: 0,
	hoursPassed: 0,
	res:{
		stone: 0,
		iron: 0,
		copper: 0,
		gold: 0,
		emerald: 0,
		diamond: 0
	},
	workers:{
		"john":false,
		"julie":false,
		"harry":false,
		"marrie":false,
		"alex":false,
		"dave":false
	},
	antiques:{
		globe: 0, //stone & copper
		sword: 0, //iron & copper
		wand: 0, //gold and emerald
		ring: 0, //gold & diamond
		crown: 0 //gold, emerald & diamond
	}
}

//data
let orePrice = [2, 4, 5, 10, 15, 22]
let antiquePrice = [170, 200, 280, 100, 450]
let workerCost = [30, 60, 100, 200, 350, 700];
let workerMines = [1, 2, 3, 4, 4, 6];
let antiqueReqs = ["stone 10; copper 25", "copper 16; iron 20", "gold 20; emerald 1", "gold 6; diamond 1", "gold 30; emerald 5; diamond 1"]
const game = new Phaser.Game(config);

//required var
let version = "4.0.0";
let profile;
let elaspedTxt, usernameTxt, ttlClicksTxt, cashTxt;
let base;
let stuff = new Object();
function preload() {
	this.load.image('background', 'images/bg_cave.jpg');
	this.load.image('mineLogo', 'images/mine.png');
	this.load.image('save','images/save.png');
	this.load.image('blacksmith','images/blacksmith.png');
	this.load.image('shop','images/shop.png');
	this.load.image('work','images/work.png');
	this.load.image('home','images/home.png');
	this.load.image('fullscreen','images/fullscreen.png');
	
	//loading minerals
	this.load.image('stone','images/minerals/stone.png');
	this.load.image('iron','images/minerals/iron.png');
	this.load.image('copper','images/minerals/copper.png');
	this.load.image('gold','images/minerals/gold.png');
	this.load.image('emerald','images/minerals/emerald.png');
	this.load.image('diamond','images/minerals/diamond.png');
	
	//loading employees
	this.load.image('alex','images/employees/alex.png');
	this.load.image('dave','images/employees/dave.png');
	this.load.image('harry','images/employees/harry.png');
	this.load.image('john','images/employees/john.png');
	this.load.image('julie','images/employees/julie.png');
	this.load.image('marrie','images/employees/marrie.png');

	//loading antiques
	this.load.image('globe','images/antiques/globe.png');
	this.load.image('sword','images/antiques/sword.png');
	this.load.image('wand','images/antiques/wand.png');
	this.load.image('ring','images/antiques/ring.png');
	this.load.image('crown','images/antiques/crown.png');
	
	if(document.cookie && !document.cookie.startsWith("pro=clear")){
		
		//loading existing profile from cookie
		let deData = CryptoJS.AES.decrypt((document.cookie).substring(4), 'openkeyLOL').toString(CryptoJS.enc.Utf8)
		profile = JSON.parse(deData);
		console.log("loaded old profile")
	}else{
		
		//creating a new profile
		let enData = CryptoJS.AES.encrypt(JSON.stringify(sampleProfile), 'openkeyLOL').toString();
		document.cookie = "pro="+enData;
		profile = sampleProfile;
		console.log("Created new key!")
	}
}

function create() {
	//assigning base its value
	
	base = this;
	setState("home", true)
	
	
	//tick timer every 3 sec.
	this.time.addEvent({ 
		delay: 3 * 1000,
        callback: tick,
        callbackScope: this,
        loop: true
    });
	//save every 30sec
	this.time.addEvent({ 
		delay: 30 * 1000,
        callback: save,
        callbackScope: this,
        loop: true
    });
	
}

function setState(state, showInv, showHome ){
	//clear slate
	for (const child of Object.values(stuff)) {
			child.destroy();
			delete stuff[child]
	}

/* COMMON THINGS IN ALL THE GAME STATES */
	//adding background
	let background = base.add.image(0, 0, 'background');
	background.setOrigin(0, 0);
	background.setScale(base.game.config.width / background.width, base.game.config.height / background.height);
	
	//home button
	if(showHome === true){
	stuff.homeBtn = base.add.rectangle(850, 60, 100, 100, 0xff0000)
	.setInteractive().on('pointerdown', function(){return setState("home",true)})
	stuff.homeImg = base.add.image(850, 40, 'home').setScale(0.18)
	stuff.homeTxt = base.add.text(810, 76, "Home", {fontSize: "30px",fontStyle: "bold"})
	}

	//Inventory
	stuff.invTxt = base.add.text(1140, 200, `${profile.res.stone}\n\n${profile.res.iron}\n\n${profile.res.copper}\n\n${profile.res.gold}\n\n${profile.res.emerald}\n\n${profile.res.diamond}`,{fontSize: "24px"})
	
	if(showInv){
	stuff.invTxt.active = true;
	stuff.invRect = base.add.graphics().fillStyle(0x634C46, 0.67).fillRoundedRect(1040, 140, 220, 340, { tl: 40, tr: 40, bl: 0, br: 0 })
	stuff.invTitle = base.add.text(1070, 150, "Inventory",{fontSize: "30px"})
	stuff.min1 = base.add.image(1100, 200, 'stone').setScale(0.4)
	stuff.min2 = base.add.image(1100, 250, 'iron').setScale(0.4)
	stuff.min3 = base.add.image(1100, 300, 'copper').setScale(0.4)
	stuff.min4 = base.add.image(1100, 350, 'gold').setScale(0.4)
	stuff.min5 = base.add.image(1100, 400, 'emerald').setScale(0.4)
	stuff.min6 = base.add.image(1100, 450, 'diamond').setScale(0.4)
	}else stuff.invTxt.active = false;

	//save button & text
	let saveTxt = base.add.text(30, 70, "Save")
	base.saveBtn = base.add.rectangle(50, 50, 40, 40, 0xDBB941).setAlpha(0.7)
	.setInteractive().on('pointerdown', save).on('pointerover', function(){
		saveTxt.setVisible(true)
	}).on('pointerout', function(){
		saveTxt.setVisible(false)
	})
	base.add.image(base.saveBtn.x, base.saveBtn.y, 'save').setScale(0.1);

	//version
	base.add.graphics().fillStyle(0x000000, 0.9).fillRoundedRect(100, 0, 100, 40, { tl: 0, tr: 0, bl: 12, br: 12 });
	base.add.text(120, 20, "v" + version, {color: '#ffffff'})
	
	//time passed.
	base.add.graphics().fillStyle(0x000000, 1).fillRoundedRect(480, 0, 300, 70, { tl: 0, tr: 0, bl: 30, br: 30 });
	base.add.text(610, 25, 'Started Journey', {fontSize: "20px"}).setOrigin(0.5);
	elaspedTxt = base.add.text(630, 50, elapseFormat(profile.hoursPassed), {fontSize: "20px",fontStyle: "bold"}).setOrigin(0.5);
	
	//profile
	base.add.graphics().fillStyle(0x59463B, 0.8).fillRoundedRect(980, 10, 340, 40, { tl: 40, tr: 0, bl: 0, br: 0 })
	.fillStyle(0xA48675, 0.65).fillRoundedRect(1020, 50, 300, 35, { tl: 0, tr: 0, bl: 30, br: 0 })
	.fillStyle(0x31EB5A, 0.65).fillRoundedRect(1120, 85, 200, 30, { tl: 0, tr: 0, bl: 30, br: 0 });
	
	usernameTxt = base.add.text(1120, 30, "@"+profile.name, {fontSize: "40px",fontStyle: "bold"}).setOrigin(0.5)
	.setInteractive().on('pointerdown', function(){
		//validation & limiting renaming to once only
		let newName = prompt("provide a new username").toString().trim()
		if((newName.length>12)||newName.length == 0) return alert("Please provide a username with 12 or less characters.")
		if(profile.name !== sampleProfile.name) return alert("Sorry! You can rename yourself only once")
		if(newName == sampleProfile.name) return alert("What's the point of renaming then?!?!")
		//rename thingy
		profile.name = newName;
		usernameTxt.text = "@"+ newName;
		save()
	})
	
	ttlClicksTxt = base.add.text(1160, 65, profile.clicks + " total clicks", {fontSize: "26px"}).setOrigin(0.5)
	cashTxt = base.add.text(1180, 100, profile.balance + " $", {fontSize: "26px", fontStyle:"bold", fill:'#0F710D'}).setOrigin(0.5)

	//states :- 'home', 'shop', 'blacksmith', 'work', 'antiques'
	if((!state) || (state === 'home')) home();
	else if(state === 'shop') shop(); //shop
	else if(state === 'blacksmith') blacksmith(); //blacksmith
	else if(state === 'work') return work(); //work
}



function update() {
	
}

//home page
function home(){
	//mine button
	stuff.mineBg = base.add.graphics().fillStyle(0xC36D1D, 0.22).fillCircle(680, 300, 100).fillCircle(680, 300, 120)
	stuff.mineBtn = base.add.sprite(684, 300, 'mineLogo').setScale(0.4).setInteractive()
	let mineTween = base.tweens.add({
		targets: stuff.mineBtn,
		scale: 0.45,
		duration: 1000,
		yoyo: true,
		repeat: -1
	  });
	  stuff.mineBtn.on('pointerdown', function(pointer) {
		mineTween.pause();
	  this.scale -= 0.05;
	  //add clicks
	  let item = click()
    floatText(`${item}!`, pointer.x, pointer.y);
	}).on('pointerup', function() {
		mineTween.resume();
		this.scale = 0.4;
	  });

	//blacksmith icon
	stuff.blacksmTxt = base.add.text(30, 230, "Blacksmith",{fontSize: "20px"})
	stuff.blacksmBtn = base.add.rectangle(70, 180, 80, 80, 0xDEBB78).setAlpha(0.56)
		.setInteractive().on('pointerdown', function(){setState('blacksmith', true, true)}).on('pointerover', function(){
			stuff.blacksmTxt.setVisible(true)}).on('pointerout', function(){stuff.blacksmTxt.setVisible(false)})
		stuff.blacksmImg = base.add.image(stuff.blacksmBtn.x, stuff.blacksmBtn.y, 'blacksmith').setScale(1);
	
	//shop icon
	stuff.shopTxt = base.add.text(1080, 690, "Shop",{fontSize: "20px"})
	stuff.shopImg = base.add.image(1180, 640, 'shop').setScale(0.3)
		.setInteractive().on('pointerdown', function(){setState('shop', true, true)}).on('pointerover', function(){
			stuff.shopTxt.setVisible(true);this.setScale(0.4)}).on('pointerout', function(){stuff.shopTxt.setVisible(false);this.setScale(0.3)})

	//workers icon
	stuff.workTxt = base.add.text(60, 690, "Workers",{fontSize: "20px"})
	stuff.workImg = base.add.image(100, 640, 'work').setScale(.8)
		.setInteractive().on('pointerdown', function(){setState('work', false, true)}).on('pointerover', function(){
			stuff.workTxt.setVisible(true);this.setScale(0.7)}).on('pointerout', function(){stuff.workTxt.setVisible(false);this.setScale(0.8)})

	//workers list
	stuff.wlistBox = base.add.rectangle(760, 636, 540, 170, 0xbf6c45);
	stuff.wListTtl = base.add.graphics().fillStyle(0x6D3B24, 0.4)
	.fillRoundedRect(490, 510, 380, 40, { tl: 30, tr: 0, bl: 0, br: 0 })
	.fillStyle(0x000000)
	.fillRoundedRect(800, 510, 230, 40, { tl: 0, tr: 30, bl: 0, br: 0 })
	let pos = [{x:530, y: 590}, {x:710, y: 590}, {x:890, y: 590},
		{x:530, y: 670}, {x:710, y: 670}, {x:890, y: 670}];
		let workNames = Object.keys(profile.workers);
		let ttlMines = 0;
		for(let po in pos){
			let index = pos.indexOf(pos[po]);
			if(profile.workers[workNames[index]] === true){
				stuff[index+ "wImgs"] = (base.add.image(pos[po].x, pos[po].y, workNames[index]).setScale(0.6))
				stuff[index+ "wTxts"] = (base.add.text(pos[po].x+ 38, pos[po].y - 20, workNames[index], {fontStyle:"bold", fontSize: "22px"}))
				stuff[index+ "wCosts"] = (base.add.text(pos[po].x+ 34, pos[po].y, `+${workerMines[index]} mines/hr`))
				ttlMines += workerMines[index];
			}else {
				stuff[index+ "wImgs"] = (base.add.rectangle(pos[po].x, pos[po].y, 60, 60, 0xFFFFFF));
				stuff[index+ "wTxts"] = (base.add.text(pos[po].x+ 38, pos[po].y - 20, "???", {fontStyle:"bold", fontSize: "22px"}))
			}
		}
		stuff.wListTxt = base.add.text(500, 520, `Hired Workers		  +${ttlMines} mines/hr`, {fontSize: "30px", fontStyle:"bold"})

	//top text
	stuff.topTxt = base.add.text(640, 140, "Get Grinding!", {font:"30px Arial", fill:"#ffffff"}).setOrigin(0.5)
	
	//full screen
	stuff.fullScreen = base.add.image(450, 36, 'fullscreen').setScale(0.6).setInteractive()
	.on('pointerdown', function(){
		if (document.fullscreenElement) document.exitFullscreen();
		else document.body.requestFullscreen();
	})

}

//shop page
function shop(){
	stuff.slots = base.add.graphics().fillStyle(0x59463B)
	.fillRoundedRect(160, 60, 400, 60, 10)
	stuff.sellResTxt = base.add.text(180, 70, "SELL MINERALS" , {fontSize:"40px", fontStyle:"bold"})
	res = Object.keys(sampleProfile.res)
	let no = 0;
	i = 160;
	while (i < 1000){
		stuff.slots.fillStyle(0x59463B, 0.8).fillRoundedRect(i, 140, 120, 180, 10).fillStyle(0xffffff, 0.8)
		stuff.slots.fillRoundedRect(i+20, 160, 80, 80, 10)
		stuff[res[no]+"Icon"] = base.add.image(i+60, 200, res[no]).setScale(0.4);
		stuff[res[no]+"Txt"] = base.add.text(i+60, 250, res[no]).setOrigin(0.5);
		stuff[res[no]+"sOneBox"] = base.add.rectangle(i+30, 280,50,20).setOrigin(0.5).setFillStyle(0xc76a2c)
		.setInteractive().on('pointerdown', function(){
			let item = Object.keys(stuff).find(key => stuff[key] === this).slice(0, -7);
			if(profile.res[item] > 0){
				updateInv(item, -1);
				transact(orePrice[res.indexOf(item)])
				setState("shop", true, true)
			}
		});
		stuff[res[no]+"sAllBox"] = base.add.rectangle(i+90, 280,50,20, 0x9e6c33).setOrigin(0.5)
		.setInteractive().on('pointerdown', function(){
			let item = Object.keys(stuff).find(key => stuff[key] === this).slice(0, -7);
			if(profile.res[item] > 0){
				let amt = profile.res[item]
				updateInv(item, -(amt));
				transact(amt * orePrice[res.indexOf(item)])
				setState("shop", true, true)
			}
		});
		stuff[res[no]+"sOneTxt"] = base.add.text(i+30, 295,`ONE\n\n${profile.res[res[no]] ? orePrice[no] : 0} $`).setOrigin(0.5)
		stuff[res[no]+"sAllTxt"] = base.add.text(i+90, 295,`MAX\n\n${profile.res[res[no]] * orePrice[no]} $`).setOrigin(0.5)
		no++
		i += 140
	}
	let x = 160;
	let ant = Object.keys(profile.antiques);
	stuff.slots.fillStyle(0x59463B).fillRoundedRect(160, 360, 400, 60, 10)
	stuff.sellResTxt = base.add.text(180, 370, "SELL ANTIQUES" , {fontSize:"40px", fontStyle:"bold"})
	for(no = 0; no < 5; no++){
	stuff.slots.fillStyle(0xc98b69, 0.8).fillRoundedRect(x, 440, 150, 260, 10).fillStyle(0xe6c873, 0.8)
	stuff.slots.fillRoundedRect(x+15, 460, 120, 120, 10)
	stuff[ant[no]+"A_Icon"] = base.add.image(x+75, 520, ant[no]).setScale(1);
	stuff[ant[no]+"A_Txt"] = base.add.text(x+75, 600, ant[no], { fontSize: "26px"}).setOrigin(0.5);
	stuff[ant[no]+"A_Buy"] = base.add.rectangle(x+75, 640, 100, 40).setOrigin(0.5).setFillStyle(0xc46d1b)
	.setInteractive().on('pointerdown', function(){
		let item = Object.keys(stuff).find(key => stuff[key] === this).slice(0, -5);
		if(profile.antiques[item] > 0){
			transact(antiquePrice[ant.indexOf(item)])
			profile.antiques[item]--;
			setState("shop", true, true);
		}
	})
	stuff[ant[no]+"A_Price"] = base.add.text(x+75, 640, antiquePrice[no] + "$", { fontSize: "26px"}).setOrigin(0.5);
	stuff[ant[no]+"A_Owned"] = base.add.text(x+75, 680, "You own:" + profile.antiques[ant[no]]).setOrigin(0.5);
	x += 170
	}
}
//workers page
function work(){
stuff.workersBox = base.add.graphics().fillStyle(0x59463B, 1)
	.fillRoundedRect(20, 140, 1240, 560, 30)
stuff.wrkTtle = base.add.text(640, 180, "Hire Workers", {fontSize: "50px", fontStyle: "bold"}).setOrigin(0.5)

let wrkrs = Object.keys(sampleProfile.workers)
let no = 0;
let postns = [{x:100, y: 360}, {x:500, y: 360}, {x:900, y: 360},
			  {x:100, y: 580}, {x:500, y: 580}, {x:900, y: 580}];

for(no;no <= 5; no++){
	let pos = postns[no]
stuff[wrkrs[no] + "Img"] = base.add.image(pos.x, pos.y, wrkrs[no]).setScale(1.6)
stuff[wrkrs[no] + "Name"] = base.add.text(pos.x+ 100, pos.y - 80, wrkrs[no].toUpperCase(), {fontSize: "40px", fontStyle:"bold"})
stuff[wrkrs[no] + "Mines"] = base.add.text(pos.x+ 90, pos.y - 30, `+${workerMines[no]} mines/hr`, {fontSize: "30px"})
stuff[wrkrs[no] + "HireBtn"] = base.add.rectangle(pos.x + 180, pos.y + 40 ,160,60).setOrigin(0.5).setFillStyle((profile.workers[wrkrs[no]] === false) ? 0xc76a2c : 0x402717)
.setInteractive().on('pointerdown', function(){
	let worker = Object.keys(stuff).find(key => stuff[key] === this).slice(0, -7);
	if(profile.workers[worker] === false && profile.balance >= workerCost[[Object.keys(profile.workers).indexOf(worker)]]){
		profile.workers[worker] = true;
		transact(-(workerCost[Object.keys(profile.workers).indexOf(worker)]))
		setState("work", false, true)
	}
});
stuff[wrkrs[no] + "HireTxt"] = base.add.text(pos.x+ 140, pos.y + 20,(profile.workers[wrkrs[no]] === false) ? (workerCost[no] + " $") : "HIRED", {fontSize: "30px"})
}
}

//blacksmith page
function blacksmith(){
	stuff.bSmith = base.add.graphics().fillStyle(0x8f593b, 0.8)
	.fillRoundedRect(20, 140, 1000, 560, 30)
	stuff.bSmithText = base.add.text( 40, 160, "CRAFT ANTIQUES", {font:"30px Arial"})
	stuff.bSmithStext = base.add.text( 200, 540, "SELECT AN ANTIQUE TO CRAFT", {font:"40px Arial"}).setAlpha(0.7)
	let x= 120;
	let names = Object.keys(profile.antiques)
	for(let i = 0; i < 5; i++){
	stuff["bSmithRect"+i] = base.add.rectangle(x, 300, 160, 160).setFillStyle(0xc98b69).setInteractive()
	.on('pointerdown', function(){
		let item = parseInt(Object.keys(stuff).find(key => stuff[key] === this).slice(10, 11))
		let itemReq = antiqueReqs[item].split("; ");
		stuff.a_bSmithRect = base.add.rectangle(520, 540, 900, 280).setFillStyle(0xc98b69);
		stuff.a_bSmithImg = base.add.image(200, 500, names[item]).setScale(2);
		stuff.a_bSmithTxt = base.add.text(140, 600, names[item], {font:"40px Arial"});
		stuff.a_reqTtl = base.add.text(500, 440, "REQUIREMENTS", { font:"30px Arial"}).setOrigin(0.5)
		stuff.a_req = base.add.text(440, 480, itemReq.join("\n"), { font:"26px Arial"})
		stuff.a_craft = base.add.rectangle(800, 500, 200, 80).setFillStyle(0xcf5a1b).setInteractive()
		.on('pointerdown', function(){
			for(itm in itemReq){
				let reqItem = itemReq[itm].split(" ")[0].trim();
				let reqAmt = parseInt(itemReq[itm].split(" ")[1]);
				if(profile.res[reqItem] < reqAmt) return;
			}
			//transact
			for(itm in itemReq){
				profile.res[itemReq[itm].split(" ")[0].trim()] -= parseInt(itemReq[itm].split(" ")[1])
			}
			profile.antiques[names[item]]++
			floatText("Crafted a "+ names[item], 800, 500);
		});
		stuff.a_craftTxt = base.add.text(800, 500, 'CRAFT!',{fontSize:"38px", fontStyle:"bold"}).setOrigin(0.5);
	})
	stuff["bSmithImg"+i] = base.add.image(x, 300, names[i]).setScale(1.2)
	
	x+= 200;
	}
}

//runs every x seconds
function tick(){
	profile.hoursPassed++
let b = profile.balance;
let txt = "";
	//edit toptext
	if(b <=30) txt="Your wealth is equivalent to that of a peasant";
	else if(b <=60) txt="You are struggling to make ends meet";
	else if(b <=100) txt="You live from hand to mouth";
	else if(b <=300) txt="You have some savings, but you need to be careful with your spending";
	else if(b <=500) txt="You have a comfortable lifestyle, but you're not exactly wealthy";
	else if(b <=1000) txt="You can afford to travel in relative comfort";
	else if(b <=4000) txt="You have substantial assets, but you're not among the wealthiest people";
	else if(b <=10000) txt="You have substantial assets, but you're not among the wealthiest people";
	else if(b === Infinity) txt="What's the point of cheating BRUH";

if (stuff.topTxt && stuff.topTxt.active === true) stuff.topTxt.text = txt;
	//automine
	let sum = 0
	Object.keys(profile.workers).forEach((key, index) => {
  if (profile.workers[key] === true) sum += workerMines[index];
});
if ((sum > 0)&&((stuff.wListTxt) && (stuff.wListTxt.active === true))) floatText(sum + " mines", 840, 500);
	mine(sum)
	//update time passed
	elaspedTxt.text = elapseFormat(profile.hoursPassed)
}

function elapseFormat(hours) {
	var totalDays = Math.floor(hours / 24);
	var totalHours = hours % 24;
	var years = Math.floor(totalDays / 365);
	var months = Math.floor((totalDays % 365) / 30);
	var days = (totalDays % 365) % 30;
  
	//formatted string
	var output = '';
	if (years > 0) {output += years + 'y, ';
	}
	if (months > 0) {output += months + 'm, ';
	}
	if (days > 0) {output += days + 'd and ';
	}
	output += totalHours + 'h ago';
  
	return output.trim();
  }
  
function transact(money){
	//add or remove money
	profile.balance += (money || 0);
	cashTxt.text = profile.balance + " $"
}

function click(){
	profile.clicks += 1;
	//update total clicks
	ttlClicksTxt.text = profile.clicks + " total clicks";
	return mine(1)
}

function mine(n){
let res = profile.res;
let itm;
for(let i= 0; i < n; i++){
	if(Math.random() < 0.3){
		//if the mining is successful
		let chance = Math.random();
		if (chance <= 0.5) {res.stone++; itm="stone"} //50%
		else if (chance <= 0.8) {res.iron++; itm="iron"} //30%
		else if (chance <= 0.915) {res.copper++;itm="copper"} //11.5%
		else if (chance <= 0.975) {res.gold++;itm="gold"} //5%
		else if (chance <= 0.995) {res.emerald++;itm="emerald"} //1.5%
		else if (chance <= 0.998) {res.diamond++; itm="diamond"} //0.3%
		else {itm="antique!"; return makeAntique();} //antique pieces
	
	}else{
		//give x $ to user if not successful
		profile.balance += (Math.random()< 0.6) ? 1 : 0;
		cashTxt.text = `${profile.balance} $`
		itm="1$ "
	}
}
	updateInv()
	return itm;
}

function updateInv(item, amount){
	let min = profile.res
	if(!item){
		let minerals = Object.keys(min);
		let oldInv = stuff.invTxt.text.split("\n\n")
		let newInv = Object.values(min)
		for (let i = 0; i < oldInv.length; i++) {
			let oldNum = parseInt(oldInv[i]);
			let newNum = parseInt(newInv[i]);
			if (newNum > oldNum) {
			stuff[`min${i+1}`].scale += .08
			setTimeout(function() {
				stuff[`min${i+1}`].scale = 0.4;
			  }, 200);
			}
		  
		}
	}else min[item] += (amount || 1)
	
	stuff.invTxt.text = `${min.stone}\n\n${min.iron}\n\n${min.copper}\n\n${min.gold}\n\n${min.emerald}\n\n${min.diamond}`
}

function floatText(text, x, y){
	  const textObj = base.add.text(x, y, text, {
		font: '24px Arial',
		fill: '#ffffff'
	  });

  const segmentPositions = [];
  for (let i = 0; i < 20; i++) {
    segmentPositions.push({
      x: x, y: y + (i % 2 === 0 ? i * -5 : (i + 1) * -5)
    });
  }

	floaTween = base.tweens.add({
    targets: textObj,
    y: '-=80',
    ease: 'Power1',
    duration: 1000,
    onUpdate: (tween, target) => {
	target.alpha -= 0.01
      const segmentIndex = Math.floor(tween.progress * 20);
      const segment = segmentPositions[segmentIndex];
      if (segment) {
        target.x = segment.x;
        target.y = segment.y;
      }
    },
    onComplete: () => {
      textObj.destroy();
    }
  });


	}

function save(){
let enData = CryptoJS.AES.encrypt(JSON.stringify(profile), 'openkeyLOL').toString();
document.cookie = "pro="+enData;
floatText("Saved!",60, 80)
console.log("Saved!")
}

function makeAntique(name){
	let antiqList = Object.keys(profile.antiques)
	if(!name) return profile.antiques[antiqList[Math.floor(Math.random() * antiqList.length)]]++;

return profile.antiques[name] ++;
}