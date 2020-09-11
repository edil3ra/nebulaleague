export class Event {
    public static readonly gameReady = 'gameReady'
    public static readonly playerJoined = 'playerJoined'
    public static readonly playerQuit = 'playerFire'
    public static readonly playerMove = 'playerMove'
    public static readonly playerFire = 'playerFire'
    public static readonly playerHealthChanged = 'playerHealthChanged'
    public static readonly abilitiesCooldownChanged = 'abilitiesCooldownChanged'
    public static readonly abilitiesSelectedChanged = 'abilitiesSelectedChanged'
    public static readonly weaponsCooldownChanged = 'weaponsCooldownChanged'
    public static readonly weaponSelectedChanged = 'weaponSelectedChanged'
    public static readonly effectsChanged = 'effectsChanged'
    public static readonly deathCooldownChanged = 'deathCooldownChanged'
}