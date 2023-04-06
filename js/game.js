var config = {
	type: Phaser.AUTO,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: window.innerWidth,
		height: window.innerHeight
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
	hoursPassed: 0
}

var game = new Phaser.Game(config);

//required var
let version = "1.1.0";
let minePerClick = 1;
let profile;
let elasped;

function preload() {
	this.load.image('background', '../assets/images/bg_cave.jpg');
	this.load.image('mineLogo', '../assets/images/mine.png');
	this.load.image('save','../assets/images/save.png');

	
	if(document.cookie){

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
	//adding background
	let background = this.add.image(0, 0, 'background');
	background.setOrigin(0, 0);
	background.setScale(this.game.config.width / background.width, this.game.config.height / background.height);

	//tick timer every 3 sec.
	this.time.addEvent({ 
        delay: 3 * 1000,
        callback: tick,
        callbackScope: this,
        loop: true
    });


	//mine button
	this.add.graphics().fillStyle(0xC36D1D, 0.22).fillCircle(400, 300, 70).fillCircle(400, 300, 90)
	this.mineBtn = this.add.sprite(404, 300, 'mineLogo').setScale(0.20).setInteractive()
	.on('pointerdown', function() {
	  this.scale -= 0.05;
	  //add clicks
	  click()	
	  setTimeout(() => {this.scale += 0.05;}, 100);
	});

	//save button & text
	let saveTxt = this.add.text(30, 70, "Save")
	this.saveBtn = this.add.rectangle(50, 50, 40, 40, 0xDBB941).setAlpha(0.7)
	.setInteractive().on('pointerdown', save).on('pointerover', function(){
		saveTxt.setVisible(true)
	}).on('pointerout', function(){
		saveTxt.setVisible(false)
	})
	this.add.image(this.saveBtn.x, this.saveBtn.y, 'save').setScale(0.1);

	//version
	this.add.graphics().fillStyle(0x000000, 0.9).fillRoundedRect(100, 0, 100, 40, { tl: 0, tr: 0, bl: 12, br: 12 });
	this.add.text(120, 20, "v" + version, {color: '#ffffff'})

	//time passed.
	this.add.graphics().fillStyle(0x000000, 1).fillRoundedRect(260, 0, 300, 70, { tl: 0, tr: 0, bl: 30, br: 30 });
	this.add.text(380, 25, 'Started Journey', {fontSize: "20px"}).setOrigin(0.5);
	elasped = this.add.text(400, 50, elapseFormat(profile.hoursPassed), {fontSize: "20px",fontStyle: "bold"}).setOrigin(0.5);

}

function update() {

}

//runs every x seconds
function tick(){
	//adds x clicks
	//tempoarily commented this functionality
	//profile.clicks += minePerClick;
	profile.hoursPassed++

	//update time passed
	elasped.text = elapseFormat(profile.hoursPassed)
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
  

function click(){
	profile.clicks += minePerClick;
	console.log(profile)
}

function save(){
let enData = CryptoJS.AES.encrypt(JSON.stringify(profile), 'openkeyLOL').toString();
document.cookie = "pro="+enData;
console.log("Saved!")
}