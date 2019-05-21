import * as React from "react";
import { Message } from "../../types/intrasocial_types";
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { IS_ONLY_LINK_REGEX, URL_REGEX, uniqueId, userFullName, LINEBREAK_REGEX } from '../../utilities/Utilities';
import { ProfileManager } from "../../managers/ProfileManager";
import Routes from "../../utilities/Routes";
import ContentGallery from "../../components/general/ContentGallery";
import Embedly from "../../components/general/embedly/Embedly";
import { ConversationManager } from "../../managers/ConversationManager";
import { FileUtilities } from "../../utilities/FileUtilities";
import RadialProgress from "../../components/general/loading/RadialProgress";
import { translate } from '../../localization/AutoIntlProvider';
const processString = require('react-process-string');
export class MessageContentParser{
    content:any = ""
    urls:string[]
    private message:Message
    private seed:number = 0
    private simpleMode:boolean = false
    constructor(message:Message, simpleMode:boolean){
        this.message = message
        this.urls = []
        this.simpleMode = simpleMode
        this.parse()
    }
    private parse = () => {
        let linkOnly = IS_ONLY_LINK_REGEX.test(this.message.text)
        if(linkOnly)
        {
            this.urls.push(this.message.text)
            if(this.simpleMode)
                this.content = this.message.text
            return
        }
        var config = []
        if(!this.simpleMode)
        {
            let k = {
                regex: URL_REGEX,
                fn: (key, result) => 
                {
                    this.urls.push(result[0])
                    return (<a key={uniqueId()} href={result[0]} target="_blank"  data-toggle="tooltip" title={result[0]}>{result[0]}</a>)
                }
            }
            config.push(k)
            const breaks = {
                regex: LINEBREAK_REGEX,
                fn: (key, result) => 
                {
                    return (<br key={uniqueId()} />)
                }
            }
            config.push(breaks)
        }
        let mentions = this.message.mentions || []
        let mentionSearch = mentions.map(m => {
            let user = ProfileManager.getProfileById(m)
            if(!user)
                return null
            return {
                regex:new RegExp("@" + user.username.replace("+","\\+"), 'g'),
                fn: (key, result) => {
                    if(this.simpleMode)
                        return <b key={this.getKey(key)}>{userFullName(user)}</b>
                    return <Link key={this.getKey(key)} to={Routes.profileUrl(user.slug_name) }>{userFullName(user)}</Link>;
                }
            }
        }).filter(o => o)
        config = config.concat(mentionSearch)
        let result = processString(config)(this.message.text)
        this.content = this.processElements(result)
    }
    //flatten array and remove empty strings
    private processElements = (arr:any) => {
        if(typeof arr == "string" && !Array.isArray(arr))
        {
            return arr
        }
        let result = []
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i]
            if(typeof item != "string" && Array.isArray(item))
            {
                result = result.concat(this.processElements(item))
            }
            else {
                if(typeof item != "string" || item.length > 0)
                    result.push(item)
            }
        }
        return result
    }
    private getKey = (key:string ) => {
        return `${key}_${this.seed++}`
    }
}
type Props = {
    message:Message
    simpleMode:boolean
}
type State = {
    content:MessageContentParser
}
export class MessageContent extends React.Component<Props,State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            content:new MessageContentParser(props.message, props.simpleMode)
        }
    }
    shouldComponentUpdate = (prevProps:Props, prevState:State) => {
        return this.inputChanged(prevProps) || prevState.content != this.state.content
    }
    inputChanged = (prevProps:Props) => {
        return prevProps.message != this.props.message || prevProps.simpleMode != this.props.simpleMode
    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        if(this.inputChanged(prevProps))
        {
            this.setState(() => {
                return {content:new MessageContentParser(this.props.message, this.props.simpleMode)}
            })
        }
    }
    private renderTempFile = () => {
        const message = this.props.message
        if(message.tempFile.file instanceof File)
        {
            if(message.tempFile.error)
            {
                return this.wrapInMessage(this.renderRetryUploadingContent(message))
            }
            else 
            {
                return this.wrapInMessage(this.renderUploadingContent(message))
            }
        }
        else 
        {
            if(message.tempFile.fileId)
            {
                return this.wrapInMessage(this.renderTryingToCreateContent(message))
            }
            else 
            {
                return this.wrapInMessage(this.renderRemoveFailedContent(message))
            }
        }
    }
    private wrapInMessage = (content:any, className?:string, key?:string, error?:string) => {
        const cn = classnames("message", className)
        return <div key={key || uniqueId()} className={cn}>
                    {content}
                    {error && <div className="small-text text-danger"><i className="fas fa-exclamation-triangle">&nbsp;{translate("sending failed")}</i></div>}
                </div>
    }
    private renderRemoveFailedContent = (message:Message) => {
        return (<div className="d-flex align-items-center">
                    <div className="d-flex flex-column mw0 mr-2">
                        <div className="title text-truncate">{message.tempFile.name}</div>
                        <div className="status text-truncate">{translate("Sending failed")}</div>
                    </div>
                    <div className="d-flex flex-shrink-0">
                        <button className="btn" onClick={() => ConversationManager.retryQueuedMessage(message)}>{translate("Retry")}</button>
                        <button className="btn" onClick={() => ConversationManager.removeQueuedMessage(message)}>{translate("Remove")}</button>
                    </div>
                </div>)
    }
    private renderUploadingContent = (message:Message) => {
        return (<div className="d-flex align-items-center">
                    <div className="d-flex flex-shrink-0">
                        <RadialProgress percent={message.tempFile.progress} size={40} strokeWidth={5} />
                    </div>
                    <div className="d-flex flex-column mw0 ml-2">
                        <div className="title text-truncate">{message.tempFile.name}</div>
                        <div className="status text-truncate">{ FileUtilities.humanFileSize( message.tempFile.size ) + " " + translate("Sending...")}</div>
                    </div>
                </div>)
    }
    private renderRetryUploadingContent = (message:Message) => {
        return (<div className="d-flex align-items-center">
                    <div className="d-flex flex-column mw0 mr-2">
                        <div className="title text-truncate">{message.tempFile.name}</div>
                        <div className="status text-truncate">{ FileUtilities.humanFileSize( message.tempFile.size ) + " " + translate("Sending failed")}</div>
                    </div>
                    <div className="d-flex flex-shrink-0">
                        <button className="btn" onClick={() => ConversationManager.retryQueuedMessage(message)}>{translate("Retry")}</button>
                    </div>
                </div>)
    }
    private renderTryingToCreateContent = (message:Message) => {
        return (<div className="d-flex align-items-center">
                    <div className="d-flex flex-column mw0 mr-2">
                        <div className="title text-truncate">{message.tempFile.name}</div>
                        <div className="status text-truncate">{translate("File uploaded. Creating message") }</div>   
                    </div>
                </div>)
    }
    render = () => {
        const {message, simpleMode} = this.props
        const processedContent = this.state.content
        const files = message.files || []
        if(simpleMode)
        {
            if(files.length > 0)
            {
                const file = message.files[0]
                const cn = classnames(file.type, file.extension)
                return <div className={cn}><i className="fa file-icon mr-1"></i>{translate("file.type."+ file.type)}</div>
            }
            return processedContent.content
        }
        if(!message.error && message.tempFile && message.tempFile.file)
        {
            return this.renderTempFile()
        }
        const urls = processedContent.urls
        const hasContent = processedContent.content.length > 0
        const hasFiles = files.length > 0
        const hasLinks = urls.length > 0
        const showError = message.error && !hasContent && !hasFiles && !hasLinks
        return  <>
                    {hasContent && this.wrapInMessage(processedContent.content, null, null, message.error )}
                    {hasFiles && this.wrapInMessage(<ContentGallery files={files} setWidth={true}/>,null, null, message.error)}
                    {hasLinks && urls.map(u => this.wrapInMessage(<Embedly renderOnError={false} verticalCard={true} url={u} />, "embed", null, message.error))}
                    {showError && this.wrapInMessage(translate("The message could not be sent"), null, null, message.error)}
                </>
    }
}
