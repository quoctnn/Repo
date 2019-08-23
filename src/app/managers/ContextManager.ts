import {  Store } from 'redux';
import { ReduxState } from '../redux';
import { ProfileManager } from '../managers/ProfileManager';
import {  nullOrUndefined } from '../utilities/Utilities';
import { GroupManager } from '../managers/GroupManager';
import { CommunityManager } from '../managers/CommunityManager';
import { EventManager } from './EventManager';
import { TaskManager } from './TaskManager';
import { ProjectManager } from './ProjectManager';
import { ContextNaturalKey, Permissible, Task, Community, Project, UserProfile, Group, Event, ContextSegmentKey, IdentifiableObject, Conversation, Linkable } from '../types/intrasocial_types';
import { ConversationManager } from './ConversationManager';
import { AuthenticationManager } from './AuthenticationManager';
import Routes from '../utilities/Routes';

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
        ContextManager.objectFetchers[ContextSegmentKey.PROJECT] = ProjectManager.ensureProjectExists as any
        ContextManager.objectFetchers[ContextSegmentKey.TASK] = TaskManager.ensureTaskExists as any
        ContextManager.objectFetchers[ContextSegmentKey.GROUP] = GroupManager.ensureGroupExists as any
        ContextManager.objectFetchers[ContextSegmentKey.EVENT] = EventManager.ensureEventExists as any
        ContextManager.objectFetchers[ContextSegmentKey.USER] = ProfileManager.ensureProfileExists as any
        ContextManager.objectFetchers[ContextSegmentKey.CONVERSATION] = ConversationManager.ensureConversationExists as any

        ContextManager.objectResolvers[ContextSegmentKey.COMMUNITY] = CommunityManager.getCommunity
        ContextManager.objectResolvers[ContextSegmentKey.PROJECT] = ProjectManager.getProject
        ContextManager.objectResolvers[ContextSegmentKey.TASK] = TaskManager.getTask
        ContextManager.objectResolvers[ContextSegmentKey.GROUP] = GroupManager.getGroup
        ContextManager.objectResolvers[ContextSegmentKey.EVENT] = EventManager.getEvent
        ContextManager.objectResolvers[ContextSegmentKey.USER] = ProfileManager.getProfile
        ContextManager.objectResolvers[ContextSegmentKey.CONVERSATION] = ConversationManager.getConversation
    }
    static getStoreObject = (key:ContextNaturalKey, id:string|number) => {
        let resolver:(id: string) => Permissible & IdentifiableObject & Linkable = null
        switch (key) {
            case ContextNaturalKey.COMMUNITY:resolver = CommunityManager.getCommunity;break;
            case ContextNaturalKey.PROJECT:resolver = ProjectManager.getProject;break;
            case ContextNaturalKey.TASK:resolver = TaskManager.getTask;break;
            case ContextNaturalKey.GROUP:resolver = GroupManager.getGroup;break;
            case ContextNaturalKey.EVENT:resolver = EventManager.getEvent;break;
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
    static resolveContextObjects = (path:string, completion:(resolved:ResolvedContextObjects) => void) => {
        const dict = ContextManager.pathToDictionary(path)
        const keys = Object.keys(dict)
        if(keys.length > 0)
        {
            const entries = ContextManager.dictionaryToEntries(dict)
            ContextManager.resolveInitialContextObjects(dict, (resolved) => {

                const primaryKey = entries[entries.length - 1]
                if(primaryKey )
                {
                    const primaryObject = resolved[primaryKey.key]
                    if(primaryObject)
                    {
                        resolved.resolvedPath = primaryObject.uri
                        ContextManager.resolveRest(dict, primaryObject.uri, (rest) => {
                            const data:ResolvedContextObjects = {...resolved, ...rest}
                            const resolvedLength = entries.map(e => data[e.key]).filter(o => !nullOrUndefined(o)).length
                            data.success = resolvedLength == entries.length
                            completion(data)
                        })
                        return
                    }
                }
                completion(resolved)
            })
        }
        else {

            completion({success:true})
        }
    }
    private static resolveRest = (origDict:StringDictionary, path:string, completion:(resolved:ResolvedContextObjects) => void) => {
        const d = ContextManager.pathToDictionary(path)
        const keys = Object.keys(origDict)
        keys.forEach(k => {
            const v = origDict[k]
            if(d[k] == v)
                delete d[k]
        })
        const restKeys = Object.keys(d)
        if(restKeys.length > 0)
        {
            //console.log("rest", restKeys)
            ContextManager.resolveInitialContextObjects(d, completion)
            return
        }
        completion({success:true})
    }
    private static dictionaryToEntries = (dict:StringDictionary):KeyValuePair[] => {
        return Object.keys( dict ).map(k => { return {key:k, value:dict[k]}}).filter(f => !nullOrUndefined(f.value) && f.value != "")
    }
    private static resolveInitialContextObjects = (dict:StringDictionary, completion:(resolved:ResolvedContextObjects) => void) => {
        const resolved:ResolvedContextObjects = {success:false}
        const entries = ContextManager.dictionaryToEntries(dict)
        let count = entries.length
        const done = () => {
            count -= 1
            if(count == 0)
            {
                completion(resolved)
            }
        }
        entries.forEach(entry => {
            const objectResolver = ContextManager.objectFetchers[entry.key]
            if(objectResolver)
            {
                objectResolver(entry.value, (object) => {
                    resolved[entry.key] = object
                    done()
                })
            }
        })
    }
    static getContextObject = (path:string, contextNaturalKey:ContextNaturalKey) => {
        const segmentKey = ContextSegmentKey.keyForNaturalKey(contextNaturalKey)
        const user = AuthenticationManager.getAuthenticatedUser()
        if(segmentKey)
        {
            if(path === Routes.ROOT && segmentKey === ContextSegmentKey.USER && !user.is_anonymous){
                const val = AuthenticationManager.getAuthenticatedUser().slug_name
                return ContextManager.objectResolvers[segmentKey](val)
            }
            const dict = ContextManager.pathToDictionary(path)
            const val = dict[segmentKey]
            if(val)
                return ContextManager.objectResolvers[segmentKey](val)
        }
        return null
    }
    static getContextObjects = (path:string) => {
        const dict = ContextManager.pathToDictionary(path)
        const resolved:ResolvedContextObjects = {success:false}
        const entries = ContextManager.dictionaryToEntries(dict)
        entries.forEach(entry => {
            const segmentKey = ContextSegmentKey.parse(entry.key)
            if(segmentKey)
            {
                const val = dict[segmentKey]
                if(val)
                {
                    const object = ContextManager.objectResolvers[segmentKey](val)
                    if(object)
                        resolved[entry.key] = object
                }
            }
        })
        const resolvedLength = entries.map(e => resolved[e.key]).filter(o => !nullOrUndefined(o)).length
        resolved.success = resolvedLength == entries.length
        return resolved
    }
    static getParentContextObject = (pathname:string) => {

    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}