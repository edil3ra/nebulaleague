import { GameChanged, GameState, PlayerAction } from '~/shared/models'
import { Client } from '~/client/client'
import { MyGame } from '~/client/games/myGame'
import { Config } from '~/shared/config'

export abstract class GameClient {
    public game: MyGame
    public state: GameState
    public onInit: () => void
    
    constructor(
        game: MyGame,
        onInit: () => void,
    ) {
        this.game = game
        this.onInit = onInit
        this.state = Config.defaultGameState
    }

    public get id(): string {
        return 'unknown'
    }
    public abstract async init(): Promise<unknown>
    public abstract inputUpdate(playerAction: PlayerAction): void 
}
