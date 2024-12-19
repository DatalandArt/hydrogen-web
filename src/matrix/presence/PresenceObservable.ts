import { ObservableValue } from "../../observable/value";
import type { PresenceState, PresenceContent } from "./types";

export interface PresenceStatus {
    presence: PresenceState;
    isOnline: boolean;
}

export class PresenceObservable extends ObservableValue<PresenceStatus> {
    constructor() {
        super({
            presence: "offline",
            isOnline: false
        });
    }

    updatePresence(presenceEvent: PresenceContent): void {
        console.log("Presence event:", presenceEvent);
        const isOnline = presenceEvent.presence === "online" && !!presenceEvent.currently_active;
        this.set({
            presence: presenceEvent.presence,
            isOnline
        });
        console.log("Presence state:", this.value);
    }
}