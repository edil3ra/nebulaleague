import { MainScene } from './scenes/mainScene'
import { Player, PlayerDirection, SelectedWeapon } from './player'
import { DebugScene } from './scenes/debugScene'


export class MainControl {
    public scene: MainScene
    public controls: any
    constructor (scene: MainScene) {
        this.scene = scene
        this.controls = {
            fullscreen: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
        }
    }
    
    public update(): void {
        const fullscreen = this.scene.input.keyboard.checkDown(this.controls.fullscreen, 200)
        if (fullscreen) {
            if(this.scene.scale.isFullscreen) {
                this.scene.scale.stopFullscreen()
            } else {
                this.scene.scale.startFullscreen()
            }
        }
    }
}


export class PlayerControl {
    public scene: MainScene
    public controls: any
    public player: Player
    public prevMoveLeft: boolean
    public prevMoveRight: boolean
    public prevMoveUp: boolean
    public prevMoveDown: boolean
    public canLeftTrigger: boolean
    public canRightTrigger: boolean
    public active: boolean
    
    constructor(scene: MainScene, player: Player) {
        this.player = player
        this.scene = scene
        this.canLeftTrigger = true
        this.canRightTrigger = true
        this.active = true
        this.controls = {
            moveLeft: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            moveRight: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            moveUp: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA),
            moveDown: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O),
            skill1: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
            skill2: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
            skill3: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
            skill4: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
        }
    }

    public handleMovement(): void {
        const left = this.controls.moveLeft.isDown ? -1: 0
        const right = this.controls.moveRight.isDown ? 1: 0
        const up = this.controls.moveUp.isDown ? -1: 0
        const down =this.controls.moveDown.isDown ? 1: 0
        const playerDirection: PlayerDirection = {
            x: left + right,
            y: up + down,
        }
        this.player.move(playerDirection)
    }

    public handleSwitchWeapon(): void {
        const skill1 = this.scene.input.keyboard.checkDown(this.controls.skill1, 200)
        const skill2 = this.scene.input.keyboard.checkDown(this.controls.skill2, 200)
        const skill3 = this.scene.input.keyboard.checkDown(this.controls.skill3, 200)
        const skill4 = this.scene.input.keyboard.checkDown(this.controls.skill4, 200)


        if (skill1) {
            this.player.selectAbility('ability1')
        }
        else if (skill2) {
            this.player.selectAbility('ability2')
        }
        else if (skill3) {
            this.player.selectAbility('ability3')
        }
        else if (skill4) {
            this.player.selectAbility('ability4')
        }
    }
    
    public handleMouse(): void {
        const pointer = this.scene.input.activePointer
        const angleToPointer = this.scene.angleToPointer(new Phaser.Math.Vector2(this.player.x, this.player.y))
        this.player.rotation = angleToPointer + Math.PI / 2

        if (this.canLeftTrigger) {
            if (pointer.leftButtonDown()) {
                this.player.action(SelectedWeapon.Primary)
                this.canLeftTrigger = false
            }            
        }

        if (this.canRightTrigger) {
            if (pointer.rightButtonDown()) {
                this.player.action(SelectedWeapon.Secondary)
                this.canRightTrigger = false
            }            
        }

        
        if (pointer.leftButtonReleased()) {
            this.canLeftTrigger = true
        }
        if (pointer.rightButtonReleased()) {
            this.canRightTrigger = true
        }
    }

    public toggleActive(): void {
        this.active = !this.active
    }
    
    public handleKeyboard(): void {
        this.handleMovement()
        this.handleSwitchWeapon()
    }
    
    public update(): void {
        if (this.active) {
            this.handleKeyboard()
            this.handleMouse()
        }
    }
}


// const toogleCamera = this.scene.input.keyboard.checkDown(this.controls.toggleCamera, 100)

export class DebugControl {
    public scene: DebugScene
    public controls: any
    public cameraControls: any
    public isFreeCamera: boolean
    public isPaused: boolean
    constructor (scene: DebugScene) {
        this.scene = scene
        this.controls = {
            toggleCamera: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            pause: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P),
            slowGame: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS),
            speedGame: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS),
            resetGame: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
            toggleHelpMenu: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
        }
        this.cameraControls = settingCameraControl(this.scene.mainScene)
    }

    public update(delta: number): void {
        const toggleCameraDown = this.scene.input.keyboard.checkDown(this.controls.toggleCamera, 200)
        const togglePauseDown  = this.scene.input.keyboard.checkDown(this.controls.pause, 200)
        const toggleHelpMenuDown  = this.scene.input.keyboard.checkDown(this.controls.toggleHelpMenu, 200)
        const slowGameDown = this.scene.input.keyboard.checkDown(this.controls.slowGame, 200)
        const speedGameDown  = this.scene.input.keyboard.checkDown(this.controls.speedGame, 200)
        const resetGameSpeedDown  = this.scene.input.keyboard.checkDown(this.controls.resetGame, 200)

        if (toggleCameraDown) {
            if(this.isFreeCamera) {
                this.scene.mainScene.cameras.main.stopFollow()
            } else {
                this.scene.mainScene.cameras.main.startFollow(this.scene.mainScene.player, true)
            }
            this.isFreeCamera = !this.isFreeCamera
        }

        if (togglePauseDown) {
            if(this.isPaused) {
				this.scene.resumeScene()
			} else {
                this.scene.pauseScene()
			}
            this.isPaused = !this.isPaused
        }
        
        if (slowGameDown) {
            this.scene.slowDownGame()
        }

        if (speedGameDown) {
            this.scene.speedUpGame()
        }
        
        if (resetGameSpeedDown) {
            this.scene.resetGameSpeed()
        }
        
        if (toggleHelpMenuDown) {
            this.scene.toggleHelpMenu()
        }

        this.cameraControls.update(delta)
    }
}



export function settingCameraControl(game: MainScene): Phaser.Cameras.Controls.SmoothedKeyControl {
    const cursors = game.input.keyboard.createCursorKeys()
    const controlConfig = {
        camera: game.cameras.main,
        left: cursors.left,
        right: cursors.right,
        up: cursors.up,
        down: cursors.down,
        zoomIn: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        zoomOut: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N),
        acceleration: 0.06,
        drag: 0.0005,
        maxSpeed: 1.0
    }
    return new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig)
}