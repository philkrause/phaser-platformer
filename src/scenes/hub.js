
export default class Hub extends Phaser.Scene {

    // Vars
    handlerScene = null

    constructor() {
        super('hub')
    }

    preload() {
        //---------------------------------------------------------------------->
        this.canvasWidth = this.sys.game.canvas.width
        this.canvasHeight = this.sys.game.canvas.height
        this.handlerScene = this.scene.get('handler')
        //Orientation
        this.scale.lockOrientation(this.game.orientation)

        // Bindings        
        //this.pointerUp = pointerUp.bind(this)
        this.creditsTxt = this.add.text(this.canvasWidth / 2, this.canvasHeight - 22, 'Cluster Games 2023', { fontFamily: 'Arial', fontSize: '18px', color: 'black', }).setOrigin(.5).setDepth(1)
    }

    create() {

        let posItemHubBase = 32
        this.quitBtn = this.add.image(posItemHubBase, posItemHubBase, "quit").setOrigin(.5).setDepth(1).setInteractive({ cursor: "pointer" })
        this.quitBtn.visible = false

        // this.pointerUp(() => {
        //     this.clickBackScene(this.handlerScene.sceneRunning)
        // }, this.quitBtn)

        let multiplePosY = this.game.embedded ? 1 : 3
        this.soundBtn = this.add.image(this.canvasWidth - posItemHubBase, posItemHubBase * multiplePosY, "sound").setOrigin(.5).setDepth(1).setInteractive({ cursor: "pointer" })
        this.soundBtn.visible = false

        if (this.game.debugMode) {

            this.soundBtn.setFrame(1)
        } else {
            //this.music.play()
            this.soundBtn.setFrame(0)
        }

        this.soundBtn.on("pointerup", () => {
            if (this.soundBtn.frame.name === 0) {
                this.soundBtn.setFrame(1)

            }
            else {
                this.soundBtn.setFrame(0)

            }
        })

        if (!this.game.embedded) {
            multiplePosY = this.game.embedded ? 3 : 1
            //this.fullscreenBtn = this.add.image(this.canvasWidth - posItemHubBase, posItemHubBase * multiplePosY, "fullscreen", 0).setOrigin(.5).setDepth(1).setInteractive({ cursor: "pointer" })

            // this.fullscreenBtn.on("pointerup", () => {
            //     if (this.scale.isFullscreen) {
            //         this.fullscreenBtn.setFrame(0)
            //         this.scale.stopFullscreen()
            //     }
            //     else {
            //         this.fullscreenBtn.setFrame(1)
            //         this.scale.startFullscreen()
            //     }
            // })
        }
        this.scale.on("resize", this.resize, this)
    }


    update() {
        if (this.handlerScene.sceneRunning === 'title') {
            this.soundBtn.visible = false
            this.quitBtn.visible = false
            this.creditsTxt.visible = false
        } 
        if (this.handlerScene.sceneRunning === 'pick') {
            this.soundBtn.visible = false
            this.quitBtn.visible = false
            this.creditsTxt.visible = false
        }
        if (this.handlerScene.sceneRunning === 'race') {
            this.soundBtn.visible = false
            this.quitBtn.visible = false
            this.creditsTxt.visible = false
        } 

    }

    clickBackScene(sceneTxt) {
        const scene = this.scene.get(sceneTxt)
        let gotoScene
        let bgColorScene

        switch (sceneTxt) {
            case "title":
                this.creditsTxt.visible = false
                return
            case "race":
                this.creditsTxt.visible = false
                return
        }

        scene.sceneStopped = true
        scene.scene.stop(sceneTxt)
        this.handlerScene.cameras.main.setBackgroundColor(bgColorScene)
        this.handlerScene.launchScene(gotoScene)
    }

    resize() {
        //if (!this.game.embedded)
            //this.fullscreenBtn.x = this.scale.gameSize.width - 30
        this.soundBtn.x = this.scale.gameSize.width - 30
        this.creditsTxt.x = this.scale.gameSize.width / 2
        this.creditsTxt.y = this.scale.gameSize.height - 30
    }
}