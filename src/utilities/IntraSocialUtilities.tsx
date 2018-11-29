import processString from 'react-process-string'
import * as React from 'react';
import { UploadedFile } from '../reducers/conversations';
import { Status } from '../reducers/statuses';
import { AuthenticationManager } from '../managers/AuthenticationManager';
import { UserProfile } from '../reducers/profileStore';
import Embedly from '../components/general/Embedly';
import { Link } from 'react-router-dom';
import { Routes } from './Routes';

export const URL_REGEX = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim
export const URL_WWW_REGEX = /(^(\b|\s+)(www)\.[\S]+(\b|$))/gim
export const LINEBREAK_REGEX = /\r?\n|\r/g
export class IntraSocialUtilities 
{
    static getStatusPreview(parent:Status, message:string, mentions?:number[], files?:UploadedFile[]) 
    {
        let d = Date.now()
        const status = {} as Status

        status.text = message,
        status.privacy = "members",
        status.files_ids = (files || []).map(f => f.id),
        status.link = IntraSocialUtilities.findPrimaryLink(message),
        status.context_natural_key = parent.context_natural_key,
        status.context_object_id = parent.context_object_id,
        status.parent = parent.id,
        status.mentions = mentions || []
        status.id = d
        status.uid = d
        status.owner = AuthenticationManager.getAuthenticatedUser()!
        status.reactions = {}
        status.comments_count = 0
        status.children = []
        status.files = files || []
        status.pending = true
        status.reaction_count = 0
        return status
    }
    static findPrimaryLink(text:string) {
        // Return first url found in text if any.
        // We are using two regex (with and without http://)
        var pattern = new RegExp(URL_REGEX.source, "im");
        var pattern2 = new RegExp(URL_WWW_REGEX.source, "im");
        var result = text.match(pattern)
        var result2 = text.match(pattern2)

        if (result != null && result2 != null) {
            // Both regex match, return the first found
            return (result!.index! > result2!.index!) ? result2[0] : result[0]
        } else {
            if (result != null) return result[0]
            if (result2 != null) return result2[0]
            return null
        }
    }
    static appendAuthorizationTokenToUrl = (url:string) => 
    {
        const authToken = AuthenticationManager.getAuthenticationToken()
        if(!!authToken && !!url)
        {
            let u = new URL(url)
            u.searchParams.set('token', authToken);
            return u.href
        }
        return url
    }
    static getProfileImageUrl = (user:UserProfile) => 
    {
        if(user === undefined)
        {
            let k = 5
        }
        return IntraSocialUtilities.appendAuthorizationTokenToUrl(user.avatar_thumbnail || user.avatar)
    }
    static getTextString = (text:string, mentions:UserProfile[]) => 
    {
        var processed:any = null
        var config:any[] = []
        let mentionSearch = mentions.map(user => {
            return {
                regex:new RegExp("@" + user.username.replace("+","\\+"), 'g'),
                fn: (key:string, result:any) => {
                    return user.first_name + " " + user.last_name
                }
            }
        }).filter(o => o)
        config = config.concat(mentionSearch)
        processed = processString(config)(text)
        if(typeof processed == "string")
            return processed
        else 
        {
            let a = processed as any[]
            return a.join("")
        }
    }
    static getTextContent = (text:string, mentions:UserProfile[], includeEmbedlies:boolean, maxNumberOfEmbedlies:number) => 
    {
        var processed:any = null
        var config = []
        let embedlies:{[id:string]:any} = {}
        let k = {
            regex: URL_REGEX,
            fn: (key:string, result:any) => 
            {
                if(includeEmbedlies && Object.keys( embedlies).length < maxNumberOfEmbedlies)
                {
                    embedlies[result[0]] = <Embedly key={IntraSocialUtilities.uniqueId()} url={result[0]} />
                }
                return (<a key={IntraSocialUtilities.uniqueId()} href={result[0]} target="_blank"  data-toggle="tooltip" title={result[0]}>{IntraSocialUtilities.truncateText(result[0], 50 )}</a>)
            }
        }
        config.push(k)
        let mentionSearch = mentions.map(user => {
            return {
                regex:new RegExp("@" + user.username.replace("+","\\+"), 'g'),
                fn: (key:string, result:any) => {
                    return <Link key={key} to={Routes.PROFILES + user.slug_name }>{user.first_name + " " + user.last_name}</Link>;
                }
            }
        }).filter(o => o)
        config = config.concat(mentionSearch)
        processed = processString(config)(text);

        return {textContent:processed, embedlies:embedlies}
    }
    static uniqueId = () =>  {
        return Math.random().toString(36).substr(2, 16);
    }
    static truncateText = (text:string, maxChars:number) => {
        return text.length > (maxChars - 3) ? text.substring(0, maxChars - 3) + '...' : text;
    }
    static groupFiles = (files:UploadedFile[]) => 
    {
        let dict:{[type:string]:UploadedFile[]} = {}
        files.forEach(f => {
            let arr = dict[f.type]
            if(!!arr)
            {
                arr.push(f)
            }
            else 
            {
                dict[f.type] = [f]
            }
        })
        return dict
    }
    //reactions
    static calcReactionState = (status:Status, user:UserProfile) => {
        let reactions = status.reactions || {}
        let reactors = Object.keys(reactions).map(k => reactions[k]).reduce((ret,val) => ret.concat(val),[])
        return reactors.indexOf(user.id) > -1
    }
    static getStatusReaction = (status:Status, user:UserProfile) => {
        let reactions = status.reactions || {}
        return IntraSocialUtilities.getReaction(reactions, user)
    }
    static getReaction = (reactions:{[id:string]:number[]}, user:UserProfile) => {
        let keys = Object.keys(reactions)
        for(var i = 0; i < keys.length;i++)
        {
            let users = reactions[keys[i]]
            if(users.indexOf(user.id) > -1)
                return keys[i]
        }
        return null
    }
    static calcReactionsCount = (reacted:boolean, reactedCount:number) => {
        let count = reactedCount + ((reacted) ? -1 : 1);
        if (count < 0) {
            count = 0;
        }
        return count;
    }
    static applyReaction = (prevReaction:string|null, reaction:string|null, reactions:{[id:string]:number[]}, reactionsCount:number, userId:number):{reactions:{[id:string]:number[]}, reactionsCount:number} =>  {
        var newReactionsCount = reactionsCount
        var newReactions = reactions
        if(reaction)
        {
            let oldReactions = newReactions[reaction] || []
            oldReactions.push(userId)
            newReactions[reaction] = oldReactions
        }
        if(prevReaction)
        {
            let oldReactions = newReactions[prevReaction] || []
            let ix = oldReactions.indexOf(userId)
            if(ix > -1)
            {
                oldReactions.splice(ix, 1)
            }
            if(oldReactions.length == 0)
            {
                delete newReactions[prevReaction]
            }
            else 
            {
                newReactions[prevReaction] = oldReactions
            }
        }
        if(prevReaction == null && reaction != null)
        {
            newReactionsCount += 1
        }
        else if(reaction == null && prevReaction != null)
        {
            newReactionsCount -= 1
        }
        return {reactionsCount:newReactionsCount, reactions:newReactions}
    }
}
