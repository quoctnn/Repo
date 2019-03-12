import Constants from "../utilities/Constants";
import {AjaxRequest} from "./AjaxRequest";
import { EndpointManager } from '../managers/EndpointManager';
var $ = require("jquery")
import { Status, UserProfile, UploadedFile, Community, Group, Conversation, Project, Message, Event, Task, ElasticSearchType, ObjectAttributeType, StatusObjectAttribute, EmbedCardItem, ReportTag, ContextNaturalKey, ReportResult, SimpleTask, Dashboard } from '../types/intrasocial_types';
import { nullOrUndefined } from '../utilities/Utilities';
export type PaginationResult<T> = {results:T[], count:number, previous:string|null, next:string|null}
export type StatusCommentsResult<T> = {results:T[], count:number, parent:T}
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
                            arr.push(key + '=' + v)
                    })
                }
            }
            else if(!nullOrUndefined( val ))
            {
                arr.push(key + '=' + val)
            }
        })
        return arr.join('&');
    }
    static getAcquaintances(callback:ApiClientFeedPageCallback<UserProfile>) {
        const url = Constants.apiRoute.acquaintancesUrl + "?" + this.getQueryString({})
        AjaxRequest.get(url, (data, status, request) => {
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
    static search(term :string,types:ElasticSearchType[], use_simple_query_string:boolean = true, include_results:boolean = true, include_suggestions:boolean = false, slim_types:boolean = true, limit:number, offset:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.searchUrl + "?" + this.getQueryString({limit, offset})
        AjaxRequest.postJSON(url, {term, include_results, include_suggestions, slim_types, types, use_simple_query_string}, (data, status, request) => {
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
    static newsfeedV2(limit:number,offset:number,context_natural_key:string|null, context_object_id:number|null, parent:number|null, children:number|null,include_sub_context:boolean = true,  callback:ApiClientFeedPageCallback<Status>)
    {
        let url = Constants.apiRoute.postUrl + "?" + this.getQueryString({limit,offset,context_natural_key	,context_object_id, parent, children, include_sub_context })
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
    static updateStatus(status:Status, callback:ApiClientCallback<Status>)
    {
        let url = Constants.apiRoute.postUrl + status.id + "/"
        AjaxRequest.patch(url, status, (data, status, request) => {
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
                    callback:ApiClientFeedPageCallback<SimpleTask>){
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
    static getProfiles(profiles:number[], callback:ApiClientFeedPageCallback<UserProfile>)
    {
        let url = Constants.apiRoute.profilesUrl +  "?id=" + profiles.join()
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
    static getGroups(community:number, limit:number, offset:number,callback:ApiClientFeedPageCallback<Group>)
    {
        let url = Constants.apiRoute.groupsUrl + "?" + this.getQueryString({community, limit, offset})
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
    static getEvents(community:number, limit:number, offset:number,callback:ApiClientFeedPageCallback<Event>)
    {
        let url = Constants.apiRoute.eventsUrl + "?" + this.getQueryString({community, limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getProjects(community:number, limit:number, offset:number,callback:ApiClientFeedPageCallback<Project>)
    {
        let url = Constants.apiRoute.projectsUrl + "?" + this.getQueryString({community, limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getConversations(limit:number, offset:number,callback:ApiClientFeedPageCallback<Conversation>)
    {
        let url = Constants.apiRoute.conversations + "?" + this.getQueryString({limit, offset})
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
    static getConversationMessages(conversationId:number, limit:number, offset:number,callback:ApiClientFeedPageCallback<Message>)
    {
        let url = Constants.apiRoute.conversationMessagesUrl(conversationId) + "?" + this.getQueryString({limit, offset})
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
