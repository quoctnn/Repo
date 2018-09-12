import * as React from "react";
import { Message } from '../../reducers/conversations';
import { getProfileById } from '../../main/App';
import { Link } from 'react-router-dom';
import { URL_REGEX, truncate, uniqueId, IS_ONLY_LINK_REGEX } from '../../utilities/Utilities';
import { Routes } from '../../utilities/Routes';
import Embedly from './Embedly';
const processString = require('react-process-string');
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
    shouldComponentUpdate(nextProps:Props, nextState) {
        return false
    }
    render() {
        var processed:any = null
        let msg = this.props.data
        var config = []
        let res = IS_ONLY_LINK_REGEX.test(msg.text)
        if(res)
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
            let metions = msg.mentions || []
            let mentionSearch = metions.map(m => {
                let user = getProfileById(m)
                if(!user)
                    return null
                return {
                    regex:new RegExp("@" + user.username, 'g'),
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
