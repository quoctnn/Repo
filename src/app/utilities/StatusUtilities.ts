import Constants from '../utilities/Constants';
import { Status, UserProfile, UploadedFile, ContextNaturalKey } from '../types/intrasocial_types';
import { AuthenticationManager } from '../managers/AuthenticationManager';
import { URL_REGEX, URL_WWW_REGEX } from './IntraSocialUtilities';
export class StatusUtilities 
{
    static getStatusPreview(contextNaturalKey:ContextNaturalKey, contextObjectId:number,  message:string, files?:UploadedFile[], ) 
    {
        let d = Date.now()
        const status = {} as Status
        status.text = message,
        status.privacy = "members",
        status.files_ids = (files || []).map(f => f.id),
        status.link = StatusUtilities.findPrimaryLink(message),
        status.context_natural_key = contextNaturalKey,
        status.context_object_id = contextObjectId
        status.id = d
        status.uid = d
        status.owner = AuthenticationManager.getAuthenticatedUser()!
        status.reactions = {}
        status.comments = 0
        status.children = []
        status.files = files || []
        status.pending = true
        status.reaction_count = 0
        status.temporary = true
        return status
    }
    static getCommentPreview(parent:Status, message:string, files?:UploadedFile[]) 
    {
        let d = Date.now()
        const status = {} as Status

        status.text = message,
        status.privacy = "members",
        status.files_ids = (files || []).map(f => f.id),
        status.link = StatusUtilities.findPrimaryLink(message),
        status.context_natural_key = parent.context_natural_key,
        status.context_object_id = parent.context_object_id,
        status.parent = parent.id,
        status.id = d
        status.uid = d
        status.owner = AuthenticationManager.getAuthenticatedUser()!
        status.reactions = {}
        status.comments = 0
        status.children = []
        status.files = files || []
        status.pending = true
        status.reaction_count = 0
        status.temporary = true
        status.level = parent.level + 1
        status.position = parent.comments
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
    static filterStatusFileType = (files:UploadedFile[], type:string) => 
    {
        return files.filter((file) => {
            return file.type == type
        })
    }
    static getPermaLink = (statusId:number) => {
        return window.location.protocol + '//' + window.location.host +
            Constants.urlsRoute.statusPermalink(statusId);
    }
    static calcReactionState = (status:Status, user:UserProfile) => {
        let reactions = status.reactions || {}
        let reactors = Object.keys(reactions).map(k => reactions[k]).reduce((ret,val) => ret.concat(val),[])
        return reactors.indexOf(user.id) > -1
    }
    static getStatusReaction = (status:Status, userId:number) => {
        let reactions = status.reactions || {}
        return StatusUtilities.getReaction(reactions, userId)
    }
    static getReaction = (reactions:{[id:string]:number[]}, userId:number) => {
        let keys = Object.keys(reactions)
        for(var i = 0; i < keys.length;i++)
        {
            let users = reactions[keys[i]]
            if(users.indexOf(userId) > -1)
                return keys[i]
        }
        return null
    }
    static calcReactionsCount = (reacted, reactedCount) => {
        let count = reactedCount + ((reacted) ? -1 : 1);
        if (count < 0) {
            count = 0;
        }
        return count;
    }
    static applyReaction = (prevReaction:string, reaction:string, reactions:{[id:string]:number[]}, reactionsCount:number, userId:number):{reactions:{[id:string]:number[]}, reactionsCount:number} =>  {
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
