export type PresenceState = "online" | "offline" | "unavailable";

export interface PresenceContent {
    avatar_url?: string;
    currently_active?: boolean;
    displayname?: string;
    last_active_ago?: number;
    presence: PresenceState;
    status_msg?: string;
}

export interface PresenceEvent {
    content: PresenceContent;
    sender: string;
    type: "m.presence";
}

export interface PresenceResponse {
    currently_active?: boolean;
    last_active_ago?: number;
    presence: PresenceState;
    status_msg?: string | null;
}