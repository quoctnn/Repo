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

  UPDATE_CONVERSATION_UNREAD_MESSAGES = 'UPDATE_CONVERSATION_UNREAD_MESSAGES',

  PROFILESTORE_ADD_PROFILE = 'PROFILESTORE_ADD_PROFILE',
  PROFILESTORE_ADD_PROFILES = 'PROFILESTORE_ADD_PROFILES',
  PROFILESTORE_RESET = 'PROFILESTORE_RESET',

  GROUPSTORE_ADD_GROUP = 'GROUPSTORE_ADD_GROUP',
  GROUPSTORE_ADD_GROUPS = 'GROUPSTORE_ADD_GROUPS',
  GROUPSTORE_RESET = 'GROUPSTORE_RESET',

  COMMUNITYSTORE_ADD_COMMUNITY = 'COMMUNITYSTORE_ADD_COMMUNITY',
  COMMUNITYSTORE_ADD_COMMUNITIES = 'COMMUNITYSTORE_ADD_COMMUNITIES',
  COMMUNITYSTORE_RESET = 'COMMUNITYSTORE_RESET',

  QUEUE_ADD_CHAT_MESSAGE = 'QUEUE_ADD_CHAT_MESSAGE',
  QUEUE_REMOVE_CHAT_MESSAGE = 'QUEUE_REMOVE_CHAT_MESSAGE',

  //pagination
  REQUEST_PAGE = 'REQUEST_PAGE',
  RECEIVE_PAGE = 'RECEIVE_PAGE',
  SET_SORTED_PAGE_IDS = 'SET_SORTED_PAGE_IDS',

  APPEND_ITEM_TO_PAGE = 'APPEND_ITEM_TO_PAGE',
  INSERT_ITEM_TO_PAGE = 'INSERT_ITEM_TO_PAGE',
  RESET_PAGED_DATA = 'RESET_PAGED_DATA',

  REQUEST_EMBEDLY_DATA = 'REQUEST_EMBEDLY_DATA',
  RECEIVE_EMBEDLY_DATA = 'RECEIVE_EMBEDLY_DATA',


  EMBEDLYSTORE_ADD_PAGES = 'EMBEDLYSTORE_ADD_PAGES',
  EMBEDLYSTORE_ADD_PAGES_TO_QUEUE = 'EMBEDLYSTORE_ADD_PAGES_TO_QUEUE',
  EMBEDLYSTORE_REMOVE_PAGES_FROM_QUEUE = 'EMBEDLYSTORE_REMOVE_PAGES_FROM_QUEUE',
  EMBEDLYSTORE_RESET = 'EMBEDLYSTORE_RESET',


}
