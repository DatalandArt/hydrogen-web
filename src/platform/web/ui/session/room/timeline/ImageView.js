/*
Copyright 2020 Bruno Windels <bruno@windels.cloud>

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

import {BaseMediaView} from "./BaseMediaView.js";
import "./image-styles.css";

export class ImageView extends BaseMediaView {
    renderMedia(t, vm) {
        vm.platform.logger.run("ImageView.renderMedia", log => {
            // Only log primitive values and avoid circular references
            log.set("showInLightbox", !!vm.showInLightbox);
            log.set("isPending", !!vm.isPending);
            log.set("hasThumbnailUrl", !!vm.thumbnailUrl);
            log.set("hasLightboxImageUrl", !!vm.lightboxImageUrl);
            log.set("label", typeof vm.label === "string" ? vm.label : undefined);
            // Only log essential properties from value
            if (this.value) {
                log.set("valueProps", {
                    eventId: this.value.eventId,
                    roomId: this.value.roomId,
                    sender: this.value.sender,
                    timestamp: this.value.timestamp
                });
            }
        }, vm.platform.logger.level.Detail);

        const img = t.img({
            src: vm => vm.thumbnailUrl,
            alt: vm => vm.label,
            title: vm => vm.label,
            style: vm => `max-width: ${vm.width}px; max-height: ${vm.height}px; cursor: pointer;`,
            className: "timeline-image"
        });
        
        vm.platform.logger.log({l: "Wrapping image in anchor tag"}, vm.platform.logger.level.Detail);
        return t.a({
            href: "#",
            className: "timeline-image-link",
            onClick: evt => {
                vm.platform.logger.run("ImageView.onClick", log => {
                    log.set("type", "click");
                    evt.preventDefault();
                    evt.stopPropagation();

                    // Get the tile instance
                    const tile = this.value;
                    // Only log essential properties to avoid circular references
                    log.set("tileProps", {
                        eventId: tile.eventId,
                        roomId: tile.roomId,
                        sender: tile.sender,
                        timestamp: tile.timestamp
                    });

                    // Emit a custom event that can be caught by the parent component
                    const lightboxEvent = new CustomEvent('hydrogen:lightbox', {
                        bubbles: true,
                        composed: true,  // Allow event to cross shadow DOM boundary
                        detail: {
                            eventId: tile.eventId,
                            roomId: tile.roomId,
                            thumbnailUrl: tile.thumbnailUrl,
                            imageUrl: tile.lightboxImageUrl,
                            label: tile.label,
                            sender: tile.sender,
                            timestamp: tile.timestamp
                        }
                    });
                    // Only log essential properties from event detail
                    log.set("eventDetail", {
                        eventId: lightboxEvent.detail.eventId,
                        roomId: lightboxEvent.detail.roomId,
                        sender: lightboxEvent.detail.sender,
                        timestamp: lightboxEvent.detail.timestamp
                    });

                    // Try dispatching from both the target and the anchor element
                    evt.target.dispatchEvent(lightboxEvent);
                    evt.currentTarget.dispatchEvent(lightboxEvent);
                    // Also try dispatching from the root element
                    this.root().dispatchEvent(lightboxEvent);

                    // As a fallback, try creating the lightbox directly
                    try {
                        const LightboxView = require('./LightboxView.js').LightboxView;
                        const lightboxVM = {
                            imageUrl: tile.lightboxImageUrl || tile.thumbnailUrl,
                            name: tile.label,
                            sender: tile.sender,
                            time: new Date(tile.timestamp).toLocaleTimeString(),
                            date: new Date(tile.timestamp).toLocaleDateString(),
                            close: () => {
                                const lightboxElement = document.querySelector('.lightbox');
                                if (lightboxElement) {
                                    lightboxElement.remove();
                                }
                            }
                        };
                        const lightboxView = new LightboxView(lightboxVM);
                        document.body.appendChild(lightboxView.mount());
                        log.log({l: "Created and mounted lightbox view"}, log.level.Detail);
                    } catch (err) {
                        log.error = err;
                        log.log({l: "Failed to create lightbox directly"}, log.level.Error);
                    }
                });
            }
        }, img);
    }
}