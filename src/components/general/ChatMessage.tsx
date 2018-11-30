import * as React from "react";
import { Link } from 'react-router-dom';
import { URL_REGEX, uniqueId, IS_ONLY_LINK_REGEX } from '../../utilities/Utilities';
import { Routes } from '../../utilities/Routes';
import Embedly from './Embedly';
import { translate } from '../intl/AutoIntlProvider';
import RadialProgress from './RadialProgress';
import { ConversationManager } from '../../managers/ConversationManager';
const processString = require('react-process-string');
import store from '../../main/App';
import { FileUtilities } from '../../utilities/FileUtilities';
import { ProfileManager } from "../../managers/ProfileManager";
import { Message } from "../../types/intrasocial_types";
require("./ChatMessage.scss");

export enum MessagePosition
{
    LEFT = "left", RIGHT = "right"
}
export interface Props {
    data:Message,
    direction:MessagePosition,
}
export class ChatMessage extends React.Component<Props, {}> {
    urlPrefix = store.getState().debug.availableApiEndpoints[store.getState().debug.apiEndpoint].endpoint
    shouldComponentUpdate(nextProps:Props, nextState) 
    {
        let n = nextProps.data.tempFile
        let o = this.props.data.tempFile
        if((n && !o ) || !n && o)
            return true
        if(!n && !o)
            return false
        return n.progress != o.progress || n.error != o.error
    }
    getRemoveFailedContent(message:Message)
    {
        return (<div>
            <div className="title">{message.tempFile.name}</div>
            <div className="status">{translate("Sending failed")}</div>
            <div className="footer"><button className="btn" onClick={() => ConversationManager.removeQueuedMessage(message)}>{translate("Remove")}</button></div>
        </div>)
    }
    getUploadingContent(message:Message)
    {
        return (<div>
            <div className="title">{message.tempFile.name}</div>
            <div className="status">{ FileUtilities.humanFileSize( message.tempFile.size ) + " " + translate("Sending...")}</div>
            <div className="footer"><RadialProgress percent={message.tempFile.progress} size={40} strokeWidth={5} /></div>
        </div>)
    }
    getRetryUploadingContent(message:Message)
    {
        return (<div>
            <div className="title">{message.tempFile.name}</div>
            <div className="status">{ FileUtilities.humanFileSize( message.tempFile.size ) + " " + translate("Sending failed")}</div>
            <div className="footer"><button className="btn" onClick={() => ConversationManager.retryQueuedMessage(message)}>{translate("Retry")}</button></div>
        </div>)
    }
    getTryingToCreateContent(message:Message)
    {
        return (<div>
            <div className="title">{message.tempFile.name}</div>
            <div className="status">{translate("File uploaded. Creating message...") }</div>            
            <div className="footer">
                <button className="btn" onClick={() => ConversationManager.retryQueuedMessage(message)}>{translate("Retry")}</button>
                <button className="btn" onClick={() => ConversationManager.removeQueuedMessage(message)}>{translate("Remove")}</button>
            </div>
        </div>)
    }
    render() {
        var processed:any = null
        let msg = this.props.data
        var config = []
        let res = IS_ONLY_LINK_REGEX.test(msg.text)
        if(msg.tempFile && msg.tempFile.file)
        {
            if(msg.tempFile.file instanceof File)
            {
                if(msg.tempFile.error)
                {
                    processed = this.getRetryUploadingContent(msg)
                }
                else 
                {
                    processed = this.getUploadingContent(msg)
                }
            }
            else 
            {
                if(msg.tempFile.fileId)
                {
                    processed = this.getTryingToCreateContent(msg)
                }
                else 
                {
                    processed = this.getRemoveFailedContent(msg)
                }
            }
            
        }
        else if(msg.files && msg.files.length > 0)
        {
            processed = FileUtilities.getFileRepresentation(msg.files[0])  
        }
        else if(res)
        {
            processed = <Embedly key={uniqueId()} url={msg.text} />
        }
        else 
        {
            let embedlyArr:{[id:string]:any} = {}
            let k = {
                regex: URL_REGEX,
                fn: (key, result) => 
                {
                    embedlyArr[result[0]] = <Embedly key={uniqueId()} url={result[0]} />
                    return (<a key={uniqueId()} href={result[0]} target="_blank"  data-toggle="tooltip" title={result[0]}>{result[0]}</a>)
                }
            }
            config.push(k)
            let mentions = msg.mentions || []
            let mentionSearch = mentions.map(m => {
                let user = ProfileManager.getProfile(m)
                if(!user)
                    return null
                return {
                    regex:new RegExp("@" + user.username.replace("+","\\+"), 'g'),
                    fn: (key, result) => {
                        return <Link key={key} to={Routes.PROFILES + user.slug_name }>{user.first_name + " " + user.last_name}</Link>;
                    }
                }
            }).filter(o => o)
            config = config.concat(mentionSearch)
            processed = processString(config)(msg.text);
            let embedKeys = Object.keys(embedlyArr)
            if(embedKeys.length > 0)
            {
                processed = processed.concat( embedKeys.map(k => embedlyArr[k]) )
            }
        }
        let msgClass = 'chat-message ' + this.props.direction + (msg.pending ? " temp" : "")  + (res ? " single-embed": "")
        return (
            <li className={msgClass}>
                <span className="body">{processed}</span>
            </li>
        )
    }
}