export class ServerEvent {
    public static readonly connected = "connection"
    public static readonly disconnected = "disconnect"
    public static readonly lobyInit = "loby:init:server"
    public static readonly lobyEnd = "loby:end:server"
    public static readonly lobyStart = "loby:start:server"
    public static readonly playerSelectionInit = "playerSelection:init:server"
    public static readonly playerSelectionEnd = "playerSelection:end:server"
    public static readonly playerSelectionStart = "playerSelection:start:server"
    public static readonly gameInit = "game:init:server"
    public static readonly gameEnd = "game:end:server"
    public static readonly gameStart = "game:start:server"
    public static readonly gameUpdated = "game:updated:server"
    public static readonly gameRefreshServer = "game:refreshServer:server"
    public static readonly gameQuit = "game:quit:server"
    public static readonly gameJoined = "game:joined:server"
    public static readonly gameAction = "game:action:server"
    public static readonly gameNewHost = "game:newHost:server"
    
}

export class ClientEvent {
    public static readonly lobyInit = "loby:init:client"
    public static readonly lobyEnd = "loby:end:client"
    public static readonly lobyStart = "loby:start:client"
    public static readonly playerSelectionInit = "playerSelection:init:client"
    public static readonly playerSelectionEnd = "playerSelection:end:client"
    public static readonly playerSelectionStart = "playerSelection:start:client"
    public static readonly gameInit = "game:init:client"
    public static readonly gameEnd = "game:end:client"
    public static readonly gameStart = "game:start:client"
    public static readonly gameUpdated = "game:updated:client"
    public static readonly gameRefreshServer = "game:refreshServer:client"
    public static readonly gameQuit = "game:quit:client"
    public static readonly gameJoined = "game:joined:client"
    public static readonly gameAction = "game:action:client"
    public static readonly gameNewHost = "game:newHost:client"
}


export class Event {
    public static readonly gameReady = 'gameReady'
    public static readonly lobyStart = 'lobyStart'
    public static readonly playerSelectionStart = 'playerSelectionStart'
    public static readonly playerJoined = 'playerJoined'
    public static readonly playerQuit = 'playerFire'
    public static readonly playerAction = 'playerAction'
    public static readonly gameUpdated = 'gameUpdated'
    public static readonly playerHealthChanged = 'playerHealthChanged'
    public static readonly abilitiesCooldownChanged = 'abilitiesCooldownChanged'
    public static readonly abilitiesSelectedChanged = 'abilitiesSelectedChanged'
    public static readonly weaponsCooldownChanged = 'weaponsCooldownChanged'
    public static readonly weaponSelectedChanged = 'weaponSelectedChanged'
    public static readonly effectsChanged = 'effectsChanged'
    public static readonly deathCooldownChanged = 'deathCooldownChanged'
    public static readonly ProjectileFired = 'projectileFired'
    public static readonly ProjectileKilled = 'projectileKilled'
    
}
