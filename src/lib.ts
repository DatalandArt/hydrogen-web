/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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

export {Platform} from "./platform/web/Platform.js";
export {Client, LoadStatus} from "./matrix/Client.js";
export {createNavigation, createRouter} from "./domain/navigation/index";
export {MessageComposer} from "./platform/web/ui/session/room/MessageComposer.js";
export {RoomViewModel} from "./domain/session/room/RoomViewModel.js";
export {TimelineView} from "./platform/web/ui/session/room/TimelineView";
export {viewClassForTile} from "./platform/web/ui/session/room/common";
export {FeatureSet, FeatureFlag} from "./features";

// export {Logger} from "./logging/Logger";
export type {ILogItem} from "./logging/types";
// export {IDBLogPersister} from "./logging/IDBLogPersister";
// export {ConsoleReporter} from "./logging/ConsoleReporter";

// export {BlobHandle} from "./platform/web/dom/BlobHandle";

// export {PasswordLoginMethod} from "./matrix/login/PasswordLoginMethod";
// export {TokenLoginMethod} from "./matrix/login/TokenLoginMethod";
// export {RoomStatus} from "./matrix/room/common";

// export {KeyType} from "./matrix/ssss";
// // export everything needed to observe state events on all rooms using session.observeRoomState
// export type {RoomStateHandler} from "./matrix/room/state/types";
// export type {MemberChange} from "./matrix/room/members/RoomMember";
// export type {Transaction} from "./matrix/storage/idb/Transaction";
// export type {Room} from "./matrix/room/Room";
// export type {StateEvent} from "./matrix/storage/types";
// export {MemberList} from "./matrix/room/members/MemberList.js";
// export {PowerLevels} from "./matrix/room/PowerLevels.js";
// // export main view & view models

// export {RootViewModel} from "./domain/RootViewModel.js";
// export {RootView} from "./platform/web/ui/RootView.js";
// export {SessionViewModel} from "./domain/session/SessionViewModel.js";
// export {SessionView} from "./platform/web/ui/session/SessionView.js";

// export {RoomView} from "./platform/web/ui/session/room/RoomView.js";
// export {StaticView} from "./platform/web/ui/general/StaticView.js";
// export {RightPanelView} from "./platform/web/ui/session/rightpanel/RightPanelView.js";
export {LightboxView} from "./platform/web/ui/session/room/LightboxView.js";
// export {ListView} from "./platform/web/ui/general/ListView";
// export {RoomBeingCreatedView} from "./platform/web/ui/session/room/RoomBeingCreatedView.js";
// export {UnknownRoomView} from "./platform/web/ui/session/room/UnknownRoomView.js";
// export {SessionStatusView} from "./platform/web/ui/session/SessionStatusView.js";
// export {TimelineViewModel} from "./domain/session/room/timeline/TimelineViewModel.js";
// export {tileClassForEntry} from "./domain/session/room/timeline/tiles/index";
// export type {
//     TimelineEntry,
//     TileClassForEntryFn,
//     Options,
//     TileConstructor,
// } from "./domain/session/room/timeline/tiles/index";
// // export timeline tile view models
// export {GapTile} from "./domain/session/room/timeline/tiles/GapTile.js";
// export {TextTile} from "./domain/session/room/timeline/tiles/TextTile.js";
// export {RedactedTile} from "./domain/session/room/timeline/tiles/RedactedTile.js";
// export {ImageTile} from "./domain/session/room/timeline/tiles/ImageTile.js";
// export {VideoTile} from "./domain/session/room/timeline/tiles/VideoTile.js";
// export {FileTile} from "./domain/session/room/timeline/tiles/FileTile.js";
// export {LocationTile} from "./domain/session/room/timeline/tiles/LocationTile.js";
// export {RoomNameTile} from "./domain/session/room/timeline/tiles/RoomNameTile.js";
// export {RoomMemberTile} from "./domain/session/room/timeline/tiles/RoomMemberTile.js";
// export {EncryptedEventTile} from "./domain/session/room/timeline/tiles/EncryptedEventTile.js";
// export {EncryptionEnabledTile} from "./domain/session/room/timeline/tiles/EncryptionEnabledTile.js";
// export {MissingAttachmentTile} from "./domain/session/room/timeline/tiles/MissingAttachmentTile.js";
// export {SimpleTile} from "./domain/session/room/timeline/tiles/SimpleTile";

// // export right-panel view models/ views
// export {MemberListViewModel} from "./domain/session/rightpanel/MemberListViewModel.js";
// export {MemberListView} from "./platform/web/ui/session/rightpanel/MemberListView.js";

// export type {TileViewConstructor, ViewClassForEntryFn} from "./platform/web/ui/session/room/TimelineView";
// // export timeline tile views
// export {AnnouncementView} from "./platform/web/ui/session/room/timeline/AnnouncementView.js";
// export {BaseMediaView} from "./platform/web/ui/session/room/timeline/BaseMediaView.js";
// export {BaseMessageView} from "./platform/web/ui/session/room/timeline/BaseMessageView.js";
// export {FileView} from "./platform/web/ui/session/room/timeline/FileView.js";
// export {GapView} from "./platform/web/ui/session/room/timeline/GapView.js";
// export {ImageView} from "./platform/web/ui/session/room/timeline/ImageView.js";
// export {LocationView} from "./platform/web/ui/session/room/timeline/LocationView.js";
// export {MissingAttachmentView} from "./platform/web/ui/session/room/timeline/MissingAttachmentView.js";
// export {ReactionsView} from "./platform/web/ui/session/room/timeline/ReactionsView.js";
// export {RedactedView} from "./platform/web/ui/session/room/timeline/RedactedView.js";
// export {ReplyPreviewView} from "./platform/web/ui/session/room/timeline/ReplyPreviewView.js";
// export {TextMessageView} from "./platform/web/ui/session/room/timeline/TextMessageView.js";
// export {VideoView} from "./platform/web/ui/session/room/timeline/VideoView.js";

// export {Navigation} from "./domain/navigation/Navigation.js";
// export {ComposerViewModel} from "./domain/session/room/ComposerViewModel.js";

// export {TemplateView} from "./platform/web/ui/general/TemplateView";
// export {LazyListView} from "./platform/web/ui/general/LazyListView";
// export type {Builder} from "./platform/web/ui/general/TemplateView";
// export {ViewModel} from "./domain/ViewModel";
// export {LoadingView} from "./platform/web/ui/general/LoadingView.js";
// export {AvatarView} from "./platform/web/ui/AvatarView.js";
// export {RoomType} from "./matrix/room/common";
// export {EventEmitter} from "./utils/EventEmitter";
// export {Disposables} from "./utils/Disposables";
// export {LocalMedia} from "./matrix/calls/LocalMedia";
// export {spinner} from "./platform/web/ui/common";

// // these should eventually be moved to another library
// export {ObservableArray, SortedArray, MappedList, AsyncMappedList, ConcatList, ObservableMap} from "./observable/index";
// export {BaseObservableValue, ObservableValue, RetainedObservableValue} from "./observable/value";
// export {FilteredMap, JoinedMap, ApplyMap, LogMap, MappedMap} from "./observable/map";

// export {avatarInitials, getIdentifierColorNumber, getAvatarHttpUrl} from "./domain/avatar";

// export {renderStaticAvatar} from "./platform/web/ui/avatar.js";
