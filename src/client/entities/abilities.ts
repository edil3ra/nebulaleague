import * as _ from 'lodash'
import { AbilityDrawingStyle, AbilityModel, AbilityAction, ProjectileName } from '~/shared/models'
import { Config } from '~/shared/config'
import { GameScene } from '~/client/scenes/gameScene'
import { Player } from '~/client/entities/player'
import { getProjectileDistance, Projectiles } from '~/client/entities/projectiles'

export class Ability {
    public scene: GameScene
    public projectiles: Projectiles
    public name: string
    public frame: string
    public action: AbilityAction
    public cooldownDelay: number
    public drawingStyle: AbilityDrawingStyle
    public projectileKey?: ProjectileName
    public rangeDistance: number
    public radiusDistance: number
    public triggerAfter: number
    public raySize: number
    public rayColor: number
    public rangeDistanceColor: number
    public radiusDistanceColor: number
    public rangeDistanceAlpha: number
    public radiusDistanceAlpha: number
    public rayDistanceAlpha: number
    public rangeGraphics?: Phaser.GameObjects.Graphics
    public radiusGraphics?: Phaser.GameObjects.Graphics
    public rayGraphics?: Phaser.GameObjects.Graphics

    constructor(scene: GameScene, config: AbilityModel) {
        this.scene = scene
        this.projectiles = this.scene.projectiles
        this.name = config.name
        this.frame = config.frame
        this.action = config.action
        this.drawingStyle = config.drawingStyle
        this.projectileKey = config.projectileKey
        this.cooldownDelay = config.cooldownDelay
        this.rangeDistance = config.rangeDistance || 0
        this.radiusDistance = config.radiusDistance || 0
        this.triggerAfter = config.triggerAfter || 0
        this.raySize = config.raySize || 20
        this.rayColor = config.rayColor || 0xffffff
        this.rangeDistanceColor = config.rangeDistanceColor || 0xffffff
        this.radiusDistanceColor = config.radiusDistanceColor || 0xffffff
        this.rangeDistanceAlpha = config.rangeDistanceAlpha || 0.2
        this.radiusDistanceAlpha = config.radiusDistanceAlpha || 0.8
        this.rayDistanceAlpha = config.radiusDistanceAlpha || 1

        switch (config.drawingStyle) {
            case AbilityDrawingStyle.ZoneToPointer:
                this.rangeGraphics = this.scene.add.graphics()
                this.radiusGraphics = this.scene.add.graphics()
                break

            case AbilityDrawingStyle.ZoneFromPlayer:
                this.radiusGraphics = this.scene.add.graphics()
                this.rangeDistance = this.radiusDistance
                break

            case AbilityDrawingStyle.RayFromPlayer:
                this.rangeDistance = getProjectileDistance(this.projectileKey!)
                this.rangeGraphics = this.scene.add.graphics()
                this.rayGraphics = this.scene.add.graphics()
                break
        }
    }
    public draw(player: Player, pointerPosition: Phaser.Math.Vector2): void {
        if (this.radiusGraphics) {
            this.radiusGraphics.clear()
            const targetPosition = this.isInRangeToTrigger(
                new Phaser.Math.Vector2(player.x, player.y),
                pointerPosition
            )
                ? pointerPosition
                : this.getMaxRadiusPosition(player)

            this.radiusGraphics.fillStyle(this.radiusDistanceColor, this.radiusDistanceAlpha)
            this.radiusGraphics.fillCircle(targetPosition.x, targetPosition.y, this.radiusDistance)
            this.radiusGraphics.lineStyle(2, this.radiusDistanceColor, this.radiusDistanceAlpha)
            this.radiusGraphics.strokeCircle(targetPosition.x, targetPosition.y, this.radiusDistance)
        }

        if (this.rangeGraphics) {
            this.rangeGraphics.clear()
            this.rangeGraphics.fillStyle(this.rangeDistanceColor, this.rangeDistanceAlpha)
            this.rangeGraphics.fillCircle(player.x, player.y, this.rangeDistance)
            this.rangeGraphics.lineStyle(2, this.rangeDistanceColor, this.rangeDistanceAlpha)
            this.rangeGraphics.strokeCircle(player.x, player.y, this.rangeDistance)
        }

        if (this.rayGraphics) {
            this.rayGraphics.clear()
            const rayEndPosition = this.getMaxRadiusPosition(player)

            const line = new Phaser.Geom.Line(
                player.x,
                player.y,
                rayEndPosition.x,
                rayEndPosition.y
            )

            this.rayGraphics.lineStyle(this.raySize, this.rayColor, this.rayDistanceAlpha)
            this.rayGraphics.strokeLineShape(line)
        }
    }

    public clearDraw(): void {
        if (this.rangeGraphics) {
            this.rangeGraphics.clear()
        }
        if (this.radiusGraphics) {
            this.radiusGraphics.clear()
        }
        if (this.rayGraphics) {
            this.rayGraphics.clear()
        }
    }

    public isInRangeToTrigger(
        sourcePosition: Phaser.Math.Vector2,
        pointerPosition: Phaser.Math.Vector2
    ): boolean {
        const distance = Phaser.Math.Distance.Between(
            sourcePosition.x,
            sourcePosition.y,
            pointerPosition.x,
            pointerPosition.y
        )
        return distance <= this.rangeDistance
    }

    public getMaxRadiusPosition(player: Player): Phaser.Math.Vector2 {
        return Phaser.Math.Vector2.ONE.clone()
            .setToPolar(player.rotation - Math.PI / 2)
            .scale(this.rangeDistance)
            .add(new Phaser.Math.Vector2(player.x, player.y))
    }

    public trigger(
        player: Player,
        sourcePosition: Phaser.Math.Vector2,
        pointerPosition: Phaser.Math.Vector2
    ): void {
        const targetPosition = this.isInRangeToTrigger(sourcePosition, pointerPosition)
            ? pointerPosition
            : this.getMaxRadiusPosition(player)

        switch (this.action) {
            case AbilityAction.Blink:
                this.scene.tweens.add({
                    targets: player,
                    alpha: { from: 1, to: 0 },
                    duration: this.triggerAfter * 1000,
                    ease: 'Cubic.easeIn',
                    onComplete: () => {
                        player.setPosition(targetPosition.x, targetPosition.y)
                        this.scene.tweens.add({
                            targets: player,
                            alpha: { from: 0.2, to: 1 },
                            duration: this.triggerAfter * 20 * 1000,
                            ease: 'Cubic.easeOut',
                        })
                    },
                })
                break
            case AbilityAction.ProjectileFromPlayer: {
                const rotationFromPlayer = Phaser.Math.Angle.Between(
                    sourcePosition.x,
                    sourcePosition.y,
                    pointerPosition.x,
                    pointerPosition.y
                )
                this.projectiles.fire(this.projectileKey!, player.id, sourcePosition, rotationFromPlayer)
                //TODO replace by action
                break
            }
            case AbilityAction.ProjectileFromPointer:
                this.projectiles.fire(this.projectileKey!, player.id, targetPosition)
                break
        }
    }
}

export function buildAbilities(scene: GameScene): Record<string, Ability> {
    return _.mapValues(Config.abilities, config => new Ability(scene, config))
}
