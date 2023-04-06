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
	}
};

const sampleProfile = {
	name: "guest",
	clicks: 0,
	time: 0
}

var game = new Phaser.Game(config);


//req var
let minePerClick = 1;
let profile;

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
	this.add.image(this.saveBtn.x, this.saveBtn.y, 'save').setScale(0.1)

}

function update() {
//tick

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