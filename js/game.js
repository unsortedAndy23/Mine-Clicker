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
		teapot: 0, //iron
		ring: 0, //gold & diamond
		globe: 0, //stone & copper
		sword: 0, //iron & copper
		wand: 0, //gold and emerald
		crown: 0 //gold, emerald & diamond
	}
}

//ore price list
let orePrice = [2, 4, 5, 10, 15, 22]
let workerCost = [30, 60, 100, 200, 350, 700];
let workerMines = [1, 2, 3, 4, 4, 6];
var game = new Phaser.Game(config);

//required var
let version = "3.6.0";
let minePerClick = 1;
let profile;
let floatTimer;
let elaspedTxt, usernameTxt, ttlClicksTxt, cashTxt;
let base; //main object
let stuff = new Object(); //object inside
function preload() {
	this.load.image('background', '../assets/images/bg_cave.jpg');
	this.load.image('mineLogo', '../assets/images/mine.png');
	this.load.image('save','../assets/images/save.png');
	this.load.image('ironsmith','../assets/images/ironsmith.png');
	this.load.image('shop','../assets/images/shop.png');
	this.load.image('work','../assets/images/work.png');
	this.load.image('home','../assets/images/home.png');
	
	//loading minerals
	this.load.image('stone','../assets/images/minerals/stone.png');
	this.load.image('iron','../assets/images/minerals/iron.png');
	this.load.image('copper','../assets/images/minerals/copper.png');
	this.load.image('gold','../assets/images/minerals/gold.png');
	this.load.image('emerald','../assets/images/minerals/emerald.png');
	this.load.image('diamond','../assets/images/minerals/diamond.png');
	
	//loading employees
	this.load.image('alex','../assets/images/employees/alex.png');
	this.load.image('dave','../assets/images/employees/dave.png');
	this.load.image('harry','../assets/images/employees/harry.png');
	this.load.image('john','../assets/images/employees/john.png');
	this.load.image('julie','../assets/images/employees/julie.png');
	this.load.image('marrie','../assets/images/employees/marrie.png');
	
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
	console.log(profile);
	
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
	
}

function setState(state, showInv, showHome ){
	console.log("State changed to " + state)
	//clear slate
	for (const child of Object.values(stuff)) {
			child.destroy();
			delete stuff[child]
	}
		console.log(stuff)	

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
	
	//temporary delete data button (for dev purpose)
	base.delBtn = base.add.rectangle(300, 50, 180, 60, 0xff0000).setAlpha(0.7)
	.setInteractive().on('pointerdown', function(){
		document.cookie = "pro=clear";
		console.log(document.cookie)
		location.reload(true)
	})
	base.delTxt = base.add.text(220, 30, "DELETE!", {fontSize: "36px"})

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

	//states :- 'home', 'shop', 'ironsmith', 'work', 'antiques'
	if((!state) || (state === 'home')) home();
	else if(state === 'shop') shop();//shop
	else if(state === 'ironsmith') return; //ironsmith
	else if(state === 'work') return work(); //work
}



function update() {
	
}

//home page
function home(){
	//mine button
	stuff.mineBg = base.add.graphics().fillStyle(0xC36D1D, 0.22).fillCircle(680, 300, 100).fillCircle(680, 300, 120)
	stuff.mineBtn = base.add.sprite(684, 300, 'mineLogo').setScale(0.4).setInteractive()
	.on('pointerdown', function(pointer) {
	  this.scale -= 0.05;
	  //add clicks
	  click()
    floatText("Click!", pointer.x, pointer.y);
	}).on('pointerup', function() {
		this.scale = 0.4;
	  });

	//ironsmith icon
	stuff.ironsmTxt = base.add.text(30, 230, "Ironsmith",{fontSize: "20px"})
	stuff.ironsmBtn = base.add.rectangle(70, 180, 80, 80, 0xDEBB78).setAlpha(0.56)
		.setInteractive().on('pointerdown', function(){setState('ironsmith', true, true)}).on('pointerover', function(){
			stuff.ironsmTxt.setVisible(true)}).on('pointerout', function(){stuff.ironsmTxt.setVisible(false)})
		stuff.ironsmImg = base.add.image(stuff.ironsmBtn.x, stuff.ironsmBtn.y, 'ironsmith').setScale(4);
	
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
	stuff.wlistBox = base.add.rectangle(760, 636, 540, 170, 0xB18875);
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
}

//shop page
function shop(){
	console.log("Welcome to shop")
	stuff.slots = base.add.graphics().fillStyle(0x59463B)
	.fillRoundedRect(160, 50, 280, 80, 10)
	stuff.sellTxt = base.add.text(180, 70, "SELL" , {fontSize:"40px", fontStyle:"bold"})
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
			console.log(profile.res[item])
			if(profile.res[item] > 0){
				updateInv(item, -1);
				transact(orePrice[res.indexOf(item)])
				setState("shop", true, true)
			}
		});
		stuff[res[no]+"sAllBox"] = base.add.rectangle(i+90, 280,50,20, 0x9e6c33).setOrigin(0.5)
		.setInteractive().on('pointerdown', function(){
			let item = Object.keys(stuff).find(key => stuff[key] === this).slice(0, -7);
			console.log(profile.res[item])
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
	console.log(no)
stuff[wrkrs[no] + "Img"] = base.add.image(pos.x, pos.y, wrkrs[no]).setScale(1.6)
stuff[wrkrs[no] + "Name"] = base.add.text(pos.x+ 100, pos.y - 80, wrkrs[no].toUpperCase(), {fontSize: "40px", fontStyle:"bold"})
stuff[wrkrs[no] + "Mines"] = base.add.text(pos.x+ 90, pos.y - 30, `+${workerMines[no]} mines/hr`, {fontSize: "30px"})
stuff[wrkrs[no] + "HireBtn"] = base.add.rectangle(pos.x + 180, pos.y + 40 ,160,60).setOrigin(0.5).setFillStyle((profile.workers[wrkrs[no]] === false) ? 0xc76a2c : 0x402717)
.setInteractive().on('pointerdown', function(){
	let worker = Object.keys(stuff).find(key => stuff[key] === this).slice(0, -7);
	if(profile.workers[worker] === false && profile.balance >= workerCost[[Object.keys(profile.workers).indexOf(worker)]]){
		profile.workers[worker] = true;
		console.log(Object.keys(profile.workers).indexOf(worker))
		transact(-(workerCost[Object.keys(profile.workers).indexOf(worker)]))
		setState("work", false, true)
	}
});
stuff[wrkrs[no] + "HireTxt"] = base.add.text(pos.x+ 140, pos.y + 20,(profile.workers[wrkrs[no]] === false) ? (workerCost[no] + " $") : "HIRED", {fontSize: "30px"})
}
}

//runs every x seconds
function tick(){
	//adds x clicks
	//tempoarily commented this functionality
	//profile.clicks += minePerClick;
	profile.hoursPassed++

	//automine
	let sum = 0
	Object.keys(profile.workers).forEach((key, index) => {
  if (profile.workers[key] === true) sum += workerMines[index];
});
console.log(sum)
	mine(sum)
	//update time passed
	elaspedTxt.text = elapseFormat(profile.hoursPassed)
	console.log(profile)
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
	console.log(profile.balance)
	cashTxt.text = profile.balance + " $"
}

function click(){
	profile.clicks += minePerClick;
	mine(1)
	console.log(profile)
	//update total clicks
	ttlClicksTxt.text = profile.clicks + " total clicks";
}

function mine(n){
let res = profile.res;
for(let i= 0; i < n; i++){
	if(Math.random() < 0.3){
		//if the mining is successful
		let chance = Math.random();
		if (chance <= 0.5) res.stone++; //50%
		else if (chance <= 0.8) res.iron++; //30%
		else if (chance <= 0.915) res.copper++; //11.5%
		else if (chance <= 0.975) res.gold++; //5%
		else if (chance <= 0.995) res.emerald++; //1.5%
		else if (chance <= 0.998) res.diamond++; //0.3%
		else return makeAntique(); //antique pieces
	
	}else{
		//give x $ to user if not successful
		profile.balance += (Math.random()< 0.6) ? 1 : 0;
		cashTxt.text = `${profile.balance} $`
	}
}
	return updateInv()
}

function updateInv(item, amount){
	if(item) profile.res[item] += (amount || 1)
	let min = profile.res
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

	stuff.floaTween = base.tweens.add({
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
console.log("Saved!")
}

function makeAntique(name){
	let antiqList = Object.keys(profile.antiques)
	if(!name) return profile.antiques[antiqList[Math.floor(Math.random() * antiqList.length)]]++;

return profile.antiques[name] ++;
}