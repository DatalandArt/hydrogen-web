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
        this._logger?.run("RoomPresenceStore.updateRoomMembers", log => {
            log.set("currentMembers", Array.from(this._roomMembers));
            log.log({l: "Updating room members"}, log.level.Detail);
        });

        for (const [userId, memberChange] of memberChanges.entries()) {
            if (!memberChange?.member?.userId) {
                this._logger?.run("RoomPresenceStore.updateRoomMembers", log => {
                    log.set("userId", userId);
                    log.set("memberChange", memberChange);
                    log.log({l: "Skipping invalid member change"}, log.level.Warn);
                });
                continue;
            }

            const membership = memberChange.member.membership;
            const actualUserId = memberChange.member.userId;

            this._logger?.run("RoomPresenceStore.updateRoomMembers", log => {
                log.set("userId", userId);
                log.set("actualUserId", actualUserId);
                log.set("membership", membership);
                log.set("memberChange", memberChange);
                log.log({l: "Processing member change"}, log.level.Detail);
            });

            if (membership === "join") {
                this._roomMembers.add(actualUserId);
                this._logger?.run("RoomPresenceStore.updateRoomMembers", log => {
                    log.set("userId", actualUserId);
                    log.set("currentMembers", Array.from(this._roomMembers));
                    log.log({l: "Added member"}, log.level.Detail);
                });
            } else {
                const wasPresent = this._roomMembers.delete(actualUserId);
                this._logger?.run("RoomPresenceStore.updateRoomMembers", log => {
                    log.set("userId", actualUserId);
                    log.set("wasPresent", wasPresent);
                    log.log({l: "Removed member"}, log.level.Detail);
                });
                // If a member leaves, remove them from active users
                const idx = this._activeUserIds.array.indexOf(actualUserId);
                if (idx !== -1) {
                    this._activeUserIds.remove(idx);
                    this._logger?.run("RoomPresenceStore.updateRoomMembers", log => {
                        log.set("userId", actualUserId);
                        log.log({l: "Removed from active users"}, log.level.Detail);
                    });
                }
            }
        }
    }

    handlePresenceEvent(event) {
        const {sender, content} = event;
        const {presence, currently_active: currentlyActive, last_active_ago} = content;

        if (!sender || !sender.startsWith("@")) {
            this._logger?.run("RoomPresenceStore.handlePresenceEvent", log => {
                log.set("sender", sender);
                log.log({l: "Invalid sender in presence event"}, log.level.Warn);
            });
            return;
        }

        // Only track presence for room members
        if (!this._roomMembers.has(sender)) {
            this._logger?.run("RoomPresenceStore.handlePresenceEvent", log => {
                log.set("sender", sender);
                log.log({l: "Ignoring presence for non-room member"}, log.level.Detail);
            });
            return;
        }

        const currentTime = Date.now();

        const lastPresence = this._lastPresenceByUser.get(sender);
        const isNowActive = presence === "online" || (presence === "unavailable" && currentlyActive === true);
        const wasActive = this._activeUserIds.array.includes(sender);

        this._logger?.run("RoomPresenceStore.handlePresenceEvent", log => {
            log.set("sender", sender);
            log.set("presence", presence);
            log.set("currentlyActive", currentlyActive);
            log.set("lastActiveAgo", last_active_ago);
            log.set("lastPresence", lastPresence);
            log.set("wasActive", wasActive);
            log.set("isNowActive", isNowActive);
            log.set("currentActiveUsers", this._activeUserIds.array.slice());
            log.log({l: "Processing presence"}, log.level.Detail);
        });

        // Only update if there's an actual change in presence state
        // Update tracking
        this._lastPresenceByUser.set(sender, {presence, currentlyActive});
        this._lastUpdateTime.set(sender, currentTime);

        // Update active users list
        if (wasActive && !isNowActive) {
            const idx = this._activeUserIds.array.indexOf(sender);
            if (idx !== -1) {
                this._activeUserIds.remove(idx);
                this._logger?.run("RoomPresenceStore.handlePresenceEvent", log => {
                    log.set("sender", sender);
                    log.log({l: "Removed user from active list"}, log.level.Detail);
                });
            }
        } else if (!wasActive && isNowActive) {
            if (!this._activeUserIds.array.includes(sender)) {
                this._activeUserIds.append(sender);
                this._logger?.run("RoomPresenceStore.handlePresenceEvent", log => {
                    log.set("sender", sender);
                    log.log({l: "Added user to active list"}, log.level.Detail);
                });
            }
        }

        this._logger?.run("RoomPresenceStore.handlePresenceEvent", log => {
            log.set("activeUsers", this._activeUserIds.array.slice());
            log.log({l: "Active users after update"}, log.level.Detail);
        });
    }

    initializeMembers(members) {
        if (!members) {
            this._logger?.run("RoomPresenceStore.initializeMembers", log => {
                log.log({l: "No members provided to initialize"}, log.level.Warn);
            });
            return;
        }

        this._roomMembers.clear();
        while (this._activeUserIds.array.length > 0) {
            this._activeUserIds.remove(0);
        }

        // Handle both array and Map cases
        const memberEntries =
            members instanceof Map ? Array.from(members.entries()) : members.map((member) => [member.userId, member]);

        this._logger?.run("RoomPresenceStore.initializeMembers", log => {
            log.set("totalMembers", memberEntries.length);
            log.set("members", memberEntries.map(([id, m]) => ({
                id,
                userId: m.userId,
                membership: m.membership,
            })));
            log.log({l: "Initializing members"}, log.level.Detail);
        });

        for (const [, member] of memberEntries) {
            if (member.membership === "join" && member.userId) {
                this._roomMembers.add(member.userId);
            }
        }

        this._logger?.run("RoomPresenceStore.initializeMembers", log => {
            log.set("roomMembers", Array.from(this._roomMembers));
            log.set("activeUsers", this._activeUserIds.array);
            log.log({l: "After initialization"}, log.level.Detail);
        });
    }

    handleBulkPresenceEvents(presenceEvents) {
        if (!Array.isArray(presenceEvents)) {
            this._logger?.run("RoomPresenceStore.handleBulkPresenceEvents", log => {
                log.set("presenceEvents", presenceEvents);
                log.log({l: "Invalid presenceEvents"}, log.level.Warn);
            });
            return;
        }

        this._logger?.run("RoomPresenceStore.handleBulkPresenceEvents", log => {
            log.set("eventCount", presenceEvents.length);
            log.log({l: "Processing bulk presence events"}, log.level.Detail);
        });
        for (const presence of presenceEvents) {
            const event = {
                type: "m.presence",
                sender: presence.user_id,
                content: {
                    presence: presence.presence,
                    currently_active: presence.currently_active,
                    last_active_ago: presence.last_active_ago,
                    status_msg: presence.status_msg,
                },
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
