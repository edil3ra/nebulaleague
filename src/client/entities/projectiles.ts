import { Config } from '@shared/config'
import { Event } from '@shared/events'
import { ProjectileModel, EffectModel, ProjectileChanged } from "@shared/models"
import { MainScene } from "~/scenes/mainScene"
import { Player } from "~/entities/player"



export interface ProjectileInterface {
    fire(position: Phaser.Math.Vector2, rotation: number): void
    actionOnCollision(hittedPlayer: Player): void
    kill(): void
    getChanged(): ProjectileChanged
    fromPlayerId: string
    name: string
    x: number
    y: number
    rotation?: number
}


export class Bullet extends Phaser.GameObjects.Sprite implements ProjectileInterface {
    public body: Phaser.Physics.Arcade.Body
    public scene: MainScene
    public key: string
    public lifespan: number
    public speed: number
    public shotInterval: number
    public radius: number
    public goalPosition?: Phaser.Math.Vector2
    public initialPosition?: Phaser.Math.Vector2
    public goalDistance?: number
    public damage?: number
    public fromPlayerId: string
    public killEvent: Phaser.Time.TimerEvent
    public effects?: Array<EffectModel>


    public constructor(scene: MainScene, projectileModel: ProjectileModel) {
        super(scene, -10000, -10000, 'atlas', projectileModel.frame)
        this.scene = scene
        this.key = projectileModel.key
        this.lifespan = projectileModel.lifespan
        this.speed = projectileModel.speed
        this.damage = projectileModel.damage
        this.fromPlayerId = 'unknown'
        this.effects = projectileModel.effects || []
        this.killEvent = null
        this.scene.physics.world.enableBody(this, Phaser.Physics.Arcade.DYNAMIC_BODY)
        this.scene.add.existing(this)
        this.radius = projectileModel.radius
        this.setDisplaySize(projectileModel.radius, projectileModel.radius)
        this.body.setEnable(false)
        this.setActive(false)
        this.setVisible(false)
    }

    public fire(initialPosition: Phaser.Math.Vector2, initialRotation: number) {
        const ux = Math.cos(initialRotation)
        const uy = Math.sin(initialRotation)
        this.body.reset(initialPosition.x, initialPosition.y)
        this.setVisible(true)
        this.setActive(true)
        this.body.setEnable(true)
        this.body.velocity.x = ux * this.speed
        this.body.velocity.y = uy * this.speed

        this.initialPosition = initialPosition
        this.goalDistance = Math.round(Projectiles.getDistance(this.key))
        this.goalPosition = new Phaser.Math.Vector2(
            this.initialPosition.x + this.goalDistance,
            this.initialPosition.y + this.goalDistance,
        )

        this.killEvent = this.scene.time.addEvent({
            repeat: -1,
            callback: () => {
                const currentDistance = Math.round(this.body.center.distance(this.initialPosition))
                if (currentDistance >= this.goalDistance) {
                    this.body.x = this.goalPosition.x
                    this.body.y = this.goalPosition.y
                    this.body.setVelocity(0, 0)
                    this.setVisible(false)
                    this.scene.time.addEvent({
                        callback: () => {
                            this.kill()
                        }
                    })
                    this.killEvent.destroy()
                    this.killEvent = null
                }
            },
            callbackScope: this,
        })
        this.scene.game.events.emit(Event.ProjectileFired, this)
    }


    public actionOnCollision(hittedPlayer: Player) {
        const currentDistance = Math.round(this.body.center.distance(this.initialPosition))
        if (currentDistance <= this.goalDistance) {
            hittedPlayer.hit(this.damage, this.effects)
            this.kill()
            if (this.killEvent) {
                this.killEvent.remove()
                this.killEvent = null
            }
        }
    }

    public kill() {
        this.setActive(false)
        this.setVisible(false)
        this.body.setEnable(false)
        this.body.reset(-10000, -10000)
        this.scene.game.events.emit(Event.ProjectileKilled, this)
    }

    public getChanged(): ProjectileChanged {
        return {
            x: this.body.center.x,
            y: this.body.center.y,
        }
    }
}


export class Block extends Phaser.GameObjects.Graphics {
    public body: Phaser.Physics.Arcade.Body
    public scene: MainScene
    public key: string
    public radius: number
    public lifespan: number
    public damage: number
    public fromPlayerId: string
    public effects?: Array<EffectModel>
    public fillColor: number
    public strokeColor: number
    public fillAlpha: number
    public strokeAlpha: number
    public hittedPlayerIds: Set<string>
    public killedOnHit: boolean


    public constructor(scene: MainScene, blockModel: ProjectileModel) {
        super(scene)
        this.fromPlayerId = 'unkown'
        this.key = blockModel.key
        this.radius = blockModel.radius
        this.lifespan = blockModel.lifespan
        this.damage = blockModel.damage
        this.effects = blockModel.effects || []
        this.fillColor = blockModel.fillColor
        this.strokeColor = blockModel.strokeColor
        this.fillAlpha = blockModel.fillAlpha
        this.strokeAlpha = blockModel.strokeAlpha
        this.scene.physics.world.enableBody(this, Phaser.Physics.Arcade.DYNAMIC_BODY)
        this.scene.add.existing(this)
        this.body.setEnable(false)
        this.body.reset(-10000, -10000)
        this.setActive(false)
        this.setVisible(false)
        this.hittedPlayerIds = new Set()
        this.killedOnHit = false
    }

    public draw() {
        this.clear()
        this.fillStyle(this.fillColor, this.fillAlpha)
        this.fillCircle(0, 0, this.radius)
        this.lineStyle(2, this.strokeColor, this.strokeAlpha)
        this.strokeCircle(0, 0, this.radius)
    }

    public fire(position: Phaser.Math.Vector2) {
        this.body.setEnable(true)
        this.setActive(true)
        this.setVisible(true)
        this.body.reset(position.x, position.y)
        this.body.setCircle(this.radius)
        this.body.setOffset(-this.radius, -this.radius)
        this.draw()

        this.scene.time.addEvent({
            delay: this.lifespan * 1000,
            callback: () => {
                this.kill()
            },
            callbackScope: this,
        })
        this.scene.game.events.emit(Event.ProjectileFired, this)
    }

    public actionOnCollision(hittedPlayer: Player) {
        if (!this.hittedPlayerIds.has(hittedPlayer.id)) {
            hittedPlayer.hit(this.damage, this.effects)
            this.hittedPlayerIds.add(hittedPlayer.id)
        }
    }


    public kill() {
        this.setActive(false)
        this.setVisible(false)
        this.body.setEnable(false)
        this.body.reset(-10000, -10000)
        this.scene.game.events.emit(Event.ProjectileKilled, this)
    }

    public getChanged(): ProjectileChanged {
        return {
            x: this.body.center.x,
            y: this.body.center.y,
        }
    }
    
}

export class BlockWithDelay extends Block implements ProjectileInterface {
    public triggerAfter: number
    public active: boolean
    public constructor(scene: MainScene, blockConfig: ProjectileModel) {
        super(scene, blockConfig)
        this.triggerAfter = blockConfig.triggerAfter
        this.active = false
    }

    public fire(position: Phaser.Math.Vector2) {
        super.fire(position)
        this.active = false

        this.scene.tweens.add({
            targets: this,
            alpha: { from: 0.2, to: 1 },
            duration: this.triggerAfter * 1000,
            ease: 'Cubic.easeIn',
        })

        this.scene.time.addEvent({
            delay: this.triggerAfter * 1000,
            callback: () => {
                this.active = true
            }
        })
    }

    public actionOnCollision(hittedPlayer: Player) {
        if (this.active) {
            super.actionOnCollision(hittedPlayer)
        }
    }
}


export class BlockWithTick extends Block implements ProjectileInterface {
    public tick: number
    public tickTimer: number
    public constructor(scene: MainScene, blockConfig: ProjectileModel) {
        super(scene, blockConfig)
        this.tick = blockConfig.tick
    }

    public fire(position: Phaser.Math.Vector2) {
        super.fire(position)
        this.tickTimer = this.tick
    }

    public actionOnCollision(hittedPlayer: Player) {
        this.tickTimer += this.scene.game.loop.delta / 1000
        if (this.tickTimer >= this.tick) {
            this.tickTimer = 0
            hittedPlayer.hit(this.damage, this.effects)
        }
    }
}



export class Projectiles {
    public projectiles: Map<string, Phaser.Physics.Arcade.Group>
    public projectileByIds: Map<string, Bullet | Block>
    public scene: MainScene
    constructor(scene: MainScene) {
        this.projectiles = new Map()
        this.projectileByIds = new Map()
        this.scene = scene

        this.addProjectile('pistolBullet', Config.projectiles.pistolBullet, 200)
        this.addProjectile('ak47Bullet', Config.projectiles.ak47Bullet, 200)
        this.addProjectile('p90Bullet', Config.projectiles.p90Bullet, 200)
        this.addProjectile('revolverBullet', Config.projectiles.revolverBullet, 200)
        this.addProjectile('thompsonBullet', Config.projectiles.thompsonBullet, 200)
        this.addProjectile('chargedArrowProjectile', Config.projectiles.chargedArrowProjectile, 20)
        this.addProjectile('flameProjectile', Config.projectiles.flameProjectile, 20)
        this.addProjectile('rootTipProjectile', Config.projectiles.rootTipProjectile, 20)
        this.addProjectile('frozenWaveProjectile', Config.projectiles.frozenWaveProjectile, 40)
        this.addProjectile('psychicWaveProjectile', Config.projectiles.psychicWaveProjectile, 40)
        this.addProjectile('lightningWaveProjectile', Config.projectiles.lightningWaveProjectile, 40)
        this.addProjectile('fireWaveProjectile', Config.projectiles.fireWaveProjectile, 40)
    }


    public static getTimeToReachTarget(key: string, targetDistance: number) {
        if (Config.projectiles[key]?.speed) {
            return targetDistance / Config.projectiles[key].speed
        } else if (Config.projectiles[key]?.triggerAfter) {
            return Config.projectiles[key].triggerAfter
        } else {
            return 0
        }
    }


    public static getProjectileByClassName(projectileKeyName: string) {
        return {
            'Bullet': Bullet,
            'BlockWithTick': BlockWithTick,
            'BlockWithDelay': BlockWithDelay,
        }[projectileKeyName]
    }


    public static getDistance(key): number {
        const projectileConfig = Config.projectiles[key]
        return projectileConfig.speed * projectileConfig.lifespan
    }

    public getProjectile(id: string) {
        const [key, index] = id.split('-')
        console.log(key)
        console.log(index)
    }

    public addProjectile(
        key: string,
        projectileConfig: any,
        length: number): void {
        const group = new Phaser.Physics.Arcade.Group(this.scene.physics.world, this.scene)
        const keys = [...Array(length).keys()]
        keys.forEach((index) => {
            const ClassName = Projectiles.getProjectileByClassName(projectileConfig.className)
            const projectile = new ClassName(this.scene, projectileConfig)
            projectile.setName(`${key}-${index}`)
            group.add(projectile)
        })
        this.projectiles.set(key, group)
    }

    public fire(
        key: string,
        fromPlayerId: string,
        position: Phaser.Math.Vector2,
        rotation?: number)
    : void {
        const projectileGroup = this.projectiles.get(key)
        const projectile = projectileGroup.getFirstDead()
        projectile.fromPlayerId = fromPlayerId
        this.projectileByIds.set(projectile.name, projectile)
        projectile.fire(position, rotation)
    }


    public getAll(): Array<Phaser.Physics.Arcade.Group> {
        return Array.from(this.projectiles.values())
    }
}
