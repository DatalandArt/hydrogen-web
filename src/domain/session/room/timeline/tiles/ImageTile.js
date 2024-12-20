/*
Copyright 2020 Bruno Windels <bruno@windels.cloud>
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

import {BaseMediaTile} from "./BaseMediaTile.js";

export class ImageTile extends BaseMediaTile {
    constructor(entry, options) {
        super(entry, options);
        this._showInLightbox = true;  // Always enable lightbox
        console.log('ImageTile constructor', {
            entry,
            showInLightbox: this._showInLightbox,
            isPending: this.isPending
        });
    }

    get showInLightbox() {
        console.log('ImageTile.showInLightbox called', this._showInLightbox);
        return this._showInLightbox;
    }

    get eventId() {
        return this._entry.id;
    }

    get roomId() {
        return this._room.id;
    }

    // Get the full-size image URL for the lightbox
    get lightboxImageUrl() {
        if (this._decryptedFile) {
            return this._decryptedFile.url;
        }
        const content = this._getContent();
        const mxcUrl = content?.url;
        if (typeof mxcUrl === "string") {
            // Use the original size for lightbox
            return this._mediaRepository.mxcUrl(mxcUrl);
        }
        // Fallback to thumbnail if full image not available
        return this.thumbnailUrl;
    }

    get sender() {
        return this._entry.sender;
    }

    get timestamp() {
        return this._entry.timestamp;
    }

    get shape() {
        return "image";
    }
}