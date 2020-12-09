import { Schema, type, MapSchema } from '@colyseus/schema'
import { Client, Room } from 'colyseus'
import {
    AbilityName,
    ControlledBy,
    WeaponName,
    PlayerConfig,
    GameMode,
} from '~/shared/models'

export class PlayerConfigSchema extends Schema implements PlayerConfig {
    @type('string')
    name: string

    @type('string')
    controlledBy: ControlledBy

    @type('string')
    weaponPrimaryKey: WeaponName

    @type('string')
    weaponSecondaryKey: WeaponName

    @type('string')
    abilityKey1: AbilityName

    @type('string')
    abilityKey2: AbilityName

    @type('string')
    abilityKey3: AbilityName

    @type('string')
    abilityKey4: AbilityName

    @type('boolean')
    ready = false
}

export class PlayerSelectionStateSchema extends Schema {
    @type('string')
    gameMode: GameMode

    @type('string')
    gameRoom = ''

    @type({ map: PlayerConfigSchema })
    players = new MapSchema<PlayerConfigSchema>()
}

type Option = {
    gameMode: GameMode
    player: PlayerConfig
}

export class PlayerSelectionRoom extends Room<PlayerSelectionStateSchema> {
    state: PlayerSelectionStateSchema

    async onCreate(option: Option) {
        await this.setMetadata({ gameMode: option.gameMode })
        if (option.gameMode === 'ffa') {
            this.maxClients = 1
        } else if (option.gameMode === 'training') {
            this.maxClients = 10
        }

        this.onMessage('playerReady', (client: Client, playerOption: PlayerConfig) => {
            const player = this.state.players.get(client.sessionId)
            Object.assign(player, playerOption)
        })
        
        this.setState(new PlayerSelectionStateSchema())
    }
    
    onJoin(client: Client, option: Option) {
        this.state.gameMode = option.gameMode
        this.state.players.set(
            client.sessionId,
            new PlayerConfigSchema().assign(option.player)
        )
        console.log('on join')
        console.log(this.state.players.values())
    }

    onLeave(client: Client) {
        this.state.players.delete(client.sessionId);
    }
    
    
}