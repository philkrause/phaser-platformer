function spawnCar(carSprite) {
    console.log("Spawning Car");
    const car = this.add.sprite(Phaser.Math.Between(0, this.gameWidth), this.gameHeight, 'car');
    car.setBounce(1);
    car.setScale(0.5);
    car.setCollideWorldBounds(true);
    car.setVelocity(0, Phaser.Math.Between(-200, 200));
    const carLight = this.lights.addLight(car.x, car.y, 300);
    this.tweens.add({
        targets: [car],
        intensity: {
            value: 1.0,
            duration: 500,
            ease: "Elastic.easeInOut",
            repeat: -1,
            yoyo: true
        }
    });
}
export default spawnCar;
