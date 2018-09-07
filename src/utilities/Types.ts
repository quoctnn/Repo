export enum Types {
  SET_API_ENDPOINT = 'SET_API_ENDPOINT',
  SET_ACCESS_TOKEN_OVERRIDE = 'SET_ACCESS_TOKEN_OVERRIDE',
  SET_LANGUAGE = 'SET_LANGUAGE',
  SET_THEME = 'SET_THEME',
  SET_AWAY_TIMEOUT = 'SET_AWAY_TIMEOUT',
  SET_AUTORIZATION_DATA = 'SET_AUTORIZATION_DATA',
  SET_PROFILE = 'SET_PROFILE',
  SET_SIGNED_IN = 'SET_SIGNED_IN',

  SET_COMMUNITY_GROUPS_CACHE = 'SET_COMMUNITY_GROUPS_CACHE',
  APPEND_COMMUNITY_GROUPS_CACHE = 'APPEND_COMMUNITY_GROUPS_CACHE',
  RESET_COMMUNITY_GROUPS_CACHE = 'RESET_COMMUNITY_GROUPS_CACHE',

  SET_CONTACT_LIST_CACHE = 'SET_CONTACT_LIST_CACHE',
  APPEND_CONTACT_LIST_CACHE = 'APPEND_CONTACT_LIST_CACHE',
  RESET_CONTACT_LIST_CACHE = 'RESET_CONTACT_LIST_CACHE',

  SET_CONVERSATION_LIST_CACHE = 'SET_CONVERSATION_LIST_CACHE',
  APPEND_CONVERSATION_LIST_CACHE = 'APPEND_CONVERSATION_LIST_CACHE',
  RESET_CONVERSATION_LIST_CACHE = 'RESET_CONVERSATION_LIST_CACHE',

  RESET_CONVERSATIONS = 'RESET_CONVERSATIONS',
  RESET_MESSAGES = 'RESET_MESSAGES',

  PROFILESTORE_ADD_PROFILE = 'PROFILESTORE_ADD_PROFILE',
  PROFILESTORE_ADD_PROFILES = 'PROFILESTORE_ADD_PROFILES',
  PROFILESTORE_RESET = 'PROFILESTORE_RESET',

  GROUPSTORE_ADD_GROUP = 'GROUPSTORE_ADD_GROUP',
  GROUPSTORE_ADD_GROUPS = 'GROUPSTORE_ADD_GROUPS',
  GROUPSTORE_RESET = 'GROUPSTORE_RESET',

  COMMUNITYSTORE_ADD_COMMUNITY = 'COMMUNITYSTORE_ADD_COMMUNITY',
  COMMUNITYSTORE_ADD_COMMUNITIES = 'COMMUNITYSTORE_ADD_COMMUNITIES',
  COMMUNITYSTORE_RESET = 'COMMUNITYSTORE_RESET',

  CONVERSATIONSTORE_ADD_CONVERSATION = 'CONVERSATIONSTORE_ADD_CONVERSATION',
  CONVERSATIONSTORE_ADD_CONVERSATIONS = 'CONVERSATIONSTORE_ADD_CONVERSATIONS',
  CONVERSATIONSTORE_RESET = 'CONVERSATIONSTORE_RESET',

  QUEUE_ADD_CHAT_MESSAGE = 'QUEUE_ADD_CHAT_MESSAGE',
  QUEUE_REMOVE_CHAT_MESSAGE = 'QUEUE_REMOVE_CHAT_MESSAGE',

  //pagination
  REQUEST_PAGE = 'REQUEST_PAGE',
  RECEIVE_PAGE = 'RECEIVE_PAGE',
  APPEND_ITEM_TO_PAGE = 'APPEND_ITEM_TO_PAGE',
  INSERT_ITEM_TO_PAGE = 'INSERT_ITEM_TO_PAGE',
  RESET_PAGED_DATA = 'RESET_PAGED_DATA'
}
