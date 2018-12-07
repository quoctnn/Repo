import { nullOrUndefined } from "../utilities/Utilities";
import * as React from 'react';

export interface Verb 
{
    id:number
}
export interface Notification 
{
    absolute_url:string
    actor:SimpleUserProfile
    extra:any
    message:string 
    verb:Verb
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
    avatar: string,
    avatar_thumbnail: string,
    cover: string,
    cover_cropped: string,
    members: number[],
    relationship: any,
    updated_at:string
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
    comments_count:number
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
export enum ContextNaturalKey
{
    GROUP = "group.group",
    COMMUNITY = "core.community",
    USER = "auth.user",
    PROJECT = "project.project",
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
export interface StatusReactionProps
{
    reaction:StatusReaction
    onClick?:(event:any) => void
    large:boolean
    showBackground?:boolean
    style?:React.CSSProperties
    innerRef?: any
    selected:boolean
}
export abstract class StatusReactionUtilities
{
    public static iconNameForReaction = (reaction:StatusReaction, large = true, showBackground:boolean) =>
    {
        switch (reaction)
        {
            case StatusReaction.SAD : return "sad-tear"
            case StatusReaction.JOY : return "grin-tears"
            case StatusReaction.HEART : return "grin-hearts"
            case StatusReaction.LIKE : return "thumbs-up"
        }
    }
    public static styleForReaction = (reaction:StatusReaction, large = true, selected:boolean) =>
    {
        const size = StatusReactionUtilities.size(large)
        var style:React.CSSProperties = {
        }
        switch (reaction)
        {
            case StatusReaction.SAD : style.color = "white";break;
            case StatusReaction.JOY : style.color = "white";break;
            case StatusReaction.HEART : style.color = "white";break;
            case StatusReaction.LIKE : style.color = selected ? "#428bca" : "#AFAFAF" ;break;
        }
        return style
    }
    public static wrapperStyleForReaction = (reaction:StatusReaction, large = true, showBackground:boolean) =>
    {
        var style:React.CSSProperties = {
            justifyContent:"center",
            alignItems:"center"
        }
        switch (reaction)
        {
            case StatusReaction.SAD : style.backgroundColor = "#f0ad4e";break;
            case StatusReaction.JOY : style.backgroundColor = "#f0ad4e";break;
            case StatusReaction.HEART : style.backgroundColor = "#d9534f";break;
            case StatusReaction.LIKE : style.backgroundColor = "transparent";break;
        }
        return style
    }
    public static size = (large = true) =>
    {
        return large ? 32 : 16
    }
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
    public static classNameForReactionContainer = (reaction:StatusReaction, large = true, showBackground:boolean) =>
    {
        return "emoji-reaction-container" + (large ? " large fa-2x": "") + (showBackground ? " fa-stack-1-5" : "" )
    }
    public static classNameForReactionBackground = (reaction:StatusReaction, large = true) =>
    {
        return "fas fa-circle fa-stack-1-5x emoji-reaction-bg " + reaction
    }
    public static classNameForReaction = (reaction:StatusReaction, large = true, showBackground:boolean) =>
    {
        var ret = "far emoji-reaction " + reaction + (showBackground ? " fa-stack-1x fa-inverse" : "")
        switch (reaction)
        {
            case StatusReaction.SAD : ret += " fa-sad-tear";break;
            case StatusReaction.JOY : ret += " fa-grin-tears";break;
            case StatusReaction.HEART : ret += " fa-grin-hearts";break;
            case StatusReaction.LIKE : ret += " fa-thumbs-up";break;
        }
        ret += (large ? " large": "")
        return ret
    }
    public static Component = (props:StatusReactionProps) =>
    {
        let showBG = nullOrUndefined (props.showBackground ) ? true : props.showBackground
        return (<span onClick={props.onClick} className={StatusReactionUtilities.classNameForReactionContainer(props.reaction, props.large, showBG)}>
                    {showBG && <i className={StatusReactionUtilities.classNameForReactionBackground(props.reaction, props.large)}></i>}
                    <i className={StatusReactionUtilities.classNameForReaction(props.reaction, props.large, showBG)}></i>
                </span>)
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
    avatar_thumbnail: string,
    cover: string,
    cover_cropped: string,
    username: string,
    uuid:string|null,
    user_status:UserStatus,
    biography:string,
    slug_name:string,
    updated_at:number
    relationship?: string[],
    last_seen?:number,
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
export interface EmbedlyMedia
{
    height:number
    width:number
    type:string
    html:string
}
export interface EmbedlyItem
{
    url:string
    provider_url:string
    original_url:string
    description:string
    title:string
    thumbnail_url:string
    thumbnail_width:number
    thumbnail_height:number
    media:EmbedlyMedia
    error_code:number
}