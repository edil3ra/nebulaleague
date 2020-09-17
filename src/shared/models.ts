// PLAYER INTERFACE //
export enum ControlledBy {
    MainPlayer,
    AIPlayer,
}


export interface PlayerModel {
    id: string
    name: string
    x: number
    y: number
    rotation: number
    controlledBy: ControlledBy
    selectedAbilityKey: string | null
    weaponPrimaryKey: string
    weaponSecondaryKey: string
    abilityKey1: string
    abilityKey2: string
    abilityKey3: string
    abilityKey4: string
}


export interface PlayerConfig {
    name: string
    weaponPrimaryKey: string
    weaponSecondaryKey: string
    abilityKey1: string
    abilityKey2: string
    abilityKey3: string
    abilityKey4: string
}

export interface PlayerChanged {
    id: string
    x?: number
    y?: number
    rotation?: number
}


export interface PlayerDirection {
    x: number
    y: number
}

export interface Position {
    x: number
    y: number
}

export interface PlayerAction {
    direction?: PlayerDirection,
    rotation?: number,
    selectAbility?: string,
    action?: string,
    pointerPosition?: {
        x: number,
        y: number
    }
}

export interface PlayerMovement {
    id: string
    x: number
    y: number
    rotation?: number
}


// WEAPONS INTERFACE
export interface LaserModel {
    width: number
    color: number
    alpha: number
}

export interface WeaponModel {
    name: string
    frame: string
    cooldownDelay: number
    projectileKey: string
    laser: LaserModel
}



// ABILITIES INTERFACE
export enum AbilityDrawingStyle {
    Zone,
    Ray,
}

export enum AbilityAction {
    Blink,
    Projectile,
    ProjectileWithRotation,
}


export interface AbilityModel {
    name: string
    frame: string
    action: AbilityAction
    projectileKey?: string
    cooldownDelay: number
    rangeDistance?: number
    drawingStyle: AbilityDrawingStyle
    radiusDistance?: number
    rangeDistanceColor?: number
    triggerAfter?: number
    radiusDistanceColor?: number
    raySize?: number
    rayColor?: number
    rangeDistanceAlpha?: number
    radiusDistanceAlpha?: number
    rayDistanceAlpha?: number
}






// PROJECTILE INTERFACE
export interface ProjectileModel {
    key: string
    fromPlayerId: string
    x: number
    y: number
    rotation?: number
}


// EFFECT INTERFACE
export enum EffectKeys {
    Slow = 'slowed',
    Fast = 'fastenned',
    Paralyze = 'paralyzed',
    Stun = 'stunned',
    Burn = 'burned',
    Freeze = 'freezed',
}

export interface EffectInterface {
    name: EffectKeys
    value: number
    duration: number
    tick?: number
}


// SERVER INTERFACE
export interface User {
    name?: string
    gameMode?: string
    playerSelectionRoom?: string
}

export interface LobyState {
    users: Map<string, User>
}

export interface PlayerSelectionState {
    gameMode: string
    players: Array<PlayerModel>
    gameRoom?: string
}

export interface GameStateUpdated {
    players: Array<PlayerModel>
}

export interface GameState {
    gameMode: string
    players: Array<PlayerModel>
    hostId?: string
}
