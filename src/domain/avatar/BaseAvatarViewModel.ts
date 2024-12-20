import type { PresenceObservable } from "../../matrix/presence/PresenceObservable";
import type { Platform } from "../../platform/web/Platform";
import type { MediaRepository } from "../../matrix/net/MediaRepository";

export interface IAvatarViewModel {
    avatarColorNumber: number;
    avatarUrl(size: number): string | undefined;
    avatarLetter: string;
    avatarTitle: string;
    isOnline?: boolean;
}

export abstract class BaseAvatarViewModel {
    protected _presence?: PresenceObservable;

    constructor(presence?: PresenceObservable) {
        this._presence = presence;
console.log("BaseAvatarViewModel constructor", presence);
if (presence) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "BaseAvatarViewModel constructor", presence: presence.value })
        });
    }
if (presence) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "BaseAvatarViewModel constructor", presence: presence.value })
        });
    }
if (presence) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "BaseAvatarViewModel constructor", presence: presence.value })
        });
    }
if (presence) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "BaseAvatarViewModel constructor", presence: presence.value })
        });
    }
if (presence) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "BaseAvatarViewModel constructor", presence: presence.value })
        });
    }
if (presence) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "BaseAvatarViewModel constructor", presence: presence.value })
        });
    }
if (presence) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "BaseAvatarViewModel constructor", presence: presence.value })
        });
    }
if (presence) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "BaseAvatarViewModel constructor", presence: presence.value })
        });
    }
if (presence) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "BaseAvatarViewModel constructor", presence: presence.value })
        });
    }
if (presence) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "BaseAvatarViewModel constructor", presence: presence.value })
        });
    }
if (presence) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "BaseAvatarViewModel constructor", presence: presence.value })
        });
    }
if (presence) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "BaseAvatarViewModel constructor", presence: presence.value })
        });
    }
if (presence) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "BaseAvatarViewModel constructor", presence: presence.value })
        });
    }
if (presence) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "BaseAvatarViewModel constructor", presence: presence.value })
        });
    }
if (presence) {
        fetch('/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "BaseAvatarViewModel constructor", presence: presence.value })
        });
    }
    }

    abstract get avatarColorNumber(): number;
    abstract avatarUrl(size: number): string | undefined;
    abstract get avatarLetter(): string;
    abstract get avatarTitle(): string;

    get isOnline(): boolean {
        if (!this._presence) {
            return false;
        }
        return this._presence.get().isOnline;
    }
}