import * as React from "react";
import { Message, FileUpload, UploadedFile, UploadedFileType } from "../../types/intrasocial_types";
import classnames from 'classnames';
import { IS_ONLY_LINK_REGEX, URL_REGEX, uniqueId, LINEBREAK_REGEX, MENTION_REGEX, MentionData, truncate } from '../../utilities/Utilities';
import ContentGallery from "../../components/general/ContentGallery";
import Embedly from "../../components/general/embedly/Embedly";
import { ConversationManager } from "../../managers/ConversationManager";
import IntraSocialMention from "../../components/general/IntraSocialMention";
import { Settings } from "../../utilities/Settings";
import * as Mime from 'mime-types';
import { translate } from "../../localization/AutoIntlProvider";
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
        const mentionSearch = {
            regex: MENTION_REGEX,
            fn: (key, result:string[]) => {
                const data = MentionData.fromRegex(result)
                if(this.simpleMode)
                {
                    const name = data.getName()
                    return <b key={this.getKey(key)}>{truncate(name, Settings.mentionTruncationLength)}</b>
                }
                return <IntraSocialMention key={this.getKey(key)} data={data} />
            }
        }
        config.push(mentionSearch)
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
    convertFile = (queueObj:FileUpload):UploadedFile => {
        const file = queueObj.file
        const type = file.type
        const extension =  Mime.extension(type)
        const fileType = UploadedFileType.parseFromMimeType(type)
        return {
            id:new Date().getTime(),
            user: -1,
            filename: file.name,
            file: null,
            type: fileType,
            extension: extension,
            image: null,
            image_width: 0,
            image_height: 0,
            thumbnail:type.startsWith("image/") &&  URL.createObjectURL(file),
            size: file.size,
            created_at: new Date().toUTCString(),
            //ext  
            tempId:queueObj.id,
            custom: true,
            uploadProgress:queueObj.progress,
            uploading:queueObj.progress > 0,
            uploaded:false,
            hasError:!!queueObj.error
        }
    }
    private wrapInMessage = (content:any, className?:string, key?:string, error?:string) => {
        const cn = classnames("message", className)
        return <div key={key || uniqueId()} className={cn}>
                    {content}
                    {error && this.renderErrorMessage()}
                </div>
    }
    renderErrorMessage = () => {
        return (<div className="d-flex flex-column">
                   <div className="small-text text-danger"><i className="fas fa-exclamation-triangle">&nbsp;{translate("sending failed")}</i></div>
                    <div className="d-flex flex-shrink-0">
                        <button className="btn link-text" onClick={() => ConversationManager.retryQueuedMessage(this.props.message)}>{translate("Retry")}</button>
                        <button className="btn link-text" onClick={() => ConversationManager.removeQueuedMessage(this.props.message)}>{translate("Remove")}</button>
                    </div>
                </div>)
    }
    private renderIllegalContent = (message:Message) => {
        return (<div className="d-flex align-items-center">
                    <div className="d-flex flex-column mw0 mr-2">
                        <div className="title text-truncate">{translate("The message could not be sent")}</div>
                    </div>
                    <div className="d-flex flex-shrink-0">
                        <button className="btn link-text" onClick={() => ConversationManager.removeQueuedMessage(message)}>{translate("Remove")}</button>
                    </div>
                </div>)
    }
    render = () => {
        const {message, simpleMode} = this.props
        const processedContent = this.state.content
        const files = message.files || []
        if(simpleMode)
        {
            if(files.length == 1)
            {
                const file = message.files[0]
                const cn = classnames(file.type, file.extension)
                return <div className={cn}><i className="fa file-icon mr-1"></i>{translate("file.type."+ file.type)}</div>
            }
            else if(files.length > 1){
                const cn = classnames(UploadedFileType.DOCUMENT)
                return <div className={cn}><i className="fa file-icon mr-1"></i>{`${files.length} ${translate("common.files")}`}</div>
            }
            return processedContent.content
        }
        const urls = processedContent.urls
        const hasContent = processedContent.content.length > 0
        const hasFiles = files.length > 0
        const hasLinks = urls.length > 0
        const showError = message.error && !hasContent && !hasFiles && !hasLinks
        return  <>
                    {hasContent && this.wrapInMessage(processedContent.content, null, null, message.error )}
                    {hasFiles && this.wrapInMessage(<ContentGallery files={files} setWidth={true}/>, null, null, message.error)}
                    {hasLinks && urls.map(u => this.wrapInMessage(<Embedly renderOnError={false} verticalCard={true} url={u} />, "embed", null, message.error))}
                    {showError && this.wrapInMessage(this.renderIllegalContent(message), null, null, message.error)}
                </>
    }
}
