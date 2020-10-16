import { Config } from '~/shared/config'
import { Event } from '~/shared/events'
import {
    ProjectileModel,
    EffectModel,
    ProjectileChanged,
    ProjectileName,
    ProjectileTemplate,
} from '~/shared/models'
import { MainScene } from '~/client/scenes/mainScene'
import { Player } from '~/client/entities/player'

type Projectile = Bullet | Block

export interface ProjectileInterface {
    fire(position: Phaser.Math.Vector2, rotation: number): void
    actionOnCollision(hittedPlayer: Player): void
    kill(): void
    getChanged(): ProjectileChanged
    // getModel(): ProjectileModel
    fromPlayerId: string
    name: string
    x: number
    y: number
    rotation?: number
    visble?: boolean
    active?: boolean
    body?: Phaser.Physics.Arcade.Body
}

export class Bullet extends Phaser.GameObjects.Sprite implements ProjectileInterface {
    public body: Phaser.Physics.Arcade.Body
    public scene: MainScene
    public name: string
    public fromGroup: ProjectileName
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

    public constructor(scene: MainScene, name: string, projectileTemplate: ProjectileTemplate) {
        super(scene, -10000, -10000, 'atlas', projectileTemplate.frame)
        this.scene = scene
        this.fromGroup = projectileTemplate.name
        this.name = name
        this.name = projectileTemplate.name
        this.lifespan = projectileTemplate.lifespan
        this.speed = projectileTemplate.speed
        this.damage = projectileTemplate.damage
        this.fromPlayerId = 'unknown'
        this.effects = projectileTemplate.effects || []
        this.killEvent = null
        this.scene.physics.world.enableBody(this, Phaser.Physics.Arcade.DYNAMIC_BODY)
        this.scene.add.existing(this)
        this.radius = projectileTemplate.radius
        this.setDisplaySize(projectileTemplate.radius, projectileTemplate.radius)
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
        this.active = true
        this.visible = true
        this.body.setEnable(true)
        this.body.velocity.x = ux * this.speed
        this.body.velocity.y = uy * this.speed

        this.initialPosition = initialPosition
        this.goalDistance = Math.round(Projectiles.getDistance(this.fromGroup))
        this.goalPosition = new Phaser.Math.Vector2(
            this.initialPosition.x + this.goalDistance,
            this.initialPosition.y + this.goalDistance
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
                        },
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
    public fromGroup: ProjectileName
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

    public constructor(scene: MainScene, name: string, projectileTemplate: ProjectileTemplate) {
        super(scene)
        this.fromPlayerId = 'unkown'
        this.fromGroup = projectileTemplate.name
        this.radius = projectileTemplate.radius
        this.lifespan = projectileTemplate.lifespan
        this.damage = projectileTemplate.damage
        this.effects = projectileTemplate.effects || []
        this.fillColor = projectileTemplate.fillColor
        this.strokeColor = projectileTemplate.strokeColor
        this.fillAlpha = projectileTemplate.fillAlpha
        this.strokeAlpha = projectileTemplate.strokeAlpha
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
    public constructor(scene: MainScene, name: string, projectileTemplate: ProjectileTemplate) {
        super(scene, name, projectileTemplate)
        this.triggerAfter = projectileTemplate.triggerAfter
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
            },
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
    public constructor(scene: MainScene, name: string, projectileTemplate: ProjectileTemplate) {
        super(scene, name, projectileTemplate)
        this.tick = projectileTemplate.tick
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
    public projectileByIds: Map<string, Projectile>
    public scene: MainScene
    constructor(scene: MainScene) {
        this.projectiles = new Map<string, Phaser.Physics.Arcade.Group>()
        this.projectileByIds = new Map<string, Projectile>()
        this.scene = scene
        
        this.addProjectile(Config.projectiles.pistolBullet, 200)
        this.addProjectile(Config.projectiles.ak47Bullet, 200)
        this.addProjectile(Config.projectiles.p90Bullet, 200)
        this.addProjectile(Config.projectiles.revolverBullet, 200)
        this.addProjectile(Config.projectiles.thompsonBullet, 200)
        this.addProjectile(Config.projectiles.chargedArrowProjectile, 20)
        this.addProjectile(Config.projectiles.flameProjectile, 20)
        this.addProjectile(Config.projectiles.rootTipProjectile, 20)
        this.addProjectile(Config.projectiles.frozenWaveProjectile, 40)
        this.addProjectile(Config.projectiles.psychicWaveProjectile, 40)
        this.addProjectile(Config.projectiles.lightningWaveProjectile, 40)
        this.addProjectile(Config.projectiles.fireWaveProjectile, 40)
    }

    public addProjectile(projectileTemplate: ProjectileTemplate, length: number): void {
        const group = new Phaser.Physics.Arcade.Group(this.scene.physics.world, this.scene)

        const indexes = [...Array(length).keys()]
        indexes.forEach((index) => {
            let projectile
            const projectileName = `${projectileTemplate.name}-${index}`

            switch (projectileTemplate.className) {
                case 'Bullet':
                    projectile = new Bullet(this.scene, projectileName, projectileTemplate)
                    break
                case 'BlockWithTick':
                    projectile = new BlockWithTick(this.scene, projectileName, projectileTemplate)
                    break
                case 'BlockWithDelay':
                    projectile = new BlockWithDelay(this.scene, projectileName, projectileTemplate)
                    break
            }
            group.add(projectile)
        })
        this.projectiles.set(projectileTemplate.name, group)
    }



    public static getTimeToReachTarget(fromProjectilesGroup: ProjectileName, targetDistance: number) {
        if (Config.projectiles[fromProjectilesGroup].speed) {
            return targetDistance / Config.projectiles[fromProjectilesGroup].speed
        } else if (Config.projectiles[fromProjectilesGroup]?.triggerAfter) {
            return Config.projectiles[fromProjectilesGroup].triggerAfter
        } else {
            return 0
        }
    }

    public static getDistance(fromProjectilesGroup: ProjectileName): number {
        const projectileConfig = Config.projectiles[fromProjectilesGroup]
        return projectileConfig.speed * projectileConfig.lifespan
    }

    public getProjectile(name: string): ProjectileInterface {
        const fromProjectilesGroup = name.split('-')[0]
        const projectile = this.projectiles.get(fromProjectilesGroup).children.get('name', name as any) as any
        return projectile as ProjectileInterface
    }

    public fire(
        fromProjectilesGroup: string,
        fromPlayerId: string,
        position: Phaser.Math.Vector2,
        rotation?: number
    ): void {
        const projectileGroup = this.projectiles.get(fromProjectilesGroup)
        const projectile = projectileGroup.getFirstDead()
        projectile.fromPlayerId = fromPlayerId
        this.projectileByIds.set(projectile.name, projectile)
        projectile.fire(position, rotation)
    }

    public getAll(): Array<Phaser.Physics.Arcade.Group> {
        return Array.from(this.projectiles.values())
    }
}
