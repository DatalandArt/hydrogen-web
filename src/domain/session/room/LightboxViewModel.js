/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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

import {ViewModel} from "../../ViewModel";

export class LightboxViewModel extends ViewModel {
    constructor(options) {
        super(options);
        this._eventId = options.eventId;
        this._unencryptedImageUrl = null;
        this._decryptedImage = null;
        this._closeUrl = this.urlRouter.urlUntilSegment("room");
        this._date = null;
        this._subscribeToEvent(options.room, options.eventId);
    }

    _subscribeToEvent(room, eventId) {
        const eventObservable = room.observeEvent(eventId);
        this.track(eventObservable.subscribe(eventEntry => {
            this._loadEvent(room, eventEntry);
        }));
        this._loadEvent(room, eventObservable.get());
    }

    async _loadEvent(room, eventEntry) {
        console.log("[LightboxViewModel] _loadEvent called", {
            hasEventEntry: !!eventEntry,
            eventId: eventEntry?.event?.event_id,
            type: eventEntry?.event?.type
        });
        
        if (!eventEntry) {
            console.warn("[LightboxViewModel] No event entry provided");
            return;
        }
        
        const {mediaRepository} = room;
        this._eventEntry = eventEntry;
        const {content} = this._eventEntry;
        
        console.log("[LightboxViewModel] Event content:", {
            hasUrl: !!content?.url,
            hasFile: !!content?.file,
            contentKeys: Object.keys(content || {}),
            mimeType: content?.info?.mimetype,
            size: content?.info?.size
        });
        
        this._date = this._eventEntry.event?.origin_server_ts ? new Date(this._eventEntry.event.origin_server_ts) : null;
        console.log("[LightboxViewModel] Timestamp:", {
            originServerTs: this._eventEntry.event?.origin_server_ts,
            date: this._date
        });
        
        try {
            if (content?.url) {
                console.log("[LightboxViewModel] Processing unencrypted image URL");
                this._unencryptedImageUrl = mediaRepository.mxcUrl(content.url);
                console.log("[LightboxViewModel] Unencrypted URL set to:", this._unencryptedImageUrl);
                this.emitChange("imageUrl");
            } else if (content?.file) {
                console.log("[LightboxViewModel] Processing encrypted file");
                this._decryptedImage = this.track(await mediaRepository.downloadEncryptedFile(content.file));
                console.log("[LightboxViewModel] Decrypted image result:", {
                    hasUrl: !!this._decryptedImage?.url,
                    blob: this._decryptedImage?.blob
                });
                this.emitChange("imageUrl");
            } else {
                console.warn("[LightboxViewModel] No URL or file found in content");
            }
        } catch (error) {
            console.error("[LightboxViewModel] Error loading image:", error);
            // Still emit change to update UI with error state if needed
            this.emitChange("imageUrl");
        }
    }

    get imageWidth() {
        return this._eventEntry?.content?.info?.w;
    }

    get imageHeight() {
        return this._eventEntry?.content?.info?.h;
    }

    get name() {
        return this._eventEntry?.content?.body;
    }

    get sender() {
        return this._eventEntry?.sender;
    }

    get imageUrl() {
        console.log("[LightboxViewModel] Getting imageUrl", {
            hasDecryptedImage: !!this._decryptedImage,
            hasUnencryptedUrl: !!this._unencryptedImageUrl,
            decryptedUrl: this._decryptedImage?.url,
            unencryptedUrl: this._unencryptedImageUrl
        });
        
        if (this._decryptedImage) {
            return this._decryptedImage.url;
        } else if (this._unencryptedImageUrl) {
            return this._unencryptedImageUrl;
        } else {
            return "";
        }
    }

    get date() {
        if (!this._eventEntry?.timestamp) {
            return "";
        }
        if (!this._date) {
            this._date = new Date(this._eventEntry.timestamp);
        }
        return this._date.toLocaleDateString({}, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    get time() {
        if (!this._eventEntry?.timestamp) {
            return "";
        }
        if (!this._date) {
            this._date = new Date(this._eventEntry.timestamp);
        }
        return this._date.toLocaleTimeString({}, {hour: "numeric", minute: "2-digit"});
    }

    get closeUrl() {
        return this._closeUrl;
    }

    close() {
        this.platform.history.pushUrl(this.closeUrl);
    }
}
