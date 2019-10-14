import { ProfileManager } from '../managers/ProfileManager';
import {  nullOrUndefined } from '../utilities/Utilities';
import { CommunityManager } from '../managers/CommunityManager';
import { ContextNaturalKey, Permissible, Task, Community, Project, UserProfile, Group, Event, ContextSegmentKey, IdentifiableObject, Conversation, Linkable } from '../types/intrasocial_types';
import { ConversationManager } from './ConversationManager';

export type ResolvedContextObject = {
    contextNaturalKey:ContextNaturalKey
    contextObjectId:number
    resolved:number
}
type StringDictionary = {[key:string]:string}
type KeyValuePair = {key:string, value:string}
export type ResolvedContextObjects = {
    task?:Task
    project?:Project
    community?:Community
    profile?:UserProfile
    event?:Event
    group?:Group
    conversation?:Conversation
    success:boolean
    resolvedPath?:string
}

export abstract class ContextManager
{
    static objectFetchers:{[key:string]:(id:string, completion:(object:Permissible & IdentifiableObject & Linkable) => void) => void} = {}
    static objectResolvers:{[key:string]:(id:string) => Permissible & IdentifiableObject & Linkable} = {}
    static setup = () =>
    {
        ContextManager.objectFetchers[ContextSegmentKey.COMMUNITY] = CommunityManager.ensureCommunityExists
        ContextManager.objectFetchers[ContextSegmentKey.USER] = ProfileManager.ensureProfileExists as any
        ContextManager.objectFetchers[ContextSegmentKey.CONVERSATION] = ConversationManager.ensureConversationExists as any


        ContextManager.objectResolvers[ContextSegmentKey.COMMUNITY] = CommunityManager.getCommunity
        ContextManager.objectResolvers[ContextSegmentKey.USER] = ProfileManager.getProfile
        ContextManager.objectResolvers[ContextSegmentKey.CONVERSATION] = ConversationManager.getConversation
    }
    static getStoreObject = (key:ContextNaturalKey, id:string|number) => {
        let resolver:(id: string) => Permissible & IdentifiableObject & Linkable = null
        switch (key) {
            case ContextNaturalKey.COMMUNITY:resolver = CommunityManager.getCommunity;break;
            case ContextNaturalKey.USER:resolver = ProfileManager.getProfile;break;
            case ContextNaturalKey.CONVERSATION:resolver = ConversationManager.getConversation;break;
            default:
                break;
        }
        if(resolver)
            return resolver(id.toString())
        return null
    }
    static ensureObjectExists = (key:ContextNaturalKey, id:string|number) => {
        const object = ContextManager.getStoreObject(key, id)
        if(!object)
        {
            const fetcher = ContextManager.objectFetchers[ContextSegmentKey.keyForNaturalKey(key)]
            if(fetcher)
            {
                fetcher(id.toString(), () => {})
            }
        }
    }
    static pathToDictionary = (path:string) => {
        const dict:StringDictionary = {}
        const segments = path.split("/").filter(f => !nullOrUndefined(f) && f != "")
        if(segments.length > 0 && segments.length % 2 == 0)
        {
            for (let index = 0; index < segments.length; index += 2) {
                dict[segments[index]] = segments[index + 1]
            }
        }
        return dict
    }
    private static dictionaryToEntries = (dict:StringDictionary):KeyValuePair[] => {
        return Object.keys( dict ).map(k => { return {key:k, value:dict[k]}}).filter(f => !nullOrUndefined(f.value) && f.value != "")
    }
}