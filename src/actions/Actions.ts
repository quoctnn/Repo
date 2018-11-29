import { Types } from '../utilities/Types';
import { Group } from '../reducers/groupStore';
import { Community } from '../reducers/communityStore';
import { UserProfile } from '../reducers/profileStore';
import { Conversation, Message } from '../reducers/conversations';
import { conversationPaginator, conversationReducerKey } from '../reducers/conversations';
import { messagesPaginator, messageReducerKey } from '../reducers/messages';
import { InsertItemAction } from '../reducers/createPaginator';
import { EmbedlyItem } from '../reducers/embedlyStore';
import { statusesPaginator, Status, statusReducerKey } from '../reducers/statuses';

//embedly
export const requestEmbedlyData = (urls:string[]) => ({
  type: Types.REQUEST_EMBEDLY_DATA,
  urls,
});
export const embedlyStoreAddPages = (pages:EmbedlyItem[]) => ({
  type: Types.EMBEDLYSTORE_ADD_PAGES,
  pages
});
export const embedlyStoreAddPagesToQueue = (ids:string[]) => ({
  type: Types.EMBEDLYSTORE_ADD_PAGES_TO_QUEUE,
  ids
});
export const embedlyStoreRemovePagesFromQueue = (ids:string[]) => ({
  type: Types.EMBEDLYSTORE_REMOVE_PAGES_FROM_QUEUE,
  ids
});
export const resetEmbedlyStore = () => ({
  type: Types.EMBEDLYSTORE_RESET,
});


//paging
export const resetPagedData = () => ({
  type: Types.RESET_PAGED_DATA
});
//newsfeed
export const requestNextStatusPage = statusesPaginator.requestNextStatusPage
export const insertStatus = statusesPaginator.insertStatus
export const setStatusReactions = statusesPaginator.setStatusReactions


//messages
export const requestNextMessagePage = messagesPaginator.requestNextPage
export const insertChatMessage = (pagingId:string, message:Message):InsertItemAction => ({
    type: Types.INSERT_ITEM_TO_PAGE,
    meta:{key:messageReducerKey},
    item:message,
    isNew:true,
    pagingId
})
//conversations
export const setSortedConversationIds = conversationPaginator.setSortedIds
export const requestNextConversationPage = conversationPaginator.requestNextPage
export const insertConversation = (conversation:Conversation, isNew:boolean):InsertItemAction => ({
    type: Types.INSERT_ITEM_TO_PAGE,
    item:conversation,
    meta:{key:conversationReducerKey}
})

//queue status

export const queueAddStatus = (status: Status) => ({
  type: Types.QUEUE_ADD_STATUS,
  status
});
export const queueRemoveStatus = (status: Status) => ({
  type: Types.QUEUE_REMOVE_STATUS,
  status
});
export const queueProcessNextStatus = () => ({
  type: Types.QUEUE_PROCESS_NEXT_STATUS,
});
export const queueProcessStatus = (status: Status) => ({
  type: Types.QUEUE_PROCESS_STATUS,
  status
});
//queue message
export const queueProcessChatMessage = (message: Message) => ({
  type: Types.QUEUE_PROCESS_CHAT_MESSAGE,
  message
});
export const queueProcessNextChatMessage = () => ({
  type: Types.QUEUE_PROCESS_NEXT_CHAT_MESSAGE,
});
export const queueAddChatMessage = (message: Message) => ({
  type: Types.QUEUE_ADD_CHAT_MESSAGE,
  message: message
});
export const queueUpdateChatMessage = (message: Message) => ({
  type: Types.QUEUE_UPDATE_CHAT_MESSAGE,
  message: message
});
export const queueRemoveChatMessage = (message: Message) => ({
  type: Types.QUEUE_REMOVE_CHAT_MESSAGE,
  message: message
});
//queue general
export const resetQueueData = () => ({
  type: Types.QUEUE_RESET_DATA,
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
export const setSignedIn = (authToken:string|undefined) => ({
  type: Types.SET_SIGNED_IN,
  authToken,
});
export const setSignedInProfile = (profile:UserProfile|undefined) => ({
  type: Types.SET_SIGNED_IN_PROFILE,
  profile,
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
