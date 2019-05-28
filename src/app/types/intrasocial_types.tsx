import * as React from 'react';
import Emoji from "../components/general/Emoji";
import Constants from "../utilities/Constants";
import { translate } from "../localization/AutoIntlProvider";

export interface Verb
{
    id:number
    infinitive:string
    past_tense:string
}
export type IdentifiableObject = {
    id: number
}
/* deprecated?
export interface SimpleNotification
{
    absolute_url:string
    actor:SimpleUserProfile
    extra:any
    message:string
    verb:Verb
}
*/
export type RecentActivity =
{
    id:number
    created_at:string
    updated_at:string
    verb:Verb
    is_seen: boolean
    is_read: boolean
    actor_count:number
    display_text:string
    extra:any
    absolute_url:string
    uri:string
    actors:number[]
    mentions:number[]
}
export type TempStatus = {
  text: string
  privacy: string
  files_ids: number[]
  link: string|null
  context_natural_key?: ContextNaturalKey
  context_object_id?: number
  parent:number,
  mentions: number[]
  pending?:boolean
}
export type ContextObject = {
     name:string
} & Linkable
export type Status = {
    [key:string]: any
    can_comment:boolean
    children:Status[]
    children_ids:number[]
    comments:number
    community?:ICommunity
    context_object:ContextObject
    created_at:string
    edited_at:string
    files:UploadedFile[]
    id:number
    uid:number
    reactions:{ [id: string]: number[] }
    reaction_count:number
    owner:UserProfile
    permission_set:number[]
    poll:any
    read:boolean
    updated_at:string
    serialization_date:string
    extra?:string
    highlights?:{[id:string]:[string]}
    attributes:SimpleObjectAttribute[]
    temporary:boolean
    visibility?:number[]
    level?:number
} & TempStatus & Permissible

export interface FileUpload
{
    file:File
    progress:number
    name:string
    size:number
    type:string
    error:string|null
    fileId?:number
}

export class Message
{
    id!:number
    pending?:boolean
    uid!:string
    user!:number
    conversation!:number
    text!:string
    attachment:any
    created_at!:string
    updated_at!:string
    read_by!:number[]
    mentions!:number[]
    files?:UploadedFile[]
    tempFile?:FileUpload
    error?:string
}
export enum Permission{
    none = 0,
    list = 10,
    read = 11,
    interact = 12,
    post = 13,
    limited_write = 20,
    write = 21,
    moderate = 40,
    admin = 50,
    update = 70,
    superuser = 99,
}
export namespace Permission {

    export function usesElevatedPrivileges(permission: Permission) {
        return permission == Permission.moderate || permission == Permission.admin || permission == Permission.superuser
    }
}
export enum ElasticSearchType
{
    GROUP = "Group",
    COMMUNITY = "Community",
    USER = "User",
    PROJECT = "Project",
    TASK = "Task",
    EVENT = "Event",
    STATUS = "Status",
    UPLOADED_FILE = "UploadedFile"
}

export namespace ElasticSearchType {

    export function contextNaturalKeyForType(key: ElasticSearchType) {
        switch(key){
            case ElasticSearchType.GROUP: return ContextNaturalKey.GROUP
            case ElasticSearchType.COMMUNITY: return ContextNaturalKey.COMMUNITY
            case ElasticSearchType.USER: return ContextNaturalKey.USER
            case ElasticSearchType.PROJECT: return ContextNaturalKey.PROJECT
            case ElasticSearchType.EVENT: return ContextNaturalKey.EVENT
            case ElasticSearchType.TASK: return ContextNaturalKey.TASK
            default:return null
        }
    }
}
export type SimpleObjectAttribute = {
    attribute: ObjectAttributeType
    datetime: string
    extra_data:string
    id:number
}
export type ObjectAttribute = {
    created_at:string
    created_by:number
    user:number
} & SimpleObjectAttribute
export type StatusObjectAttribute = {
    status:number
} & ObjectAttribute
export type TaskObjectAttribute = {
    task:number
} & ObjectAttribute
export type ReportTag = { value: string, label: string}
export type ReportResult = {
    context_natural_key: ContextNaturalKey
    context_object_id: number
    created_at: string
    creator: number
    description: string
    id: number
    moderated_at: string
    moderator: number
    tags:string[]
}
export enum ObjectAttributeType
{
    important = "important",
    reminder = "reminder",
    attention = "attn",
    pinned = "pinned",
    follow = "follow",
    link = "link",
}
export namespace ObjectAttributeType {
    export function iconForType(type: ObjectAttributeType, active = false) {
        switch(type){
            case ObjectAttributeType.important: return active ? "fas fa-star" :  "far fa-star"
            case ObjectAttributeType.reminder: return active ? "far fa-clock" : "far fa-clock"
            case ObjectAttributeType.attention: return active ? "fas fa-exclamation-triangle" : "fas fa-exclamation-triangle"
            case ObjectAttributeType.pinned: return active ? "fas fa-thumbtack" : "fas fa-thumbtack"
            case ObjectAttributeType.follow: return active ? "far fa-bell-slash" : "far fa-bell"
            case ObjectAttributeType.link: return active ? "fas fa-link" : "fas fa-link"
            default:return "fas fa-question"
        }
    }
}
export enum ContextNaturalKey
{
    GROUP = "group.group",
    COMMUNITY = "core.community",
    USER = "auth.user",
    PROJECT = "project.project",
    TASK = "project.task",
    EVENT = "event.event",
    NEWSFEED = "newsfeed",
    CONVERSATION = "conversation",
}
export enum ContextSegmentKey
{
    GROUP = "group",
    COMMUNITY = "community",
    USER = "profile",
    PROJECT = "project",
    TASK = "task",
    EVENT = "event",
    CONVERSATION = "conversation"
}
export namespace ContextSegmentKey {
    export function keyForNaturalKey(key: ContextNaturalKey) {
        switch(key){
            case ContextNaturalKey.GROUP: return ContextSegmentKey.GROUP
            case ContextNaturalKey.COMMUNITY: return ContextSegmentKey.COMMUNITY
            case ContextNaturalKey.USER: return ContextSegmentKey.USER
            case ContextNaturalKey.PROJECT: return ContextSegmentKey.PROJECT
            case ContextNaturalKey.EVENT: return ContextSegmentKey.EVENT
            case ContextNaturalKey.TASK: return ContextSegmentKey.TASK
            case ContextNaturalKey.CONVERSATION: return ContextSegmentKey.CONVERSATION
            default:return null
        }
    }
}
export namespace ContextNaturalKey {
    export function avatarForKey(key: ContextNaturalKey) {
        switch(key){
            case ContextNaturalKey.GROUP: return Constants.resolveUrl(Constants.defaultImg.groupAvatar)()
            case ContextNaturalKey.COMMUNITY: return Constants.resolveUrl(Constants.defaultImg.communityAvatar)()
            case ContextNaturalKey.USER: return Constants.resolveUrl(Constants.defaultImg.userAvatar)()
            case ContextNaturalKey.PROJECT: return Constants.resolveUrl(Constants.defaultImg.projectAvatar)()
            case ContextNaturalKey.EVENT: return Constants.resolveUrl(Constants.defaultImg.eventAvatar)()
            default:return null
        }
    }
    export function elasticTypeForKey(key: ContextNaturalKey) {
        switch(key){
            case ContextNaturalKey.GROUP: return ElasticSearchType.GROUP
            case ContextNaturalKey.COMMUNITY: return ElasticSearchType.COMMUNITY
            case ContextNaturalKey.USER: return ElasticSearchType.USER
            case ContextNaturalKey.PROJECT: return ElasticSearchType.PROJECT
            case ContextNaturalKey.EVENT: return ElasticSearchType.EVENT
            case ContextNaturalKey.TASK: return ElasticSearchType.TASK
            default:return null
        }
    }
}
export type ContextItem = {
    label:string
    id:number
    image?:string
    type:ContextNaturalKey
}
export type ContextGroup = {
    items:ContextItem[]
    type:ContextNaturalKey
}
export enum UploadedFileType
{
    IMAGE = "image",
    IMAGE360 = "360photo",
    DOCUMENT = "document",
    VIDEO = "video",
    AUDIO = "audio",
}
export namespace UploadedFileType {
    export function parseFromMimeType(mimeType:string) {
        const mime = mimeType.toLowerCase()
        if(mime.indexOf(UploadedFileType.IMAGE) > -1)
            return UploadedFileType.IMAGE
        if(mime.indexOf(UploadedFileType.VIDEO) > -1)
            return UploadedFileType.VIDEO
        if(mime.indexOf(UploadedFileType.AUDIO) > -1)
            return UploadedFileType.AUDIO
        return UploadedFileType.DOCUMENT
    }
}
export type UploadedFile =
{
    user:number
    filename:string
    file:string
    type:UploadedFileType
    extension:string
    image:string
    image_width:number
    image_height:number
    thumbnail:string
    size:number
    created_at:string
    //extensions
    tempId?:number|string
    custom?:boolean
    uploadProgress?:number
    uploading?:boolean
    uploaded?:boolean
    hasError?:boolean

} & IdentifiableObject

type FileIcon = {name:string, color:string}
export const fileIcon = (file:UploadedFile) =>
{
    switch(file.type)
    {
        case UploadedFileType.AUDIO: return audioIcon(file.extension)
        case UploadedFileType.VIDEO: return videoIcon(file.extension)
        case UploadedFileType.DOCUMENT: return documentIcon(file.extension)
        case UploadedFileType.IMAGE: return imageIcon(file.extension)
        default:return documentIcon(file.extension)
    }
}
export const videoIcon = (extension:string):FileIcon =>
{
    switch(extension)
    {
        default: return {name:"file-video", color:"#A63636"}
    }
}
export const audioIcon = (extension:string):FileIcon =>
{
    switch(extension)
    {
        default: return {name:"file-audio", color:"#FFD00C"}
    }
}
export const imageIcon = (extension:string):FileIcon =>
{
    switch(extension)
    {
        default: return {name:"file-image", color:"#029555"}
    }
}
export const documentIcon = (extension:string):FileIcon => {
    switch(extension)
    {
        case "pptx":
        case "ppt":
        case "odp": return {name:"file-powerpoint", color:"#FF8D52"}

        case "pdf": return {name:"file-pdf", color:"#FF5656"}

        case "doc":
        case "docx":
        case "txt":
        case "rtf":
        case "odt": return {name:"file-word", color:"#547980"}

        case "xlsx":
        case "xls":
        case "ods": return {name:"file-excel", color:"#6abe67"}

        default: return {name:"file-alt", color:"#4A87EC"}
    }
}

export type Permissible = {
    permission:number
}
export type Linkable = {
    uri:string
}
export type AvatarAndCover = {

    avatar:string
    avatar_thumbnail:string
    cover: string
    cover_cropped: string
    cover_thumbnail: string
}
export type Conversation =
{
    title:string
    users:number[]
    archived_by?: number[]
    last_message:Message
    read_by:any[]
    absolute_url?:string
    created_at:string
    updated_at:string
    unread_messages:number[]
    temporary?:boolean

} & Linkable & IdentifiableObject & Permissible
export enum IntraSocialType{
    community, profile, project, group, event, task
}
export type ICommunity = {
    cover_thumbnail: string
    avatar_thumbnail:string
    deactivated:boolean
    name:string
    slug_name:string
    primary_color:string
    secondary_color:string
} & Linkable & IdentifiableObject

export type Community = {
    members: number[]
    relationship: any
    description: string
    updated_at:string
} & ICommunity & AvatarAndCover & Permissible

export type SimpleUserProfile = {
    absolute_url: string,
    avatar: string,
    first_name: string,
    last_name: string,
} & IdentifiableObject

export type UserProfile = {
    email:string|null
    locale:string|null
    timezone:string|null
    username: string
    uuid:string|null
    user_status:UserStatus
    biography:string
    slug_name:string
    relationship?: string[]
    mutual_friends?: number[]
    last_seen?:number
    is_anonymous:boolean
    is_staff:boolean
    is_superuser:boolean
    connections?:number[]
    active_community?:number
} & SimpleUserProfile & AvatarAndCover & Linkable & Permissible

export type Group = {
    name: string
    slug: string
    community: number
    description: string
    creator: UserProfile
    privacy: string
    members: number[]
    members_count: number
    created_at: string
    parent: number
    updated_at: string
} & AvatarAndCover & Linkable & Permissible & IdentifiableObject

export type Coordinate = {
    lat:number
    lon:number
}
export type Event = {
    name: string
    slug: string
    community: number
    description: string
    creator: UserProfile
    privacy: string
    attending: number[]
    attending_count: number
    not_attending: number[]
    not_attending_count: number
    invited: number[]
    invited_count: number
    created_at: string
    group: Group
    updated_at: string
    start:string
    end:string
    location:Coordinate
    address:string
    parent:Event

} & AvatarAndCover & Linkable & Permissible & IdentifiableObject

export type Project = {
    name: string
    slug: string
    community: number
    description: string
    creator: UserProfile
    privacy: string
    tasks: number
    tags: string[]
    members: number[]
    members_count: number
    created_at: string
    group: Group
    updated_at: string
    task_count: number
    tasks_assigned: number
    tasks_attention: number
    tasks_completed: number
    tasks_responsible: number
} & AvatarAndCover & Linkable & Permissible & IdentifiableObject

export type TimeSpent = {
    hours: number
    minutes: Number
}

export type Task = {
    id: number
    updated_at: string
    project:number
    title:string
    description: string
    last_change_by: number
    absolute_url: string
    category: string
    creator: SimpleUserProfile
    responsible?: SimpleUserProfile
    assigned_to?: SimpleUserProfile[]
    priority: TaskPriority
    state: TaskState
    spent_time: TimeSpent
    serialization_date: string
    visibility?: number[]
    attributes?: TaskObjectAttribute[]
} & Linkable & Permissible & IdentifiableObject

export enum TaskPriority{
    low = "low",
    medium = "medium",
    high = "high",
}
export namespace TaskPriority {
    export const all = [
        TaskPriority.low,
        TaskPriority.medium,
        TaskPriority.high,
    ]
    export function colorForPriority(type: TaskPriority) {
        switch(type){
            case TaskPriority.low: return "#61FA6B"
            case TaskPriority.medium: return "#FA9F61"
            case TaskPriority.high: return "#FA6161"
            default:return null
        }
    }
}
export enum TaskState{
    notStarted = "not-started",
    progress = "progress",
    toVerify = "to-verify",
    notApplicable = "not-applicable",
    completed = "completed"
}
export namespace TaskState {
    export const all = [
        TaskState.notStarted,
        TaskState.progress,
        TaskState.toVerify,
        TaskState.completed,
        TaskState.notApplicable,
    ]
    export function colorForState(type: TaskState) {
        switch(type){
            case TaskState.progress: return "#F8CF88"
            case TaskState.toVerify: return "#FFFFB1"
            case TaskState.completed: return "#B9E4B4"
            case TaskState.notApplicable : return "#ebccd1"
            default:return null
        }
    }
}
function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
    return o.reduce((res, key) => {
        res[key] = key;
        return res;
    }, Object.create(null));
}
export enum StatusReaction
{
    LIKE = "like",
    HEART = "heart",
    SAD = "sad",
    JOY = "joy"
}
export enum StatusReactionStyle {
    emoji, icon
}
export interface StatusReactionProps
{
    reaction:StatusReaction
    onClick?:(event:any) => void
    large:boolean
    showBackground?:boolean
    style?:React.CSSProperties
    innerRef?: any
    selected:boolean
    reactionStyle?:StatusReactionStyle
}
export abstract class StatusReactionUtilities
{
    public static parseStatusReaction = (reaction:string):StatusReaction =>
    {
        switch (reaction)
        {
            case StatusReaction.JOY : return StatusReaction.JOY
            case StatusReaction.HEART : return StatusReaction.HEART
            case StatusReaction.SAD : return StatusReaction.SAD
            default : return StatusReaction.LIKE
        }
    }
    public static reactionsList = ():StatusReaction[] =>
    {
        var arr = []
        for(var n in StatusReaction) {
            if (typeof StatusReaction[n] === 'string')
            {
                arr.push(StatusReaction[n]);
            }
        }
        return arr.map(s => StatusReactionUtilities.parseStatusReaction(s))
    }
    public static classNameForReactionContainer = (props:StatusReactionProps) =>
    {
        return "emoji-reaction-container" + (props.large ? " large": "")
    }
    public static emojiForReaction = (props:StatusReactionProps) =>
    {
        const reactionStyle = props.reactionStyle || StatusReactionStyle.emoji
        switch (props.reaction)
        {
            case StatusReaction.SAD : return    <span className={StatusReactionUtilities.classNameForReactionContainer(props)} onClick={props.onClick}>
                                                    <Emoji symbol="😔" label={props.reaction} />
                                                </span>
            case StatusReaction.JOY : return    <span className={StatusReactionUtilities.classNameForReactionContainer(props)} onClick={props.onClick}>
                                                    <Emoji symbol="😂" label={props.reaction} />
                                                </span>
            case StatusReaction.HEART : return  <span className={StatusReactionUtilities.classNameForReactionContainer(props)} onClick={props.onClick}>
                                                    <Emoji symbol="😍" label={props.reaction} />
                                                </span>
            case StatusReaction.LIKE : return   <span className={StatusReactionUtilities.classNameForReactionContainer(props)} onClick={props.onClick}>
                                                    {reactionStyle == StatusReactionStyle.emoji && <Emoji symbol="👍" label={props.reaction} />}
                                                    {reactionStyle == StatusReactionStyle.icon && <i className="far fa-thumbs-up"></i>}
                                                </span>
        }
    }
    public static Component = (props:StatusReactionProps) =>
    {
        return StatusReactionUtilities.emojiForReaction(props)
    }
}
export enum AvatarStateColor
{
    GREEN = "#01d100",
    ORANGE = "orange",
    RED = "red",
    GRAY = "gray",
    NONE = "inherit",
}
export enum UserStatus {
    active = "active",
    away = "away",
    unavailable = "unavailable",
    dnd = "dnd",
    vacation = "vacation",
    invisible = "invisible",
}
export type UserStatusItem = {
    type:UserStatus
    color:AvatarStateColor
    translation:() => string
}
const UserStatusObjects:{[key:string]:UserStatusItem} = {
    active:{type:UserStatus.active, color:AvatarStateColor.GREEN, translation:() => UserStatus.getTranslation(UserStatus.active)},
    away:{type:UserStatus.away, color:AvatarStateColor.ORANGE, translation:() => UserStatus.getTranslation(UserStatus.away)},
    unavailable:{type:UserStatus.unavailable, color:AvatarStateColor.NONE, translation:() => UserStatus.getTranslation(UserStatus.unavailable)},
    dnd:{type:UserStatus.dnd, color:AvatarStateColor.RED, translation:() => UserStatus.getTranslation(UserStatus.dnd)},
    vacation:{type:UserStatus.vacation, color:AvatarStateColor.GRAY, translation:() => UserStatus.getTranslation(UserStatus.vacation)},
    invisible:{type:UserStatus.invisible, color:AvatarStateColor.NONE, translation:() => UserStatus.getTranslation(UserStatus.invisible)},
}
export namespace UserStatus {

    export function getObject(status: UserStatus) {
        return UserStatusObjects[status]
    }
    export function getTranslation(status: UserStatus) {
        return translate("user.status." + status)
    }
    export function getSelectableStates(excludes?:UserStatus[]) {
        let selectables = [UserStatus.active, UserStatus.dnd, UserStatus.vacation, UserStatus.invisible]
        if(excludes)
            selectables = selectables.filter(s => !excludes.contains(s))
        return selectables.map(s => UserStatusObjects[s])
    }
}
//DASHBOARD
export type Module = {
    id:number
    name:string
    type:string
    disabled:boolean
    properties:string
}
export type GridModule = {
    id:number
    module:Module
    title:string
    column:number
    row:number
    width:number
    height:number
    grid_layout:number
}
export type GridLayout = {
    id:number
    grid_modules:GridModule[]
    title:string
    min_width:number
    fill:boolean
}
export type Dashboard = {
    id:number
    grid_layouts:GridLayout[]
    created_at:string
    updated_at:string
    hidden:boolean
    hidden_reason:string
    position:number
    title:string
    slug:string
    user:number
    category:string
}
//DASHBOARD END


export type Timesheet = {
    id:number
    created_at:string
    updated_at:string
    user:SimpleUserProfile
    date:string
    hours:number
    minutes:number
    description:string
    project:number
    task:number
    task_title: string
} & Permissible & Linkable
export interface EmbedMedia
{
    height:number
    width:number
    type:string
    html:string
}
export type EmbedImage = {

    caption: string,
    height: number,
    width: number,
    size: number,
    url: string
}
export interface EmbedCardItem
{
    key:string
    url:string
    provider_url:string
    provider_display:string
    original_url:string
    description:string
    title:string
    favicon_url:string
    images:EmbedImage[]
    media:EmbedMedia
    error_code:number
    type:string
    avatar:string
    subtitle:string
    internal?:boolean
}
export enum TaskActions
{
    /**Changes priority for Task: extra:{priority:TaskPriority} */
    setPriority,
    setState,
    /**add time to Task: extra:{description:string, date:moment.Moment, hours:number, minutes:number} */
    addTime,
    /**Creates a new Status: extra:{message:string, mentions?:number[], files?:UploadedFile[], completion?:(success:boolean) => void} */
    addStatus,

}
export enum StatusActions
{
    /**Navigates to the context of the current status (context_natural_key and context_object_id), i.e "group.group" or "core.community" ... and the the corresponding object id */
    context = 0,
    /**Navigates to the community of the current status: extra:{} */
    community = 1,
    /**Navigates to User profile for the current status or the profile in extra field: extra:{profile?:UserProfile} */
    user = 3,
    /**Navigates to a browser component that loads the "link": extra:{link:string} */
    link = 4,
    /**Sends a reaction to the server: extra:{reaction:string|null} */
    react = 5,
    /**Creates a new comment: extra:{message:string, mentions?:number[], files?:UploadedFile[], completion?:(success:boolean) => void} */
    new = 6,
    /**Edits a status: extra:{status:Status, files?:UploadedFile[], completion?:(success:boolean) => void} */
    edit = 7,
    /** NOOP extra:{} */
    delete = 8,
    /** NOOP extra:{} */
    reactionsCount = 9,
    /** NOOP extra:{} */
    file = 10,
    /**Navigates to an intrasocial link that loads "link": extra:{link:string} */
    intrasocial_link = 11,
    /**Navigates to a status; extra:{status:number} */
    status = 12,
    /**Navigates to a search page; extra:{query:string} */
    search,
    /**creates an attribute on status; extra:{type:ObjectAttributeType, user?:number} */
    createAttribute,
    /**deletes an attribute on status; extra:{id:number} */
    deleteAttribute,
    /**activates reply box for comments; extra:{id:number}, where id = status_id */
    showCommentReply,

}
