import { parseStatusContextKey, StatusContextKeys } from '../reducers/statuses';
import { Status, Message } from '../types/intrasocial_types';
export class QueueUtilities {
    static getQueuedMessageForConversation = (conversationId:number, allQueuedChatMessages:Message[]):Message[] => 
    {
        return allQueuedChatMessages.filter(m => m.conversation == conversationId)
    }
    static getQueuedStatusesForFeed = (statusFeedId:string, allQueuedStatuses:Status[]):Status[] => 
    {
        if(statusFeedId == StatusContextKeys.NEWSFEED)
            return allQueuedStatuses
        let context = parseStatusContextKey(statusFeedId)
        return allQueuedStatuses.filter(m => m.context_natural_key == context.contextKey && m.context_object_id == context.contextId)
    }
}

  