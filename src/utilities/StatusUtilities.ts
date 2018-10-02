import { Status } from '../reducers/statuses';
import Constants from '../utilities/Constants';
import { UserProfile } from '../reducers/profileStore';
export class StatusUtilities {
    static filterStatusFileType = (status:Status, type:string) => 
    {
        return status.files.filter((file) => {
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
    static getReaction = (status:Status, user:UserProfile) => {
        let reactions = status.reactions || {}
        let keys = Object.keys(reactions)
        for(var i = 0; i < keys.length;i++)
        {
            let users = reactions[keys[i]]
            if(users.indexOf(user.id) > -1)
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