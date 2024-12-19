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

import {TemplateView} from "../../general/TemplateView";
import "./PresenceIndicatorView.css";

export class PresenceIndicatorView extends TemplateView {
    constructor(vm) {
        super(vm);
        this._presenceMessage = "";
        if (vm) {
            this._updatePresenceMessage(vm);
        }
    }

    async _updatePresenceMessage(vm) {
        if (!vm?.activeUsers) {
            console.warn("[PresenceIndicatorView] No active users available");
            if (this._presenceMessage) {
                this._presenceMessage = "";
                this.update();
            }
            return;
        }
        const users = vm.activeUsers.array || [];
        const count = users.length;
        
        try {
            const message = count > 0 ? `${count} active member${count === 1 ? "" : "s"}` : "";
            if (this._presenceMessage !== message) {
                this._presenceMessage = message;
                this.update();
            }
        } catch (error) {
            console.error("[PresenceIndicatorView] Error updating presence message:", error);
            if (this._presenceMessage) {
                this._presenceMessage = "";
                this.update();
            }
        }
    }

    update(value) {
        super.update(value);
        const vm = value || this._value;
        if (vm) {
            this._updatePresenceMessage(vm);
        }
    }

    render(t, vm) {
        if (!vm) {
            console.warn("[PresenceIndicatorView] No view model available for render");
            return t.div({className: "room-presence-container"});
        }

        // Create a binding for the active users array to track changes
        t.mapSideEffect(
            vm => vm?.activeUsers?.array || [],
            users => {
                this._updatePresenceMessage(vm);
            }
        );

        // Create the DOM structure with bindings
        return t.div({className: "room-presence-container"}, [
            t.div({className: "PresenceIndicator"}, [
                t.div(
                    {
                        className: {
                            presence: true,
                            hidden: () => {
                                const isHidden = !this._presenceMessage;
                                return isHidden;
                            }
                        }
                    },
                    () => this._presenceMessage
                ),
            ]),
        ]);
    }
}

