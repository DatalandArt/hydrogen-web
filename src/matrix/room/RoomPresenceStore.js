/*
Copyright 2023 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {ObservableArray} from "../../observable/list/ObservableArray.ts";

export class RoomPresenceStore {
    constructor({logger} = {}) {
        this._activeUserIds = new ObservableArray();
        this._logger = logger;
        this._roomMembers = new Set(); // Set of user IDs who are members of this room
        this._lastPresenceByUser = new Map(); // Track last presence state per user
        this._lastUpdateTime = new Map(); // Track last update time per user
    }

    get activeUserIds() {
        return this._activeUserIds;
    }

    updateRoomMembers(memberChanges) {
        console.log("[RoomPresenceStore] Updating room members. Current members:", Array.from(this._roomMembers));
        
        for (const [userId, memberChange] of memberChanges.entries()) {
            if (!memberChange?.member?.userId) {
                console.log("[RoomPresenceStore] Skipping invalid member change:", {userId, memberChange});
                continue;
            }

            const membership = memberChange.member.membership;
            const actualUserId = memberChange.member.userId;

            console.log("[RoomPresenceStore] Processing member change:", {
                userId,
                actualUserId,
                membership,
                memberChange
            });
            
            if (membership === "join") {
                this._roomMembers.add(actualUserId);
                console.log(`[RoomPresenceStore] Added member ${actualUserId}. Current members:`, Array.from(this._roomMembers));
            } else {
                const wasPresent = this._roomMembers.delete(actualUserId);
                console.log(`[RoomPresenceStore] Removed member ${actualUserId} (was present: ${wasPresent})`);
                // If a member leaves, remove them from active users
                const idx = this._activeUserIds.array.indexOf(actualUserId);
                if (idx !== -1) {
                    this._activeUserIds.remove(idx);
                    console.log(`[RoomPresenceStore] Removed ${actualUserId} from active users`);
                }
            }
        }
    }

    handlePresenceEvent(event) {
        const {sender, content} = event;
        const {presence, currently_active: currentlyActive, last_active_ago} = content;

        if (!sender || !sender.startsWith("@")) {
            console.log("[RoomPresenceStore] Invalid sender in presence event:", sender);
            return;
        }

        // Only track presence for room members
        if (!this._roomMembers.has(sender)) {
            console.log("[RoomPresenceStore] Ignoring presence for non-room member:", sender);
            return;
        }

        const currentTime = Date.now();
        const lastUpdate = this._lastUpdateTime.get(sender) || 0;
        const updateDelta = currentTime - lastUpdate;

        // Deduplicate events that are too close together (within 1 second)
        if (updateDelta < 1000) {
            console.log("[RoomPresenceStore] Ignoring duplicate presence event for", sender, "delta:", updateDelta);
            return;
        }

        const lastPresence = this._lastPresenceByUser.get(sender);
        const isNowActive = presence === "online" || (presence === "unavailable" && currentlyActive === true);
        const wasActive = this._activeUserIds.array.includes(sender);

        console.log("[RoomPresenceStore] Processing presence:", {
            sender,
            presence,
            currentlyActive,
            last_active_ago,
            lastPresence,
            wasActive,
            isNowActive,
            currentActiveUsers: this._activeUserIds.array.slice(),
            updateDelta
        });

        // Only update if there's an actual change in presence state
        if (lastPresence?.presence === presence && 
            lastPresence?.currentlyActive === currentlyActive) {
            console.log("[RoomPresenceStore] No change in presence state for:", sender);
            return;
        }

        // Update tracking
        this._lastPresenceByUser.set(sender, {presence, currentlyActive});
        this._lastUpdateTime.set(sender, currentTime);

        // Update active users list
        if (wasActive && !isNowActive) {
            const idx = this._activeUserIds.array.indexOf(sender);
            if (idx !== -1) {
                this._activeUserIds.remove(idx);
                console.log("[RoomPresenceStore] Removed user from active list:", sender);
            }
        } else if (!wasActive && isNowActive) {
            if (!this._activeUserIds.array.includes(sender)) {
                this._activeUserIds.append(sender);
                console.log("[RoomPresenceStore] Added user to active list:", sender);
            }
        }

        console.log("[RoomPresenceStore] Active users after update:", this._activeUserIds.array.slice());
    }

    initializeMembers(members) {
        if (!members) {
            console.log("[RoomPresenceStore] No members provided to initialize");
            return;
        }

        this._roomMembers.clear();
        while (this._activeUserIds.array.length > 0) {
            this._activeUserIds.remove(0);
        }

        // Handle both array and Map cases
        const memberEntries = members instanceof Map ? 
            Array.from(members.entries()) : 
            members.map(member => [member.userId, member]);

        console.log("[RoomPresenceStore] Initializing members:", {
            totalMembers: memberEntries.length,
            members: memberEntries.map(([id, m]) => ({
                id,
                userId: m.userId,
                membership: m.membership
            }))
        });

        for (const [, member] of memberEntries) {
            if (member.membership === "join" && member.userId) {
                this._roomMembers.add(member.userId);
            }
        }
        
        console.log("[RoomPresenceStore] After initialization:", {
            roomMembers: Array.from(this._roomMembers),
            activeUsers: this._activeUserIds.array
        });
    }

    handleBulkPresenceEvents(presenceEvents) {
        if (!Array.isArray(presenceEvents)) {
            console.log("[RoomPresenceStore] Invalid presenceEvents:", presenceEvents);
            return;
        }

        console.log("[RoomPresenceStore] Processing bulk presence events:", presenceEvents.length);
        for (const presence of presenceEvents) {
            const event = {
                type: "m.presence",
                sender: presence.user_id,
                content: {
                    presence: presence.presence,
                    currently_active: presence.currently_active,
                    last_active_ago: presence.last_active_ago,
                    status_msg: presence.status_msg
                }
            };
            this.handlePresenceEvent(event);
        }
    }

    dispose() {
        this._roomMembers.clear();
        while (this._activeUserIds.array.length > 0) {
            this._activeUserIds.remove(0);
        }
    }
}

