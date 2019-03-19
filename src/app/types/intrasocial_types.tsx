import { nullOrUndefined } from "../utilities/Utilities";
import * as React from 'react';
import Emoji from "../components/general/Emoji";

export interface Verb
{
    id:number
    infinitive:string
    past_tense:string
}
export interface SimpleNotification
{
    absolute_url:string
    actor:SimpleUserProfile
    extra:any
    message:string
    verb:Verb
}
export interface Notification
{
    serialization_id:string
    created_at:string
    updated_at:string
    verb:Verb
    is_seen: boolean
    is_read: boolean
    actor_count:number
    display_text:string
    extra:any
    absolute_url:string
    actors:number[]
}
export interface ICommunity
{
  absolute_url:string
  deactivated:boolean
  id:number
  name:string
  slug_name:string
}
export interface Community extends ICommunity
{
    avatar: string
    avatar_thumbnail: string
    cover: string
    cover_cropped: string
    members: number[]
    relationship: any
    updated_at:string
    permission:number
}
export interface TempStatus
{
  text: string
  privacy: string
  files_ids: number[]
  link: string|null
  context_natural_key?: string
  context_object_id?: number
  parent:number,
  mentions: number[]
  pending?:boolean
}
export interface ContextObject
{absolute_url:string, name:string}
export interface Status extends TempStatus
{
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
    permission:number
    permission_set:number[]
    poll:any
    read:boolean
    updated_at:string
    serialization_date:string
    extra?:string
    highlights?:{[id:string]:[string]}
    attributes:SimpleObjectAttribute[]
    temporary:boolean
}

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
export enum ElasticSearchType 
{
    GROUP = "Group",
    COMMUNITY = "Community",
    USER = "User",
    PROJECT = "Project",
    TASK = "Task",
    EVENT = "Event",
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
    DOCUMENT = "document",
    VIDEO = "video",
    AUDIO = "audio",
}

export interface UploadedFile
{
    id:number
    user:number
    filename:string
    file:string
    type:string
    extension:string
    image:string
    image_width:number
    image_height:number
    thumbnail:string
    size:number
    created_at:string
}
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
export class Conversation
{
    id:number
    title:string
    users:number[]
    archived_by: number[]
    last_message:Message
    read_by:any[]
    absolute_url:string
    created_at:string
    updated_at:string
    unread_messages!:number[]
    constructor(id:number,
        title:string,
        users:number[],
        archived_by: number[],
        last_message:Message,
        read_by:any[],
        absolute_url:string,
        created_at:string,
        updated_at:string)
    {
        this.id = id
        this.title = title
        this.users = users
        this.archived_by = archived_by
        this.last_message = last_message
        this.read_by = read_by
        this.absolute_url = absolute_url
        this.created_at = created_at
        this.updated_at = updated_at
    }
}
export interface Group {
    id: number
    name: string
    slug: string
    cover: string
    community: number
    cover_cropped: string
    cover_thumbnail: string
    description: string
    creator: UserProfile
    privacy: string
    members: number[]
    members_count: number
    created_at: string
    parent: number
    updated_at: string
}
export interface Event {
    id: number
    name: string
    slug: string
    cover: string
    community: number
    cover_cropped: string
    cover_thumbnail: string
    description: string
    creator: UserProfile
    privacy: string
    attendees_count: number
    attending: number[]
    not_attending: number[]
    created_at: string
    group: Group
    updated_at: string
}
export interface Project {
    id: number
    name: string
    slug: string
    cover: string
    community: number
    cover_cropped: string
    cover_thumbnail: string
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
}
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
export interface SimpleTask 
{
    id: number
    updated_at: string
    project:number
    title:string
    absolute_url: string
    category: string
    creator: SimpleUserProfile
    priority: TaskPriority
    state: TaskState
    serialization_date:string
}
export interface Task extends SimpleTask
{
    
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
export const UserStatus = strEnum([
    "active",
    "away",
    "unavailable",
    "dnd",
    "vacation",
    "invisible",
])
export type UserStatus = keyof typeof UserStatus;
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
}
//DASHBOARD END

export interface SimpleUserProfile
{
    absolute_url: string,
    avatar: string,
    first_name: string,
    last_name: string,
    id: number,
}
export interface UserProfile extends SimpleUserProfile{
    email:string|null
    locale:string|null
    timezone:string|null
    avatar_thumbnail: string
    cover: string
    cover_cropped: string
    username: string
    uuid:string|null
    user_status:UserStatus
    biography:string
    slug_name:string
    updated_at:number
    relationship?: string[]
    mutual_friends?: number[]
    last_seen?:number
    is_anonymous:boolean
    is_staff:boolean
    is_superuser:boolean
    connections?:number[]
}
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
}
export const avatarStateColorForUserProfile = (userProfile:UserProfile) => {
    switch(userProfile.user_status)
    {
        case UserStatus.active: return AvatarStateColor.GREEN;
        case UserStatus.away: return AvatarStateColor.ORANGE;
        case UserStatus.dnd: return AvatarStateColor.RED;
        case UserStatus.vacation: return AvatarStateColor.GRAY;
        default: return AvatarStateColor.NONE
    }
}
export const userStatusTextForUserProfile = (userProfile:UserProfile) => {
    switch(userProfile.user_status)
    {
        case UserStatus.active: return "Active";
        case UserStatus.away: return "Away";
        case UserStatus.dnd: return "Do not disturb";
        case UserStatus.vacation: return "Vacation";
        default: return "Unknown"
    }
}
export enum AvatarStateColor
{
    GREEN = "green",
    ORANGE = "orange",
    RED = "red",
    GRAY = "gray",
    NONE = "none",
}
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
}
export enum TaskActions 
{
    /**Changes priority for Task: extra:{priority:TaskPriority} */
    setPriority,
    setState, 
    /**add time to Task: extra:{description:string, date:moment.Moment, hours:number, minutes:number} */
    addTime

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

}
