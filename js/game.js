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

var game = new Phaser.Game(config);
function preload() {
	// Insert preload code here
	this.load.spritesheet('myspritesheet', 'assets/images/worker.png', { frameWidth: 108, frameHeight: 140 });
}

function create() {
	// Insert create code here

	
    // Create the sprite
    var sprite = this.add.sprite(100, 100, 'myspritesheet');

    // Create the animation
    this.anims.create({
        key: 'myanimation',
        frames: this.anims.generateFrameNumbers('myspritesheet', { start: 0, end: 15 }),
        frameRate: 10,
        repeat: -1
    });

    // Play the animation
    sprite.anims.play('myanimation', true);
}

function update() {
	// Insert update code here
}