import { ComponentProps, useContext, useEffect, useRef, useState } from 'react';
import {
  LoadStatus,
  MessageComposer,
  RoomViewModel,
  TimelineView,
  viewClassForTile,
  FeatureSet,
} from 'hydrogen-view-sdk';

const sounds = import('@components/Sounds').then((module) => module.default);

import { EditorContext } from './Provider';

import cn from 'classnames';
import type {
  ClientType,
  ImageTileType,
  MessageComposerType,
  NavigationType,
  OptionsType,
  PlatformType,
  RoomMemberTileType,
  RouterType,
  TextTileType,
  TileType,
  VideoTileType,
} from './hydrogen.types';

import './hydrogen.slim.css';

export type EphemeralEventType = {
  type: string;
  content: {
    user_ids: string[];
  };
};

const i18n = {
  NotLoading: 'Idle',
  Login: 'Signing in',
  LoginFailed: 'Unable to sign in to synapse',
  QueryAccount: 'Fetching account info',
  AccountSetup: 'Setting up account',
  Loading: 'Loading',
  SessionSetup: 'Initializing session',
  Migrating: 'Migrating',
  FirstSync: 'Synchronizing',
  Error: 'There was an error connecting',
  Ready: 'Rendering thread',
};

interface PresenceType {
  isActive: boolean;
  isTyping: boolean;
}

// TODO: Have a way to add a handler on when rooms are set
// then trigger this to update what the join list should be.
export default function Component({
  roomId,
  visible = true,
  message,
  lnmUserAddress,
  onAnnouncement,
  onMessage,
  onImage,
  onKeyPress,
  onRoomCreated,
  onRoomEntered,
  onAgentPresence,
  ...props
}: {
  roomId?: string | null;
  visible?: boolean;
  message?: string | HTMLImageElement | HTMLCanvasElement | null;
  lnmUserAddress: string;
  maxImageWidth?: number;
  maxImageHeight?: number;
  onAnnouncement?: (member: RoomMemberTileType) => void;
  onMessage?: (message: TextTileType) => void;
  onImage?: (image: ImageTileType | VideoTileType) => void;
  onKeyPress?: (key: string) => void;
  onRoomCreated?: (roomId: string) => void;
  onRoomEntered?: (roomId: string) => void;
  onAgentPresence?: (agentPresence: PresenceType) => void;
} & ComponentProps<'div'>) {
  const {
    client,
    platform,
    router,
    navigation,
    status,
    isLoaded,
    isLoadingRoom,
    setIsLoadingRoom,
  } = useContext(EditorContext);
  const refs = useRef<{ composer: null | MessageComposerType }>({
    composer: null,
  });
  const [error, setError] = useState<string>('');
  const domElement = useRef<HTMLDivElement | null>(null);
  const [agentPresence, setAgentPresence] = useState<PresenceType>({
    isActive: false,
    isTyping: false,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(mount, [client, status, roomId, isLoaded, lnmUserAddress]);
  useEffect(() => {
    if (!message) {
      return;
    }
    if (typeof message === 'string') {
      sendMessage(message);
    } else if (
      message instanceof HTMLCanvasElement ||
      message instanceof HTMLImageElement
    ) {
      sendImage(message);
    }
  }, [message]);

  useEffect(() => {
    onAgentPresence?.(agentPresence);
  }, [agentPresence, onAgentPresence]);

  function mount() {
    if (!isLoaded) {
      return;
    }

    let textarea: HTMLTextAreaElement | null | undefined;
    let submit: HTMLButtonElement | null | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let vm: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      features: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      view: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      composer: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      unsubscribeTypingUsers: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      unsubscribeActiveUsers: any;
    const container = domElement.current;

    if (client && platform && router && navigation) {
      setup(client, platform, router, navigation);
    }

    return unmount;

    async function setup(
      client: ClientType,
      platform: PlatformType,
      router: RouterType,
      navigation: NavigationType
    ) {
      if (client.loginFailure) {
        setError(`Login failed: ${client.loginFailure}`);
      } else if (client.loadError) {
        setError(`LNM client error: ${client.loadError.message}`);
      } else {
        const { session } = client;
        if (setIsLoadingRoom) setIsLoadingRoom(true);
        // Looks for room corresponding to #element-dev:matrix.org,
        // assuming it is already joined
        let room;
        if (roomId === null) {
          const roomBeingCreated = await session.createRoom({
            invites: [lnmUserAddress],
          } as OptionsType);
          if (onRoomCreated) {
            onRoomCreated(roomBeingCreated.roomId);
          }
          room = session.rooms.get(roomBeingCreated.roomId);
        } else if (typeof roomId === 'string' && session.rooms.get(roomId)) {
          room = session.rooms.get(roomId);
        } else {
          room = session.rooms.values().next().value;
        }
        features = await FeatureSet.load(platform.settingsStorage);
        vm = new RoomViewModel({
          room,
          ownUserId: session.userId,
          platform,
          urlRouter: router,
          navigation,
          features,
          imageSizeConfig: {
            maxWidth: 1200,
            maxHeight: 800,
          },
        });
        await vm.load();
        onRoomEntered?.(room.id);

        unsubscribeTypingUsers = vm.typingUsers?.subscribe({
          onAdd: (/*idx, value*/) => {
            setAgentPresence((prevAgentPresence) => ({
              ...prevAgentPresence,
              isTyping: true,
            }));
          },
          onRemove: (/*idx, value*/) => {
            setAgentPresence((prevAgentPresence) => ({
              ...prevAgentPresence,
              isTyping: false,
            }));
          },
        });

        setAgentPresence({
          isTyping: false,
          isActive: vm.activeUsers.array.some((user) => {
            console.log('user', user);
            return user.startsWith('@lnm');
          }),
        });

        unsubscribeActiveUsers = vm.activeUsers.subscribe({
          onAdd: (idx, value) => {
            if (value.startsWith('@lnm')) {
              setAgentPresence((prevAgentPresence) => ({
                ...prevAgentPresence,
                isActive: true,
              }));
            }
          },
          onUpdate: (idx, value) => {
            console.log('activeUsers.onUpdate', idx, value);
          },
          onRemove: (idx, value) => {
            if (value.startsWith('@lnm')) {
              setAgentPresence((prevAgentPresence) => ({
                ...prevAgentPresence,
                isActive: false,
              }));
            }
          },
        });

        vm.composerViewModel.on(
          'change',
          (event?: 'canSend' | 'replyViewModel' | 'focus') => {
            const tiles = vm.timelineViewModel.tiles.array || [];
            const latest: TileType = tiles[tiles.length - 1];
            // A message was received from the matrix server:
            if (typeof event === 'undefined' && latest) {
              switch (latest.shape) {
                case 'announcement':
                  // User "joined" or "left" room
                  onAnnouncement && onAnnouncement(latest);
                  break;
                case 'video':
                case 'image':
                  // An image is sent across the network
                  onImage && onImage(latest);
                  break;
                case 'message':
                  // Text message is sent across the network
                  sounds.then(({ trigger }) => trigger('success'));
                  onMessage && onMessage(latest);
                  break;
                default:
                  console.log('composerViewModel.change', latest);
              }
            }
          }
        );

        view = new TimelineView(vm.timelineViewModel, viewClassForTile);
        container?.appendChild(view.mount());

        composer = refs.current.composer = new MessageComposer(
          vm.composerViewModel,
          viewClassForTile
        );

        container?.appendChild(composer.mount());

        textarea = container?.querySelector('.MessageComposer_input textarea');
        if (textarea) {
          textarea.addEventListener('keypress', keypress);
          textarea.placeholder = 'Message LNM...';
        }

        submit = container?.querySelector(
          '.MessageComposer_input > button.send'
        );
        if (submit) {
          submit.addEventListener('click', onSubmit);
        }

        if (setIsLoadingRoom) setIsLoadingRoom(false);
      }
    }

    function keypress(e: globalThis.KeyboardEvent) {
      if (onKeyPress) {
        onKeyPress(e.key);
      }
    }

    function onSubmit() {
      sounds.then(({ trigger }) => trigger('on', 0));
    }

    function unmount() {
      if (textarea) {
        textarea.removeEventListener('keypress', keypress);
      }
      if (submit) {
        submit.removeEventListener('click', onSubmit);
      }
      if (container) {
        container.innerHTML = '';
      }
      if (vm) {
        vm.dispose();
      }
      if (view) {
        view.unmount();
      }
      if (composer) {
        composer.unmount();
      }
      if (unsubscribeTypingUsers) {
        unsubscribeTypingUsers();
      }
      if (unsubscribeActiveUsers) {
        unsubscribeActiveUsers();
      }
    }
  }

  async function sendMessage(message: string) {
    if (!refs.current.composer) {
      console.warn('MessageComposer does not exist or has not mounted yet.');
      return;
    }
    try {
      await refs.current.composer.value.sendMessage(message);
    } catch (e) {
      console.error(e);
    }
  }

  async function sendImage(image: HTMLImageElement | HTMLCanvasElement) {
    if (!refs.current.composer) {
      console.warn('MessageComposer does not exist or has not mounted yet.');
      return;
    }
    try {
      await refs.current.composer.value._roomVM._sendPicture(image);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div
      {...props}
      className={cn(props.className, 'editor', { hidden: !visible })}
    >
      <div ref={domElement} className="hydrogen" />
      <div
        className={cn('lobby', {
          ready:
            status === LoadStatus.Ready &&
            !isLoadingRoom &&
            agentPresence.isActive,
        })}
      >
        <p>
          Living Encyclopedia
          <br />
          Large Nature Model (LNM)
        </p>
        {error && <p className="status">{error}</p>}
        {!error && <p className="status">{i18n[status]}...</p>}
        {status === LoadStatus.Ready && !agentPresence.isActive && (
          <p className="status">Agent is offline</p>
        )}
      </div>
    </div>
  );
}
