import { Types } from '../utilities/Types';
import { Group } from '../reducers/groupStore';
import { Community } from '../reducers/communityStore';
import { UserProfile } from '../reducers/profileStore';
import { Conversation, Message } from '../reducers/conversationStore';
import { conversationPaginator, conversationReducerKey } from '../reducers/conversations';
import { messagesPaginator, messageReducerKey } from '../reducers/messages';
import { InsertItemAction } from '../reducers/createPaginator';
//paging
export const resetPagedData = () => ({
  type: Types.RESET_PAGED_DATA
});
//messages
export const requestNextMessagePage = messagesPaginator.requestNextPage
export const insertChatMessage = (pagingId:string, message:Message):InsertItemAction => ({
    type: Types.INSERT_ITEM_TO_PAGE,
    meta:{key:messageReducerKey},
    item:message,
    pagingId
})
//conversations
export const requestNextConversationPage = conversationPaginator.requestNextPage
export const insertConversation = (conversation:Conversation):InsertItemAction => ({
    type: Types.INSERT_ITEM_TO_PAGE,
    item:conversation,
    meta:{key:conversationReducerKey}
})

//queue
export const queueAddChatMessage = (message: Message) => ({
  type: Types.QUEUE_ADD_CHAT_MESSAGE,
  message: message
});
export const queueRemoveChatMessage = (message: Message) => ({
  type: Types.QUEUE_REMOVE_CHAT_MESSAGE,
  message: message
});

//profileStore
export const storeProfiles = (profiles: UserProfile[]) => ({
  type: Types.PROFILESTORE_ADD_PROFILES,
  profiles: profiles
});
export const storeProfile = (profile: UserProfile) => ({
  type: Types.PROFILESTORE_ADD_PROFILE,
  profile: profile
});
export const resetProfileStore = () => ({
  type: Types.PROFILESTORE_RESET
});

//conversationStore
export const storeConversations = (conversations: Conversation[]) => ({
  type: Types.CONVERSATIONSTORE_ADD_CONVERSATIONS,
  conversations: conversations
});
export const storeConversation = (conversation: Conversation) => ({
  type: Types.CONVERSATIONSTORE_ADD_CONVERSATION,
  conversation: conversation
});
export const resetConversationStore = () => ({
  type: Types.RESET_CONVERSATION_LIST_CACHE
});

//communityStore
export const storeCommunities = (communities: Community[]) => ({
  type: Types.COMMUNITYSTORE_ADD_COMMUNITIES,
  communities: communities
});
export const storeCommunity = (community: Community) => ({
  type: Types.COMMUNITYSTORE_ADD_COMMUNITY,
  community: community
});
export const resetCommunityStore = () => ({
  type: Types.COMMUNITYSTORE_RESET
});

//groupStore
export const storeGroups = (groups: Group[]) => ({
  type: Types.GROUPSTORE_ADD_GROUPS,
  groups: groups
});
export const storeGroup = (group: Group) => ({
  type: Types.GROUPSTORE_ADD_GROUP,
  group: group
});
export const resetGroupStore = () => ({
  type: Types.GROUPSTORE_RESET
});

//contactListCache
export const setContactListCache = (contacts: number[]) => ({
  type: Types.SET_CONTACT_LIST_CACHE,
  contacts: contacts
});
export const appendContactListCache = (contacts: number[]) => ({
  type: Types.APPEND_CONTACT_LIST_CACHE,
  contacts: contacts
});
export const resetContactListCache = () => ({
  type: Types.RESET_CONTACT_LIST_CACHE
});

//conversationListCache
export const setConversationListCache = (
  conversations: number[],
  total: number
) => ({
  type: Types.SET_CONVERSATION_LIST_CACHE,
  conversations: conversations,
  total: total
});
export const appendConversationListCache = (conversations: number[]) => ({
  type: Types.APPEND_CONVERSATION_LIST_CACHE,
  conversations: conversations
});
export const resetConversationListCache = () => ({
  type: Types.RESET_CONVERSATION_LIST_CACHE
});

//groupListCache
export const setCommunityGroupsCache = (
  community: number,
  groups: number[],
  total: number
) => ({
  type: Types.SET_COMMUNITY_GROUPS_CACHE,
  groups: groups,
  community: community,
  total: total
});
export const appendCommunityGroupsCache = (
  community: number,
  groups: number[]
) => ({
  type: Types.APPEND_COMMUNITY_GROUPS_CACHE,
  groups: groups,
  community: community
});
export const resetCommunityGroupsCache = () => ({
  type: Types.RESET_COMMUNITY_GROUPS_CACHE
});

//debug
export const setApiEndpoint = (index: number) => ({
  type: Types.SET_API_ENDPOINT,
  apiEndpoint: index
});
export const setAccessTokenOverride = (accessToken: string) => ({
  type: Types.SET_ACCESS_TOKEN_OVERRIDE,
  accessToken: accessToken
});
export const setAuthorizationData = (token: string, sessionid: string) => ({
  type: Types.SET_AUTORIZATION_DATA,
  token: token,
  sessionid: sessionid
});

//settings
export const setLanguage = (index: number) => ({
  type: Types.SET_LANGUAGE,
  language: index
});
export const setTheme = (index: number) => ({
  type: Types.SET_THEME,
  theme: index
});
export const setSignedIn = (signedIn: boolean) => ({
  type: Types.SET_SIGNED_IN,
  signedIn: signedIn
});
export const setAwayTimeout = (timeout: number) => ({
  type: Types.SET_AWAY_TIMEOUT,
  timeout: timeout
});
//profile

export interface UpdateProfileAction {
  type: Types;
  profile: UserProfile;
}

export type SetProfileAction = (profile: UserProfile) => UpdateProfileAction;
export const setProfile: SetProfileAction = (profile: UserProfile) => ({
  type: Types.SET_PROFILE,
  profile: profile
});
