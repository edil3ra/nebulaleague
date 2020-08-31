import { Player } from './player'
import { MainScene } from './scenes/mainScene'
import { BehaviorTreeBuilder, BehaviorTreeStatus, TimeData, IBehaviorTreeNode } from 'ts-behavior-tree'
import { PlayerAIConfig } from './playersAI'
import * as steering from './steering'
import { Weapon } from './entities/weapons'
import { Ability } from './entities/abilities'

export const SEEK_BEHAVIOUR = 'seek'
export const FLEE_BEHAVIOUR = 'flee'
export const WANDER_BEHAVIOUR = 'wander'


interface PlayerAIActionsInterface {
    player: Player
    actions: Array<string>
}


export class PlayerAI {
    public scene: MainScene
    public player: Player
    public players: Array<Player>
    public playersInHittableRange: Array<PlayerAIActionsInterface>
    public playersInViewRange: Array<Player>
    public steeringsForce: Array<Phaser.Math.Vector2>
    public steeringsBehaviour: Array<string>
    public wander: steering.Wander
    public weaponPrecisionHandicap: number
    public fleeForSecondRange: [number, number]
    public fleeAfterSecondRange: [number, number]
    public isFleeingInCombat: boolean
    public moveCombatAngleRange: [number, number]
    public actionsTriggerSecondRange: {
        weaponPrimary: [number, number],
        weaponSecondary: [number, number],
        ability1: [number, number],
        ability2: [number, number],
        ability3: [number, number],
        ability4: [number, number],
    }
    public tree: IBehaviorTreeNode
    
    
    constructor(
        scene: MainScene,
        player: Player,
        players: Array<Player>,
        playerConfig: PlayerAIConfig
    ) {
        this.scene = scene
        this.player = player
        this.player.controlledByAI = this
        this.players = players
        this.playersInHittableRange = []
        this.playersInViewRange = []
        this.steeringsForce = []
        this.steeringsBehaviour = []
        this.isFleeingInCombat = false
        this.wander = playerConfig.wander
        this.weaponPrecisionHandicap = playerConfig.weaponPrecisionHandicap
        this.fleeForSecondRange = playerConfig.fleeForSecondRange
        this.fleeAfterSecondRange = playerConfig.fleeAfterSecondRange
        this.moveCombatAngleRange = playerConfig.moveCombatAngleRange
        this.actionsTriggerSecondRange = playerConfig.actionsTriggerSecondRange
        this.tree = this.buildTree()
        
        if (this.scene.game.debug) {
            window[`ia-${player.id}`] = this
        }
    }

    public buildTree(): IBehaviorTreeNode  {

        const builder = new BehaviorTreeBuilder()
            .Selector('attackingSelector')
            .Do('playersInHittableRange', () => {
                if (this.playersInHittableRange.length > 0) {
                    const choosenTarget = Phaser.Math.RND.pick(this.playersInHittableRange)
                    const choosenActionKey = Phaser.Math.RND.pick(choosenTarget.actions)
                    if (choosenActionKey === undefined) {
                        this.doMoveInCombat(choosenTarget)
                    }
                    else {
                        if (this.shouldAttack(choosenActionKey)) {
                            this.doAttack(choosenTarget, choosenActionKey)
                        } else {
                            this.doMoveInCombat(choosenTarget)
                        }
                    }
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


    public update() {
        this.steeringsForce = []
        this.steeringsBehaviour = []
        this.setPlayersInVisibleRange()
        this.setPlayersInHittableRange()
        
        this.tree.Tick(new TimeData(this.scene.game.loop.delta))
        if (this.player.isParalyzed || this.player.isStunned) {
            this.player.body.acceleration = Phaser.Math.Vector2.ZERO.clone()
            this.player.body.velocity = Phaser.Math.Vector2.ZERO.clone()
        } else {
            this.player.body.acceleration = this.sumSteeringsForce()
            this.player.rotation = steering.facing(this.player.body.velocity)
        }
    }


    public setPlayersInVisibleRange(): void {
        const playersInRange = []
        const width = this.scene.cameras.main.displayWidth
        const height = this.scene.cameras.main.displayHeight
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
        const actionsKeysReady = Object.keys(this.player.actionTimes)
            .filter(key => this.player.actionTimes[key].ready)
        
        for (const playerInViewRange of this.playersInViewRange ) {
            if (playerInViewRange.id !== this.player.id) {
                const actionsInRange = actionsKeysReady.filter((key) => {
                    return this.isInRangeCircle(
                        this.player.body.center,
                        playerInViewRange.body.center,
                        this.player.actions[key].rangeDistance
                    )
                })
                playersInRange.push({
                    player: playerInViewRange,
                    actions: actionsInRange,
                })        
            }
        }
        this.playersInHittableRange = playersInRange
    }

    public setProjectilesInHittableRange(): void {
        this.scene.projectiles.getAll()
    }

    public isInRangeCircle(
        sourcePosition: Phaser.Math.Vector2,
        targetPosition: Phaser.Math.Vector2,
        radius: number): boolean {

        const circleVision = new Phaser.Geom.Circle(
            sourcePosition.x,
            sourcePosition.y,
            radius
        )
        return circleVision.contains(targetPosition.x, targetPosition.y)
    }


    public sumSteeringsForce(): Phaser.Math.Vector2 {
        const netForce = Phaser.Math.Vector2.ZERO.clone()
        for(let i=0; i < this.steeringsForce.length; i++ ) {
            netForce.add(this.steeringsForce[i])
        }
        return netForce
    }
    

    public doSeekTarget(): void {
        const target = this.playersInViewRange[0].body
        const newForce = steering.pursuit(this.player.body, target)
        this.steeringsBehaviour.push(SEEK_BEHAVIOUR)
        this.steeringsForce.push(newForce)
    }

    public doFleeTarget(): void {
        const target = this.playersInViewRange[0].body
        const newForce = steering.evade(this.player.body, target)
        this.steeringsBehaviour.push(FLEE_BEHAVIOUR)
        this.steeringsForce.push(newForce)
    }

    public doMoveAroundTarget(choosenTarget: PlayerAIActionsInterface, closestActionDistance: number): void {
        const sourcePosition = this.player.body.center.clone()
        const targetPosition = choosenTarget.player.body.center.clone()
        const randomAngle = Phaser.Math.RND.between(...this.moveCombatAngleRange)
        const goalPosition = targetPosition
            .subtract(sourcePosition)
            .normalize()
            .rotate(Phaser.Math.DegToRad(randomAngle) )
            .scale(closestActionDistance)
            
        const newForce = steering.limit(
            goalPosition,
            this.player.body.maxSpeed,
        )
        this.steeringsForce.push(newForce)
    }

    public doMoveInCombat(choosenTarget: PlayerAIActionsInterface): void {
        const actionsKeyRange = Object.keys(this.player.actionTimes)
            .filter(key => this.player.actionTimes[key].ready)
            .map(key => [key, this.player.actions[key].rangeDistance])
            .sort((action1, action2) => action2[1] - action1[1])

        const rondamFleeing = Phaser.Math.RND.realInRange(...this.fleeAfterSecondRange) * Math.random() * 2
            <= this.scene.game.loop.delta / 1000

        console.log(rondamFleeing)
        console.log(Math.random() / Phaser.Math.RND.realInRange(...this.fleeAfterSecondRange))
        
        if(!this.isFleeingInCombat && actionsKeyRange.length === 0 || rondamFleeing) {
            this.isFleeingInCombat = true
            this.scene.time.addEvent({
                delay: Phaser.Math.RND.realInRange(...this.fleeForSecondRange) * 1000,
                callback: () => {
                    this.isFleeingInCombat = false
                }
            })            
        }

        if(!this.isFleeingInCombat) {
            this.doMoveAroundTarget(choosenTarget, actionsKeyRange[0][1])
        } else {
            this.doFleeTarget()
        }
    }
    

    public doObstacleAvoidance(): void {
        console.log('avoid obstacle')
    }


    public doWander(): void {
        const newForce = steering.limit(
            steering.wander(this.player.body, this.wander),
            this.player.body.maxSpeed,
        )
        this.steeringsBehaviour.push(WANDER_BEHAVIOUR)
        this.steeringsForce.push(newForce)
        this.wander.angle += Phaser.Math.Between(-this.wander.variance, this.wander.variance)
        this.player.rotation = steering.facing(this.player.body.velocity)
    }

    public shouldAttack(actionKey: string): boolean {
        const [start, end] = this.actionsTriggerSecondRange[actionKey]
        const randomRatio = (Phaser.Math.RND.realInRange(start, end)) * Math.random() * 2
        const randomTime = this.player.actions[actionKey].cooldownDelay * randomRatio
        // console.log({
        //     start, end,
        //     rr: Phaser.Math.RND.between(start, end),
        //     randomRatio: randomRatio,
        //     randomTime: randomTime,
        //     delay: this.player.actions[actionKey].cooldownDelay
        // })
        return randomTime <= this.scene.game.loop.delta / 1000
    }

    
    public doAttack(choosenTarget: PlayerAIActionsInterface, choosenActionKey: string): void {
        const choosenPlayer: Player = choosenTarget.player
        const choosenAction: Weapon | Ability = choosenPlayer.actions[choosenActionKey]

        const timeToReachTarget = choosenAction.projectiles.getTimeToReachTarget(
            choosenAction.projectileKey,
            choosenPlayer.body.center.clone().distance(this.player.body.center)
        )
                
        const playerToTarget = choosenPlayer.body.center.clone()
            .add(choosenPlayer.body.velocity.clone().scale(timeToReachTarget))
        
        const handicapPrecisionAngle = Phaser.Math.RND.normal()
            * Math.PI * (this.weaponPrecisionHandicap / 360)
        const predictedPosition = playerToTarget.clone()
            .rotate(handicapPrecisionAngle)

        if (choosenAction instanceof Weapon) {
            this.player.fire(choosenActionKey, predictedPosition)
            this.player.rotation = steering.facing(predictedPosition)
        } else {
            if (this.player.actions[choosenActionKey].name === 'blink') {
                this.player.castAbility(
                    choosenActionKey,
                    Phaser.Math.Vector2.UP.clone()
                        .rotate(Phaser.Math.RND.normal() * Math.PI)
                        .scale(this.player.actions[choosenActionKey].rangeDistance)
                        .add(this.player.body.center)
                )
            } else {
                this.player.castAbility(choosenActionKey, predictedPosition)
            }
        }
        
    }
}
