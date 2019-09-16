import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./ConversationModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate, lazyTranslate } from '../../localization/AutoIntlProvider';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import { ContextNaturalKey, Conversation, Message, UserProfile, UploadedFileType, UploadedFile } from '../../types/intrasocial_types';
import {ApiClient, PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import SimpleModule from '../SimpleModule';
import { ContextManager } from '../../managers/ContextManager';
import { ChatMessageList } from './ChatMessageList';
import Avatar from '../../components/general/Avatar';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { ProfileManager } from '../../managers/ProfileManager';
import { TypingIndicator } from '../../components/general/TypingIndicator';
import { NotificationCenter } from '../../utilities/NotificationCenter';
import { EventStreamMessageType } from '../../network/ChannelEventStream';
import { EventSubscription } from 'fbemitter';
import { ConversationManager } from '../../managers/ConversationManager';
import { Settings } from '../../utilities/Settings';
import { ChatMessageComposer } from '../../components/general/input/ChatMessageComposer';
import { Mention } from '../../components/general/input/MentionEditor';
import { ConversationUtilities } from '../../utilities/ConversationUtilities';
import Select from 'react-select';
import { ProfileOptionComponent, ProfileSingleValueComponent, createProfileFilterOption, ProfileFilterOption } from '../tasks/ProjectProfileFilter';
import { ActionMeta } from 'react-select/lib/types';
import { NavigationUtilities } from '../../utilities/NavigationUtilities';
import { tempConversationId } from '../conversations/ConversationsModule';
import { userAvatar, uniqueId } from '../../utilities/Utilities';
import { FileUtilities } from '../../utilities/FileUtilities';
import { SecureImage } from '../../components/general/SecureImage';
import * as Mime from 'mime-types';
import FilesUpload from '../../components/status/FilesUpload';
import { CommonModuleProps } from '../Module';
import { Button } from 'reactstrap';
import Routes from '../../utilities/Routes';
import SimpleDialog from '../../components/general/dialogs/SimpleDialog';
import ConversationDetailsModule from './ConversationDetailsModule';

type FilePreviewProps = {
    file:File
    onRemove:(file:File) => void
}
export class FilePreview extends React.Component<FilePreviewProps, {preview?:string, isLoading:boolean}> {
    constructor(props:FilePreviewProps) {
        super(props);
        const isImage = this.isImage()
        this.state = {
            isLoading:isImage ? true : false
        }
    }
    isImage = () => {
        return this.props.file.type.startsWith("image/")
    }
    componentDidMount = () => {
        if(this.isImage())
        {
            FileUtilities.blobToDataURL(this.props.file, (fileString) => {
                if(fileString)
                {
                    this.setState(() => {
                        return {preview:fileString, isLoading:false}
                    })
                }
            })
        }
    }
    renderLoading = () => {
        return <CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>
    }
    renderPreview = () => {
        if(this.state.preview)
        {
            return  <>
                    <SecureImage setAsBackground={true} className="img-responsive" url={this.state.preview} />
                    </>
        }
        const file = this.props.file
        const extension =  Mime.extension(file.type)
        const type = UploadedFileType.parseFromMimeType(file.type)
        return  <>
                    <div className={classnames("file-icon-container", type, extension)}><i className="fa file-icon"></i></div>
                    <div className="title text-truncate">{this.props.file.name}</div>
                    <div className="size text-truncate small-text">{FileUtilities.humanFileSize(this.props.file.size)}</div>
                </>
    }
    removeFile = () => {
        this.props.onRemove(this.props.file)
    }
    render = () => {
        const isLoading = this.state.isLoading
        return <div className={classnames("file-preview main-content-secondary-background", {loading:isLoading})}>
                    {isLoading && this.renderLoading()}
                    {!isLoading && this.renderPreview()}
                    <i onClick={this.removeFile} className="clear far fa-times-circle"></i>
                </div>
    }
}

const reducer = (accumulator, currentValue) => accumulator + currentValue;
const uidToNumber = (uid) => uid.split("_").map(n => parseInt(n)).reduce(reducer)
const messageToUid = (message:Message) => message.conversation + "_" + message.user + "_" + new Date(message.updated_at).getTime()
const messageToTimestamp = (message:Message) => new Date(message.updated_at).getTime()

type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    singleMode?:boolean
} & CommonModuleProps
type State = {
    items:Message[]
    isLoading: boolean
    isRefreshing: boolean
    hasMore:boolean
    requestId:number
    hasReceivedData:boolean
    hasError:boolean
    showSpinner:boolean
    isTyping:{[key:string]:NodeJS.Timer}
    renderDropZone:boolean
    showDropzone: boolean
    files:UploadedFile[]
    uploading:boolean
    showEditDialog:boolean
}
type ReduxStateProps = {
    conversation: Conversation
    authenticatedUser:UserProfile
    queuedMessages:Message[]
    createNewConversation:boolean
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class ConversationModule extends React.Component<Props, State> {

    private dragCount:number = 0
    private messageList = React.createRef<ChatMessageList>();
    private canPublishDidType = true
    private observers:EventSubscription[] = []
    private messageComposer = React.createRef<ChatMessageComposer>();
    private uploadRef = React.createRef<any>();
    private protectKey = uniqueId()
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            isRefreshing:false,
            items:[],
            hasMore:true,
            requestId:0,
            hasReceivedData:false,
            hasError:false,
            showSpinner:false,
            isTyping:{},
            renderDropZone:false,
            showDropzone:false,
            files:[],
            uploading:false,
            showEditDialog:false
        }
    }
    shouldReloadList = (prevProps:Props) => {
        const oldConversation = prevProps.conversation
        const newConversation = this.props.conversation
        return (oldConversation && !newConversation) ||
                (!oldConversation && newConversation) ||
                (oldConversation && newConversation && 
                    (oldConversation.id != newConversation.id || 
                    (oldConversation.temporary && newConversation.temporary && 
                        (!oldConversation.users.isEqual(newConversation.users) || 
                         oldConversation.temporary_id != newConversation.temporary_id) ) ) )

    }
    componentDidMount = () => {
        const obs1 = NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_TYPING, this.isTypingHandler)
        this.observers.push(obs1)
        const obs2 = NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_MESSAGE, this.incomingMessageHandler)
        this.observers.push(obs2)
        if(this.props.conversation)
        {
            this.reload()
        }
    }
    componentWillUnmount = () =>
    {
        this.observers.forEach(o => o.remove())
        this.observers = null;
        this.dragCount = null;
        this.messageList = null;
        this.canPublishDidType = null;
        this.uploadRef = null
        this.messageComposer = null
        NavigationUtilities.protectNavigation(this.protectKey, false);
        this.protectKey = null;
    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        if(this.shouldReloadList(prevProps))
        {
            this.reload()
        }
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({showSpinner:false})
        }
        if(!this.props.conversation && !!prevProps.conversation) // if conversation removed
        {
            this.setState((prevState:State) => {
                return {renderDropZone:false, showSpinner:false}
            })
        }
        if(this.props.location.pathname != prevProps.location.pathname && this.messageComposer && this.messageComposer.current)
        {
            this.messageComposer.current.clearEditorContent()
            this.setState((prevState:State) => {
                return {files:[], uploading:false, showDropzone:false}
            })
        }
        NavigationUtilities.protectNavigation(this.protectKey, this.state.files.length > 0)
    }
    incomingMessageHandler = (...args:any[]) =>
    {
        if(!this.props.conversation)
            return
        let message = args[0] as Message
        let conversation = this.props.conversation.id
        if(message.conversation == conversation)
        {
            let it = this.removeUserFromIsTypingData(message.user)
            this.setState((prevState:State) => {
                const items = [...prevState.items]
                const oldIndex = items.findIndex(e => e.id == message.id)
                if(oldIndex > -1)
                {
                    items[oldIndex] = message
                }
                else 
                {
                    items.push(message)
                }
                return {isTyping:it, items }
            })
        }
    }
    isTypingHandler = (...args:any[]) => {

        let object = args[0]
        let user = object.user
        let conversation = object.conversation
        if(user == this.props.authenticatedUser.id || (this.props.conversation && (conversation != this.props.conversation.id)))
        {
            return
        }
        let it = {...this.state.isTyping}
        let oldUserTimer = it[user]
        if(oldUserTimer)
        {
            clearTimeout(oldUserTimer)
        }
        it[user] = setTimeout(() =>
        {
            let it = this.removeUserFromIsTypingData(user)
            this.setState({isTyping:it})

        }, Settings.clearSomeoneIsTypingInterval)
        this.setState({isTyping:it})
    }
    removeUserFromIsTypingData = (user:number) => {
        let it = {...this.state.isTyping}
        delete it[user]
        return it
    }
    reload = () => {
        const showSpinner = this.props.breakpoint >= ResponsiveBreakpoint.standard
        this.setState(prevState => ({
            isRefreshing: true,
            isLoading: true,
            items:[],
            requestId:prevState.requestId + 1,
            hasReceivedData:false,
            showSpinner
        }), this.loadData)
    }
    headerClick = (e) => {
        //NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    renderLoading = () => {
        if (this.state.showSpinner) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    loadData = () =>
    {
        const { items } = this.state
        const offset = items.length
        const requestId = this.state.requestId
        this.fetchMessages(offset, (data) => {
            if(data && data.results)
            {
                let newData = data.results
                if(requestId == this.state.requestId)
                {
                    const d = offset == 0 ?  newData :  [...items, ...newData]
                    this.setState({
                        items: d,
                        isRefreshing: false,
                        hasMore:data.next != null,
                        isLoading:false,
                        hasReceivedData:true,
                        hasError:false,
                    });
                }
            }
            else {
                this.setState({
                    items: [],
                    isRefreshing: false,
                    hasMore:false,
                    isLoading:false,
                    hasReceivedData:true,
                    hasError:true,
                });
            }
        })
    }
    fetchMessages = (offset:number, completion:(items:PaginationResult<Message>) => void ) => {
        const emptyData = {results:[], count:0, previous:null, next:null}
        if(!this.props.conversation || this.props.conversation.temporary && this.props.conversation.temporary_id == -1)
        {
            completion(emptyData)
            return
        }
        if(this.props.conversation.temporary && !this.props.conversation.temporary_id)//not set yet
        {
            const users = this.props.conversation.users.filter(i => i != this.props.authenticatedUser.id)
            if(users.length > 0)
            {
                ApiClient.getConversations(1, 0, false, users, (data, status, error) => {
                    if(this.props.conversation.temporary)
                    {
                        const temp = {...this.props.conversation}
                        if(data && data.results && data.results.length > 0)
                        {
                            const conv = data.results[0]
                            temp.temporary_id = conv.id
                        }
                        else {
                            temp.temporary_id = -1 //prevent multiple fetches
                        }
                        ConversationManager.updateTemporaryConversation(temp)
                    }
                    completion(emptyData)
                })
                return
            }
            else {

                completion(emptyData)
                return
            }
        }
        const conversationId = this.props.conversation.temporary && this.props.conversation.temporary_id || this.props.conversation.id
        ApiClient.getConversationMessages(conversationId, 30, offset, (data, status, error) => {
            completion(data)
            ToastManager.showRequestErrorToast(error)
        })
    }
    handleLoadMore = () =>
    {
        if(!this.state.hasMore || this.state.isLoading)
        {
            return
        }
        this.setState(prevState => ({
            isLoading: true,
            requestId:prevState.requestId + 1
        }), this.loadData)
    }
    chatDidScrollToTop = () => {
        this.handleLoadMore()
    }
    renderSomeoneIsTyping()
    {
        let keys = Object.keys(this.state.isTyping).map(n => parseInt(n))
        if(keys.length > 0)
        {
            return <li className="is-typing-container">
            {keys.map((id, index) => {
                let avatar = userAvatar( ProfileManager.getProfileById(id) )
                return (<Avatar key={index} image={avatar} size={24}/>)

            })}
            <TypingIndicator />
            </li>
        }
        return null
    }
    handleMentionSearch = (search:string, completion:(mentions:Mention[]) => void) => {
        if(!this.props.conversation)
        {
            completion([])
            return
        }
        ProfileManager.searchProfilesInContext({search, taggableMembers:this.props.conversation.users, completion:(profiles) => {
            completion(profiles.map(u => Mention.fromUser(u)))
        }})
    }
    onDidType = (unprocessedText:string) => {
        let conversation = this.props.conversation
        if(!conversation || conversation.temporary)
            return
        if(this.canPublishDidType)
        {
            ConversationManager.sendTypingInConversation(conversation.id)
            this.canPublishDidType = false
            setTimeout(() => {
                this.canPublishDidType = true
            }, Settings.sendSomeoneIsTypingthrottle)
        }
    }
    createConversationWithMessage = (tempConversation:Conversation, message:Message) => {
        const tempConversationId = tempConversation.temporary_id
        if(tempConversationId && tempConversationId > -1) // add to old conversation
        {
            message.conversation = tempConversationId
            ConversationManager.sendMessage(message)
            setTimeout(() => {
                ConversationManager.updateTemporaryConversation(null)
                NavigationUtilities.navigateToConversation(this.props.history, tempConversationId)
            },200)
        }
        else {
            ApiClient.createConversation(tempConversation.title, tempConversation.users, (newConversation, status, error) => {
                if(newConversation)
                {
                    message.conversation = newConversation.id
                    ConversationManager.sendMessage(message)
                    ConversationManager.updateTemporaryConversation(null)
                    NavigationUtilities.navigateToConversation(this.props.history, newConversation.id)
                    ToastManager.showInfoToast(translate("conversation.created"))
                }
                if(error || status == "error")
                {
                    ToastManager.showRequestErrorToast(error, lazyTranslate("Could not create conversation"))
                    return
                }
            } )
        }
    }
    clearFiles = () => {
        this.setState(() => {
            return {files:[], uploading:false, showDropzone:false}
        })
    }
    onChatMessageSubmit = (text:string, mentions:number[]) => {
        let conversation = this.props.conversation
        if(!conversation)
            return
        const files = this.state.files
        this.clearFiles()
        const message = ConversationUtilities.getChatMessagePreview(this.props.authenticatedUser.id, text, files, mentions, conversation)
        if(conversation.temporary)
            this.createConversationWithMessage(conversation, message)
        else
            ConversationManager.sendMessage(message)
    }
    filesAdded = (files:File[]) => {
        if(this.uploadRef && this.uploadRef.current)
        {
            this.uploadRef.current.onDrop(files)
            this.uploadRef.current.scrollToTop()
        }
    }
    onDragOver = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        try
        {
            event.dataTransfer.dropEffect = "copy"
        }
        catch (err) { }
    }
    onDrop = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        let files = []
        if (event.dataTransfer.items)
        {
            for (var i = 0; i < event.dataTransfer.items.length; i++)
            {
                if (event.dataTransfer.items[i].kind === 'file')
                {
                    var file = event.dataTransfer.items[i].getAsFile()
                    files.push(file)
                }
            }
        }
        else
        {
            for (var i = 0; i < event.dataTransfer.files.length; i++)
            {
                let file = event.dataTransfer.files[i]
                files.push(file)
            }
        }
        this.removeDragData(event)
        this.dragCount = 0
        this.setState({renderDropZone:false})
        if(files.length > 0)
            this.filesAdded(files)
    }

    removeDragData = (event:React.DragEvent<HTMLDivElement>) => {
        if (event.dataTransfer.items)
        {
            event.dataTransfer.items.clear()
        }
        else
        {
            event.dataTransfer.clearData()
        }
    }
    onDragLeave = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        this.dragCount -= 1
        if(this.dragCount == 0 && this.state.renderDropZone)
        {
            this.setState({renderDropZone:false})
        }
    }
    onDragEnter = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        this.dragCount += 1
        if(this.dragCount > 0 && !this.state.renderDropZone)
        {
            this.setState({renderDropZone:true})
        }
    }
    renderNoConversation = () => {
        return <div></div>
    }
    sortMessages = (a:Message, b:Message):number => {
        return b.id - a.id
    }

    handleFileUploaded = (file:UploadedFile) => {
        let files = this.state.files.map(f => f)
        files.push(file)
        this.setState({files: files})
    }
    handleFileQueueComplete = () => {
        this.setState({uploading: false});
    }
    handleFileAdded = () => {
        this.setState({uploading: true, showDropzone:true});
    }
    handleFileError = () => {
        // TODO: ¿Should we display an error message (multi-lang) to the user?
        this.setState({uploading: true});
    }
    handleFileRemoved = (file:UploadedFile) => {
        if (typeof file !== 'undefined' && file != null) {
            let files = this.removeFileFromList(file, this.state.files)
            this.setState({files: files, showDropzone:files.length > 0});
        }
    }
    removeFileFromList = (file:UploadedFile, fileList:UploadedFile[]) => {
        let list = fileList.map(f => f)
        let index = list.findIndex((item) => {
            return item.id == file.id;
        });
        if(index >= 0)
        {
            list.splice(index, 1)
        }
        return list
    }
    handleRename = (file: UploadedFile, name: string) => {
        if(!name || name.length == 0)
            return
        ApiClient.updateFilename(file.id, name, (data, status, error) => {
            if(!!data && !error)
            {
                this.setState((prevState:State) => {
                    const files = prevState.files.map(f => f)
                    const index = files.findIndex(f => f.id == data.id)
                    if(index > -1)
                    {
                        files[index] = data
                        return {files}
                    }
                    return
                })
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("Could not update filename"))
        })
    }
    renderContent = () => {

        const { conversation, authenticatedUser } = this.props
        const {items, isLoading} = this.state
        let messages = this.props.queuedMessages.concat(items).sort(this.sortMessages)
        const conversationId = conversation && conversation.id
        if(!conversationId || !authenticatedUser)
        {
            return this.renderNoConversation()
        }
        const cl = classnames("list list-component-list vertical-scroll droptarget")
        const canSubmit = !this.state.uploading && (!this.props.conversation.temporary || this.props.conversation.users.length > 0)
        const minimumTextLength = this.state.files.length > 0 ? 0 : 1
        const showDz = this.state.showDropzone || this.state.uploading
        const fileUploadClass = classnames({"d-none":!showDz})
        const uploadModule = <FilesUpload
        className={fileUploadClass}
        ref={this.uploadRef}
        files={this.state.files}
        onFileAdded={this.handleFileAdded}
        onFileRename={this.handleRename}
        onFileQueueComplete={this.handleFileQueueComplete}
        onFileError={this.handleFileError}
        onFileRemoved={this.handleFileRemoved}
        onFileUploaded={this.handleFileUploaded}
        communityId={-1}
        showDropzoneTarget={false}
        showListHeader={false}
        horizontalLayout={true}
        />
        return <div className="list-component message-list-container">
                        <ChatMessageList ref={this.messageList}
                            onDragOver={this.onDragOver}
                            onDrop={this.onDrop}
                            onDragLeave={this.onDragLeave}
                            onDragEnter={this.onDragEnter}
                            className={cl}
                            conversation={conversationId}
                            loading={isLoading}
                            chatDidScrollToTop={this.chatDidScrollToTop}
                            messages={messages}
                            current_user={authenticatedUser} >
                            {this.renderSomeoneIsTyping()}
                        </ChatMessageList>
                        
                    <ChatMessageComposer
                                //onHandleUploadClick={this.handleUploadClick}
                                ref={this.messageComposer}
                                className="secondary-text main-content-secondary-background"
                                mentionSearch={this.handleMentionSearch}
                                content={""}
                                submitOnEnter={true}
                                filesAdded={this.filesAdded}
                                onSubmit={this.onChatMessageSubmit}
                                onDidType={this.onDidType}
                                canSubmit={canSubmit}
                                minimumTextLength={minimumTextLength}
                                topChildren={uploadModule}
                            />
                    {this.state.renderDropZone &&
                        <div className="drop-zone">
                            <div className="drop-zone-content">{translate("conversation.module.drop.to.send.title")}</div>
                        </div>}
                </div>
    }
    onMemberSelectChange = (value: ProfileFilterOption[], action: ActionMeta) => {
        const temp = {...this.props.conversation}
        temp.users = value.map(v => v.id)
        if(!temp.title)
            temp.temporary_id = undefined
        ConversationManager.updateTemporaryConversation(temp)
    }
    renderMembersInput = () => {

        const availableMembers = ProfileManager.getProfiles(ProfileManager.getContactListIds(false))
        const currentMembers = ProfileManager.getProfiles(this.props.conversation && this.props.conversation.users || [])
        const availableOptions = availableMembers.map(createProfileFilterOption)
        const defaultValue = currentMembers.map(createProfileFilterOption)
        return <div className="member-select-container"><span className="to-label">{translate("To")+ ":"}</span><Select
            defaultValue={defaultValue}
            isMulti={true}
            name="members"
            options={availableOptions}
            className="member-select"
            classNamePrefix="select"
            isClearable={false}
            onChange={this.onMemberSelectChange}
            components={{ Option: ProfileOptionComponent, SingleValue:ProfileSingleValueComponent }}
            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            menuPortalTarget={document.body}
            autoFocus={true}
            placeholder={translate("conversation.create.members.placeholder")}
        /></div>
    }
    navigateToConversations = () => {
        window.app.navigateToRoute(Routes.conversationUrl(null))
    }
    renderBackButton = () => {
        if(this.props.singleMode)
            return <Button color="light" onClick={this.navigateToConversations} className="back-button mr-2">
                        <i className="fas fa-arrow-left"></i>
                    </Button>
        return null
    }
    toggleEditDialog = () => {
        this.setState((prevState:State) => {
            return {showEditDialog:!prevState.showEditDialog}
        })
    }
    renderEditButton = () => {
        if(this.props.singleMode)
            return <Button color="light" onClick={this.toggleEditDialog} className="edit-button mr-2">
                        <i className="fas fa-edit"></i>
                    </Button>
        return null
    }
    renderConversationEditorTitle = () => {
        const conversation = this.props.conversation
        if(conversation)
        {
            return <div className="mw0 d-flex w-100">
                {this.renderBackButton()}
                <div className="title text-truncate flex-grow-1">{ConversationUtilities.getConversationTitle(conversation)}</div>
            </div>
        }
        return null
    }
    renderEditDialog = () => {
        return <SimpleDialog didCancel={this.toggleEditDialog} visible={this.state.showEditDialog} header={translate("Update conversation")}>
            <ConversationDetailsModule breakpoint={this.props.breakpoint} />
        </SimpleDialog>
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, conversation, createNewConversation, authenticatedUser, queuedMessages, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("conversation-module", className, {temporary:conversation && conversation.temporary})
        const title = createNewConversation ? this.renderMembersInput() : this.renderConversationEditorTitle()
        return (<SimpleModule {...rest}
                    className={cn}
                    headerClick={this.headerClick}
                    breakpoint={breakpoint}
                    isLoading={this.state.isLoading}
                    headerContent={this.renderEditButton()}
                    headerTitle={title}>
                {this.renderContent()}
                {this.renderEditDialog()}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const conversation = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.CONVERSATION) as Conversation || state.tempCache.conversation
    const authenticatedUser = AuthenticationManager.getAuthenticatedUser()
    const queuedMessages = (!!conversation && ConversationManager.getQueuedMessages(conversation.id)) || []
    const conversationId:string = ownProps.match.params.conversationId
    const createNewConversation = conversationId == tempConversationId
    return {
        conversation,
        authenticatedUser,
        queuedMessages,
        createNewConversation,
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ConversationModule))