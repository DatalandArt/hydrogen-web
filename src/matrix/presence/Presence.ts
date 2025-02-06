import type { HomeServerApi } from "../net/HomeServerApi";
import { PresenceState, PresenceContent, PresenceResponse } from "./types";

export class Presence {
    private readonly hsApi: HomeServerApi;
    private _currentPresence: PresenceState;
    private _statusMsg?: string;
    private _lastActiveAgo?: number;
    private _currentlyActive: boolean;

    constructor(hsApi: HomeServerApi) {
        this.hsApi = hsApi;
        this._currentPresence = "offline";
        this._currentlyActive = false;
    }

    public get currentPresence(): PresenceState {
        return this._currentPresence;
    }

    public get statusMsg(): string | undefined {
        return this._statusMsg;
    }

    public get lastActiveAgo(): number | undefined {
        return this._lastActiveAgo;
    }

    public get currentlyActive(): boolean {
        return this._currentlyActive;
    }

    public async setPresence(presence: PresenceState, statusMsg?: string): Promise<void> {
        const content: Partial<PresenceContent> = {
            presence
        };
        if (statusMsg !== undefined) {
            content.status_msg = statusMsg;
        }

        await this.hsApi.presence.set(content);
        this._currentPresence = presence;
        this._statusMsg = statusMsg;
    }

    public async getPresence(userId: string): Promise<PresenceResponse> {
        return await this.hsApi.presence.get(userId);
    }

    public handlePresenceEvent(event: PresenceContent): void {
        if (event.presence) {
            this._currentPresence = event.presence;
        }
        if (event.status_msg !== undefined) {
            this._statusMsg = event.status_msg;
        }
        if (event.last_active_ago !== undefined) {
            this._lastActiveAgo = event.last_active_ago;
        }
        if (event.currently_active !== undefined) {
            this._currentlyActive = event.currently_active;
        }
    }
}