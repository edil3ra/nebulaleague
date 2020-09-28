import { AnimationHelper } from '~/helpers/animationHelper'
import { MyGame } from '~/index'
import { Client } from '~/client'

export class BootScene extends Phaser.Scene {
    public game: MyGame
    private animationHelperInstance: AnimationHelper
    private loadingBar: Phaser.GameObjects.Graphics
    private progressBar: Phaser.GameObjects.Graphics

    constructor() {
        super({
            key: 'bootScene',
        })
    }

    init(): void {
        if (this.game.debug) {
            window['b'] = this
        }

        this.game.canvas.oncontextmenu = function (e) {
            e.preventDefault()
        }

        const client = new Client(this.game)
        this.registry.set('client', client)
    }

    preload(): void {
        // set the background, create the loading and progress bar and init values
        // with the global data manager (= this.registry)
        this.cameras.main.setBackgroundColor(0x000000)
        this.createLoadingGraphics()

        // pass value to change the loading bar fill
        this.load.on(
            'progress',
            (value) => {
                this.progressBar.clear()
                this.progressBar.fillStyle(0x88e453, 1)
                this.progressBar.fillRect(
                    this.cameras.main.width / 4,
                    this.cameras.main.height / 2 - 16,
                    (this.cameras.main.width / 2) * value,
                    16
                )
            },
            this
        )

        // delete bar graphics, when loading complete
        this.load.on(
            'complete',
            function () {
                // this.animationHelperInstance = new AnimationHelper(
                //   this,
                //   this.cache.json.get("animationJSON")
                // )
                this.progressBar.destroy()
                this.loadingBar.destroy()
            },
            this
        )

        // load templates
        this.load.html('mainMenuHTML', 'assets/html/mainMenu.html')
        this.load.html('mainMenuSceneHTML', 'assets/html/mainMenuScene.html')

        // load our package
        this.load.pack('preload', 'assets/pack.json', 'preload')

        if (this.game.debug) {
            this.load.html('debugMenuHTML', 'assets/html/debugMenu.html')
        }
    }

    update(): void {
        this.scene.start('lobyScene')
    }

    private createLoadingGraphics(): void {
        this.loadingBar = this.add.graphics()
        this.loadingBar.fillStyle(0xffffff, 1)
        this.loadingBar.fillRect(
            this.cameras.main.width / 4 - 2,
            this.cameras.main.height / 2 - 18,
            this.cameras.main.width / 2 + 4,
            20
        )
        this.progressBar = this.add.graphics()
    }
}
