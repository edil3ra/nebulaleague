import { Wander } from './steering'


export interface PlayerAIConfig {
    wander: Wander
    weaponPrecisionHandicap: number
}

export const playerAI1 = {
    id: 'playerAI1',
    wander: {
        radialMag: 200,
        distanceExtension: 100,
        angle: 0,
        variance: 0.1,
    },
    weaponPrecisionHandicap: 14,
    weaponPrimaryKey: 'pistol',
    weaponSecondaryKey: 'ak47',
    abilityKey1: 'chargedArrow',
    abilityKey2: 'flame',
    abilityKey3: 'blink',
    abilityKey4: 'rootTip',
}


export const playerAI2 = {
    id: 'playerAI2',
    wander: {
        radialMag: 100,
        distanceExtension: 150,
        angle: 0,
        variance: 0.01,
    },
    weaponPrecisionHandicap: 14,
    weaponPrimaryKey: 'p90',
    weaponSecondaryKey: 'ak47',
    abilityKey1: 'chargedArrow',
    abilityKey2: 'flame',
    abilityKey3: 'blink',
    abilityKey4: 'rootTip',
}


export const playerAI3 = {
    id: 'playerAI3',
    wander: {
        radialMag: 300,
        distanceExtension: 200,
        angle: 0,
        variance: 0.03,
    },
    weaponPrecisionHandicap: 14,
    weaponPrimaryKey: 'revolver',
    weaponSecondaryKey: 'thompson',
    abilityKey1: 'chargedArrow',
    abilityKey2: 'flame',
    abilityKey3: 'blink',
    abilityKey4: 'rootTip',
}



export const playerAI4 = {
    id: 'playerAI4',
    wander: {
        radialMag: 400,
        distanceExtension: 600,
        angle: 0,
        variance: 0.004,
    },
    weaponPrecisionHandicap: 18,
    weaponPrimaryKey: 'pistol',
    weaponSecondaryKey: 'ak47',
    abilityKey1: 'chargedArrow',
    abilityKey2: 'flame',
    abilityKey3: 'blink',
    abilityKey4: 'rootTip',
}


export const playerAI5 = {
    id: 'playerAI5',
    wander: {
        radialMag: 100,
        distanceExtension: 100,
        angle: 0,
        variance: 0.005,        
    },
    weaponPrecisionHandicap: 5,
    weaponPrimaryKey: 'pistol',
    weaponSecondaryKey: 'ak47',
    abilityKey1: 'chargedArrow',
    abilityKey2: 'flame',
    abilityKey3: 'blink',
    abilityKey4: 'rootTip',
}


export const playerAI6 = {
    id: 'playerAI6',
    wander: {
        radialMag: 400,
        distanceExtension: 500,
        angle: 0,
        variance: 0.03,        
    },
    weaponPrecisionHandicap: 20,
    weaponPrimaryKey: 'pistol',
    weaponSecondaryKey: 'ak47',
    abilityKey1: 'chargedArrow',
    abilityKey2: 'flame',
    abilityKey3: 'blink',
    abilityKey4: 'rootTip',
}


export const playerAI7 = {
    id: 'playerAI7',
    wander: {
        radialMag: 189,
        distanceExtension: 170,
        angle: 0,
        variance: 0.05,
    },
    weaponPrecisionHandicap: 30,
    weaponPrimaryKey: 'pistol',
    weaponSecondaryKey: 'ak47',
    abilityKey1: 'chargedArrow',
    abilityKey2: 'flame',
    abilityKey3: 'blink',
    abilityKey4: 'rootTip',
}


export const playerAI8 = {
    id: 'playerAI8',
    wander: {
        radialMag: 400,
        distanceExtension: 300,
        angle: 0,
        variance: 0.1,        
    },
    weaponPrecisionHandicap: 28,
    weaponPrimaryKey: 'pistol',
    weaponSecondaryKey: 'ak47',
    abilityKey1: 'chargedArrow',
    abilityKey2: 'flame',
    abilityKey3: 'blink',
    abilityKey4: 'rootTip',
}


export const playerAI9 = {
    id: 'playerAI9',
    wander: {
        radialMag: 1000,
        distanceExtension: 200,
        angle: 0,
        variance: 0.01,
    },
    weaponPrecisionHandicap: 10,
    weaponPrimaryKey: 'pistol',
    weaponSecondaryKey: 'ak47',
    abilityKey1: 'chargedArrow',
    abilityKey2: 'flame',
    abilityKey3: 'blink',
    abilityKey4: 'rootTip',
}

export const playersAIConfig = [
    playerAI1,
    playerAI2,
    playerAI3,
    playerAI4,
    playerAI5,
    playerAI6,
    playerAI7,
    playerAI8,
    playerAI9,
]


