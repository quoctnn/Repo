import { Message } from '../reducers/conversationStore';
export class QueueUtilities {
static getQueuedMessageForConversation = (conversationId:number, allQueuedChatMessages:Message[]):Message[] => 
    {
        return allQueuedChatMessages.filter(m => m.conversation == conversationId)
    }
}

  