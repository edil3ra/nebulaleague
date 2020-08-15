import { Player, PlayerDirection } from './player'
import { MainScene } from './scenes/mainScene'
import { BehaviorTreeBuilder, BehaviorTreeStatus, TimeData, IBehaviorTreeNode } from 'ts-behavior-tree'
import { PlayerAIConfig } from './playersAI'
import * as steering from './steering'

export const SEEK_BEHAVIOUR = 'seek'
export const WANDER_BEHAVIOUR = 'wander'


export class PlayerAI {
    public scene: MainScene
    public player: Player
    public players: Array<Player>
    public playersInHittableRange: Array<Player>
    public playersInViewRange: Array<Player>
    public steeringsForce: Array<Phaser.Math.Vector2>
    public steeringsBehaviour: Array<string>
    public wander: steering.Wander
    public tree: IBehaviorTreeNode
    
    
    constructor(
        scene: MainScene,
        player: Player,
        players: Array<Player>,
        playerConfig: PlayerAIConfig
    ) {
        this.scene = scene
        this.player = player
        this.players = players
        this.playersInHittableRange = []
        this.playersInViewRange = []
        this.steeringsForce = []
        this.steeringsBehaviour = []
        this.wander = playerConfig.wander
        this.tree = this.buildTree()
    }

    public buildTree(): IBehaviorTreeNode  {
        const builder = new BehaviorTreeBuilder()
            .Selector('attackingSelector')
            .Do('attackingAction', () => {
                if (this.playersInHittableRange.length > 0) {
                    this.doSeekTarget()
                    this.doAttack()
                    return BehaviorTreeStatus.Success
                }
                return BehaviorTreeStatus.Failure
            })
            .Do('seekingAction', () => {
                if (this.playersInViewRange.length > 0) {
                    // this.doSeekTarget()
                    return BehaviorTreeStatus.Success                    
                }
                return BehaviorTreeStatus.Failure
            })
            .Do('defaultAction', () => {
                if (!(this.playersInViewRange.length > 0) && !(this.playersInHittableRange.length > 0)) {
                    this.doWander()
                    return BehaviorTreeStatus.Success
                }
                return BehaviorTreeStatus.Failure
            })
            .End()
            .Build()
        return builder
    }


    public update(deltaTime: number) {
        this.steeringsForce = []
        this.steeringsBehaviour = []
        this.setPlayersInVisibleRange()
        this.setPlayersInHittableRange()
        this.tree.Tick(new TimeData(deltaTime))
    }


    public setPlayersInVisibleRange(): void {
        const playersInRange = []
        const width = this.scene.scale.gameSize.width
        const height = this.scene.scale.gameSize.height
        const x = this.player.x - width / 2
        const y = this.player.y - height / 2
        const squareVision = new Phaser.Geom.Rectangle(x, y, width, height)
        for (const otherPlayer of this.players ) {
            if (otherPlayer.id !== this.player.id &&
                squareVision.contains(otherPlayer.x, otherPlayer.y)) {
                playersInRange.push(otherPlayer)
            }
        }
        this.playersInViewRange = playersInRange
    }


    public setPlayersInHittableRange(): void {
        const playersInRange = []
        const distance = this.player.weaponPrimary.getDistance()
            
        const circleVision = new Phaser.Geom.Circle(
            this.player.x,
            this.player.y,
            distance
        )

        for (const otherPlayer of this.playersInViewRange ) {
            if (otherPlayer.id !== this.player.id &&
                circleVision.contains(otherPlayer.x, otherPlayer.y)) {
                playersInRange.push(otherPlayer)
            }
        }
        this.playersInHittableRange = playersInRange
    }


    public sumSteeringsForce(): Phaser.Math.Vector2 {
        const netForce = Phaser.Math.Vector2.ZERO.clone()
        for(let i=0; i < this.steeringsForce.length; i++ ) {
            netForce.add(this.steeringsForce[i])
        }
        return netForce
    }
    

    public doSeekTarget(): void {
        const target = this.playersInViewRange[0].body.position
        const newForce = steering.seekSteer(this.player.body, target)
        this.steeringsBehaviour.push(SEEK_BEHAVIOUR)
        this.steeringsForce.push(newForce)
        this.player.body.acceleration = newForce
    }


    public doWander(): void {
        const body = this.player.body as Phaser.Physics.Arcade.Body
        const newForce = steering.limit(steering.wander(this.player.body, this.wander), 1000)
        this.steeringsBehaviour.push(WANDER_BEHAVIOUR)
        this.steeringsForce.push(newForce)
        this.wander.angle += Phaser.Math.Between(-this.wander.variance, this.wander.variance)
        body.acceleration = newForce
        body.rotation = steering.facing(this.player.body)
    }

    
    public doAttack(): void {
        const choosenTarget: Player = Phaser.Math.RND.pick(this.players)

        const angle = Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            choosenTarget.x,
            choosenTarget.y,
        )
        const handicapPrecision = Phaser.Math.RND.normal() / 8
        // improve make the ia anticipate your moves
        this.player.rotation = angle + Math.PI / 2 + handicapPrecision
        this.player.fire()
    }

}