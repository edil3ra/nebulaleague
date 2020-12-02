import { Schema, type } from "@colyseus/schema"
import { Client, LobbyRoom as ColyseusLobbyRoom } from "colyseus"

class LobbyState extends Schema {
    @type("string") custom: string 
}

export class LobbyRoom extends ColyseusLobbyRoom {
    async onCreate(options: any) {
        await super.onCreate(options)

        this.setState(new LobbyState())
    }

    onJoin(client: Client, options: any) {
        super.onJoin(client, options)
        this.state.custom = client.sessionId
    }

    onLeave(client: any) {
        super.onLeave(client)
    }
}
