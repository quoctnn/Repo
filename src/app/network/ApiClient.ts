import Constants from "../utilities/Constants";
import {AjaxRequest} from "./AjaxRequest";
import { EndpointManager } from '../managers/EndpointManager';
var $ = require("jquery")
import { Status, UserProfile, UploadedFile, Community, Group, Conversation, Project, Message, Event, Task, ElasticSearchType, ObjectAttributeType, StatusObjectAttribute, EmbedCardItem, ReportTag, ContextNaturalKey, ReportResult, Dashboard, Timesheet, Coordinate, RecentActivity } from '../types/intrasocial_types';
import { nullOrUndefined } from '../utilities/Utilities';
import moment = require("moment");
import { Settings } from "../utilities/Settings";
import { ConversationManager } from '../managers/ConversationManager';
export type PaginationResult<T> = {results:T[], count:number, previous:string|null, next:string|null, divider?:number}
export type ElasticSuggestion = {text:string, offset:number, length:number, options:[]}
export type ElasticExtensionResult = {stats:{suggestions:{[key:string]:ElasticSuggestion}, aggregations:{[key:string]:any}}}
export type StatusCommentsResult<T> = {results:T[], count:number, parent:T}
export type ElasticResult<T> = PaginationResult<T> & ElasticExtensionResult
export type ApiClientFeedPageCallback<T> = (data: PaginationResult<T>, status:string, error:string|null) => void;
export type ApiClientCallback<T> = (data: T|null, status:string, error:string|null) => void;
export type ApiStatusCommentsCallback<T> = (data: StatusCommentsResult<T>, status:string, error:string|null) => void;


export enum ListOrdering {
    ALPHABETICAL = "alphabetical",
    LAST_USED = "last-used",
    MOST_USED = "most-used",
}
export default class ApiClient
{
    static getQueryString(params:any)
    {
        var arr:string[] = []
        Object.keys(params).forEach(key => {
            const val = params[key]
            if(typeof val != "string" && Array.isArray(val))
            {
                if(val.length > 0)
                {
                    val.forEach(v => {
                        if(!nullOrUndefined( v ))
                            arr.push(key + '=' + encodeURIComponent( v ))
                    })
                }
            }
            else if(!nullOrUndefined( val ))
            {
                arr.push(key + '=' + encodeURIComponent(val))
            }
        })
        return arr.join('&');
    }
    static forwardGeocode(address:string, callback:ApiClientCallback<Coordinate>){
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?types=address&access_token=${Settings.mapboxAccessToken}`
        AjaxRequest.get(url, (data:{features:[{center:number[]}]}, status, request) => {
            let location:Coordinate = null
            const feature = data && data.features && data.features[0]
            if(feature && feature.center && feature.center.length == 2)
            {
                location = {lat:feature.center[1], lon:feature.center[0]}
            }
            callback(location, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static createTimesheet(task:number, description:string, date:moment.Moment,  hours:number, minutes:number, callback:ApiClientCallback<Timesheet>){
        const url = Constants.apiRoute.timeSheetUrl
        AjaxRequest.postJSON(url,  { task, date:date.format("YYYY-MM-DD"), description, hours, minutes}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getDashboards(callback:ApiClientFeedPageCallback<Dashboard>){
        const url = Constants.apiRoute.dashboardListEndpoint + "?" + this.getQueryString({})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static reportObject(type:string, contextId:number, tags:string[], description:string , callback:ApiClientCallback<ReportResult>){

        const endpoint = Constants.apiRoute.reportUrl(type,contextId)
        AjaxRequest.postJSON(endpoint,  { description, tags}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getReportTags(callback:ApiClientCallback<ReportTag[]>){
        const url = Constants.apiRoute.reportTags
        AjaxRequest.get(url, (data, status, request) => {
            var arr = Object.keys(data).map(function (key, index) {
                return { value: key, label: data[key] }
            });
            callback(arr, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static createStatusAttribute(status:number, attribute:ObjectAttributeType, user:number, callback:ApiClientCallback<StatusObjectAttribute>){
        const endpoint = Constants.apiRoute.statusAttributes
        AjaxRequest.postJSON(endpoint, {status, attribute, user}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static deleteStatusAttribute(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.statusAttributesId(id)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getEmbedCards(urls:string[], callback:ApiClientCallback<EmbedCardItem[]>){
        const url = Constants.apiRoute.embedlyApiEndpoint + "?" + this.getQueryString({urls})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static search(  limit:number,
                    offset:number,
                    term :string,
                    types:ElasticSearchType[],
                    use_simple_query_string:boolean = true,
                    include_results:boolean = true,
                    include_suggestions:boolean = false,
                    slim_types:boolean = true,
                    filters:{[key:string]:string},
                    tags:string[],
                    callback:ApiClientCallback<ElasticResult<any>>){
        let url = Constants.apiRoute.searchUrl + "?" + this.getQueryString({limit, offset})
        AjaxRequest.postJSON(url, {term, include_results, include_suggestions, slim_types, types, use_simple_query_string, filters, tags}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static statusComments(parent:number, position:number, children:number, includeParent:boolean, callback:ApiStatusCommentsCallback<Status>)
    {
        const inclParent = includeParent ? true : undefined
        let url = Constants.apiRoute.postCommentsUrl(parent) + "?" + this.getQueryString({children, indices:position, parent:inclParent })
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static newsfeedV2(limit:number,offset:number,context_natural_key:ContextNaturalKey, context_object_id:number, parent:number, children:number,attribute:ObjectAttributeType, include_sub_context:boolean = true, after:number, callback:ApiClientFeedPageCallback<Status>)
    {
        let url = Constants.apiRoute.postUrl + "?" + this.getQueryString({limit,offset,context_natural_key	,context_object_id, parent, children, attribute, include_sub_context, after })
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static newsfeed(limit:number,offset:number, parent:number|null, children:number|null, callback:ApiClientFeedPageCallback<Status>)
    {
        let url = Constants.apiRoute.postUrl + "?" + this.getQueryString({limit,offset,parent,children})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getRecentActivity(limit:number, offset:number, callback:ApiClientFeedPageCallback<RecentActivity>)
    {
        let url = Constants.apiRoute.recentActivityUrl + "?" + this.getQueryString({limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })

    }
    static readActivity(id:number, callback: (success, response) => void)
    {
        let url = Constants.apiRoute.recentActivityMarkReadUrl
        AjaxRequest.post(url, {'serialization_ids':[id]}, (data, status, request) => {
            callback(true, data)
        }, (request, status, error) => {
            callback(false, error)
        })
    }
    static createStatus(status:Status, callback:ApiClientCallback<Status>)
    {
        let url = Constants.apiRoute.postUrl
        AjaxRequest.post(url,status, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static deleteStatus(statusId:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.postUrl + statusId + "/"
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static deleteConversation(conversationId:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.conversation(conversationId)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static updateConversation(id:number, conversation:Partial<Conversation>, callback:ApiClientCallback<Conversation>)
    {
        let url = Constants.apiRoute.conversation(id)
        AjaxRequest.patch(url, conversation, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static addConversationUsers(conversation:number, users:number[], callback:ApiClientCallback<Conversation>)
    {
        let url = Constants.apiRoute.addConversationUsers(conversation)
        AjaxRequest.post(url, {users}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static leaveConversation(id:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.leaveConversation(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static updateTask(id:number, task:Partial<Task>, callback:ApiClientCallback<Task>)
    {
        let url = Constants.apiRoute.taskIdUrl(id)
        AjaxRequest.patch(url, task, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static updateStatus(status:Status, callback:ApiClientCallback<Status>)
    {
        let url = Constants.apiRoute.postUrl + status.id + "/"
        AjaxRequest.patch(url, status, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getStatus(id:number|string, callback:ApiClientCallback<Status>)
    {
        let url = Constants.apiRoute.postUpdateUrl(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getCommunity(communityId:string|number, callback:ApiClientCallback<Community>)
    {
        let url = Constants.apiRoute.communityUrl(communityId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static setMainCommunity(communityId:string|number, callback:ApiClientCallback<Community>)
    {
        let url = Constants.apiRoute.setMainCommunityUrl(communityId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getFiles(context_natural_key:ContextNaturalKey, context_object_id:number, limit:number, offset:number, callback:ApiClientFeedPageCallback<UploadedFile>){
        let url = Constants.apiRoute.fileUploadUrl + "?" + this.getQueryString({context_natural_key,context_object_id, limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getCommunityFiles(communityId:string|number, limit:number, offset:number, callback:ApiClientFeedPageCallback<UploadedFile>)
    {
        let url = Constants.apiRoute.communityFilesUrl(communityId) + "?" + this.getQueryString({limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getProject(projectId:string|number, callback:ApiClientCallback<Project>)
    {
        let url = Constants.apiRoute.projectDetailUrl(projectId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getTasks(limit:number,
                    offset:number,
                    project:number,
                    state:string[],
                    priority:string[],
                    tags:string[],
                    assigned_to:number,
                    responsible:number,
                    creator:number,
                    not_assigned:boolean,
                    category:string,
                    term:string,
                    callback:ApiClientFeedPageCallback<Task>){
        let url = Constants.apiRoute.taskUrl + "?" + this.getQueryString({limit,
                                                                        offset,
                                                                        project,
                                                                        state,
                                                                        priority,
                                                                        tags,
                                                                        assigned_to,
                                                                        responsible,
                                                                        creator,
                                                                        not_assigned,
                                                                        category,
                                                                        term})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getTask(taskId:number, callback:ApiClientCallback<Task>)
    {
        let url = Constants.apiRoute.taskDetailUrl(taskId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getEvent(eventId:string|number, callback:ApiClientCallback<Event>)
    {
        let url = Constants.apiRoute.eventDetailUrl(eventId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getProfilesByIds(profiles:number[], callback:ApiClientFeedPageCallback<UserProfile>)
    {
        let url = Constants.apiRoute.profilesUrl + "?" + this.getQueryString({limit:profiles.length, id:encodeURIComponent(profiles.join(","))})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getProfiles(limit:number, offset:number, callback:ApiClientFeedPageCallback<UserProfile>)
    {
        let url = Constants.apiRoute.profilesUrl + "?" + this.getQueryString({limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static reactToStatus(statusId:number,reaction:string, callback:ApiClientCallback<any>)
    {
        AjaxRequest.post(Constants.apiRoute.postReaction(statusId), {reaction}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static createConversation(title:string, users:number[], callback:ApiClientCallback<Conversation>)
    {
        let d:any = {users}
        if(title)
        {
            d.title = title
        }
        AjaxRequest.postJSON(Constants.apiRoute.conversations, d, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getProfile(id:string|number, callback:ApiClientCallback<UserProfile>)
    {
        AjaxRequest.get(Constants.apiRoute.profileUrl(id), (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getProfilesBySlug(slug:string, callback:ApiClientFeedPageCallback<UserProfile>)
    {
        const url = Constants.apiRoute.profilesUrl + "?" + this.getQueryString({slug_name:encodeURIComponent( slug )})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getMyProfile(callback:ApiClientCallback<UserProfile>)
    {
        AjaxRequest.get(Constants.apiRoute.myProfileUrl, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static apiLogin(email:string, password:string,callback:ApiClientCallback<{token:string|null}>)
    {
        AjaxRequest.post(Constants.apiRoute.login,`username=${email}&password=${password}`, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static nativeLogin(email:string, password:string,callback:ApiClientCallback<{token:string|null}>)
    {
        AjaxRequest.post(Constants.apiRoute.nativeLogin,`username=${email}&password=${password}`, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getCommunities(is_member:boolean, ordering:ListOrdering, limit:number, offset:number,callback:ApiClientFeedPageCallback<Community>)
    {
        let url = Constants.apiRoute.communityList + "?" + this.getQueryString({is_member:(is_member ? "True":"False"), limit, offset, ordering})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getGroups(community:number, limit:number, offset:number, ordering:string, callback:ApiClientFeedPageCallback<Group>)
    {
        let url = Constants.apiRoute.groupsUrl + "?" + this.getQueryString({community, limit, offset, ordering})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getGroup(groupId:string, callback:ApiClientCallback<Group>)
    {
        let url = Constants.apiRoute.groupUrl(groupId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getTimesheets(user:number, project:number, task:number, limit:number, offset:number,callback:ApiClientFeedPageCallback<Timesheet>)
    {
        let url = Constants.apiRoute.timeSheetUrl + "?" + this.getQueryString({user, project, task, limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getEvents(community:number, limit:number, offset:number, ordering:string, upcoming:boolean, callback:ApiClientFeedPageCallback<Event>)
    {
        let start_date = upcoming ? "&start_after=" : "&start_before="
        let url = Constants.apiRoute.eventsUrl + "?" + this.getQueryString({community, limit, offset, ordering}) + start_date + moment().format("YYYY-MM-DD")
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getProjects(community:number, limit:number, offset:number, ordering:string, responsible:boolean, assigned:boolean, callback:ApiClientFeedPageCallback<Project>)
    {
        let url = Constants.apiRoute.projectsUrl + "?" + this.getQueryString({community, limit, offset, ordering, responsible, assigned})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getConversations(limit:number, offset:number, archived:boolean, callback:ApiClientFeedPageCallback<Conversation>)
    {
        let url = Constants.apiRoute.conversations + "?" + this.getQueryString({limit, offset, archived})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getConversation(id:number,callback:ApiClientCallback<Conversation>)
    {
        let url = Constants.apiRoute.conversation(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static createMessage(message:Message, callback:ApiClientCallback<Message>)
    {
        if(message.tempFile && message.tempFile.file && message.tempFile.file instanceof File)
        {
            this.uploadFile(message, (m:Message) => {
                if(m.tempFile && m.tempFile.error)
                {
                    callback(null, "Error", "Error uploading file")
                }
                else {
                    this.sendMessage(m, callback)
                }
            })
        }
        else {
            this.sendMessage(message, callback)
        }
        
    }
    private static sendMessage(message:Message, callback:ApiClientCallback<Message>){
        var data = { conversation: message.conversation, text: message.text, uid: message.uid, mentions:message.mentions, files:[] }
        if(message.tempFile && message.tempFile.fileId)
        {
            data.files.push(message.tempFile.fileId)
        }
        AjaxRequest.postJSON(Constants.apiRoute.conversationMessagesUrl, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            let m = Object.assign({}, message)
            m.tempFile = Object.assign({}, m.tempFile)
            m.error = status
            ConversationManager.updateQueuedMessage(m)
            callback(null, status, error)
        })
    }
    private static uploadFile(message:Message, completion:(message:Message) => void){
        let file = message.tempFile.file
        let uploader = new FileUploader(file, (progress) => {
            let m = Object.assign({}, message)
            m.tempFile = Object.assign({}, m.tempFile)
            m.tempFile.progress = progress
            ConversationManager.updateQueuedMessage(m)
            debugger
        })
        uploader.doUpload((file:UploadedFile) => {
            let m = Object.assign({}, message)
            m.tempFile = Object.assign({}, m.tempFile)
            if(file)
            {
                m.tempFile.fileId = file.id
                m.tempFile.file = {} as any
            }
            else 
            {
                m.tempFile.progress = 0
                m.tempFile.error = "error"
            }
            ConversationManager.updateQueuedMessage(m)
            debugger
            completion(m)
        })
    }
    static getConversationMessages(conversation:number, limit:number, offset:number,callback:ApiClientFeedPageCallback<Message>)
    {
        let url = Constants.apiRoute.conversationMessagesUrl +  "?" + this.getQueryString({limit, offset, conversation})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static markConversationAsRead(conversationId:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.conversationMarkAsReadUrl(conversationId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getPage<T>(endpoint:string, limit:number, offset:number,callback:ApiClientFeedPageCallback<T>)
    {
        let url = endpoint + "?" + this.getQueryString({ limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
}
export class FileUploader
{
    file:Blob
    progress:(percent:number) => void
    constructor(file:Blob, progress:(percent:number) => void)
    {
        this.file = file
        this.progress = progress
        this.doUpload = this.doUpload.bind(this)
        this.progressHandling = this.progressHandling.bind(this)
    }
    doUpload(completion:(file:UploadedFile) => void)
    {
        let url = EndpointManager.applyEndpointDomain(Constants.apiRoute.fileUploadUrl)
        const data = new FormData();
        data.append("file", this.file)
        $.ajax({
            type: "POST",
            url: url,
            xhr: () =>  {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    myXhr.upload.addEventListener('progress', this.progressHandling, false);
                }
                return myXhr;
            },
            success: function (data:{files:UploadedFile[]}) {
                completion(data.files[0])
            },
            error: function (error) {
                completion(null)
            },
            async: true,
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            timeout: 60000
        })
    }
    progressHandling(event)
    {
        var percent = 0;
        var position = event.loaded || event.position;
        var total = event.total;
        if (event.lengthComputable) {
            percent = Math.ceil(position / total * 100);
        }
        this.progress(percent)
    }
}
