import Constants from "../utilities/Constants";
import {AjaxRequest} from "./AjaxRequest";
import { EndpointManager } from '../managers/EndpointManager';
var $ = require("jquery")
import { Status, UserProfile, UploadedFile, Community, Group, Conversation, Project, Message, Event, Task,
         ElasticSearchType, ObjectAttributeType, StatusObjectAttribute, EmbedCardItem, ReportTag,
         ContextNaturalKey, ReportResult, Dashboard, Timesheet, Coordinate, RecentActivity,
         UnhandledNotifications, UnreadNotificationCounts, GroupSorting, ProjectSorting, Favorite,
         VersionInfo,
         SearchHistory,
         ProfileCertification,
         ProfileEducation,
         ProfilePosition,
         CrashLogLevel,
         CalendarItem,
         GDPRInfo,
         GDPRFormAnswers} from '../types/intrasocial_types';
import { nullOrUndefined, DateFormat } from '../utilities/Utilities';
import moment = require("moment");
import { Settings } from "../utilities/Settings";
import { ConversationManager } from '../managers/ConversationManager';
import { ProfileLanguage, ProfileVolunteeringExperience, RequestErrorData } from '../types/intrasocial_types';
export type PaginationResult<T> = {results:T[], count:number, previous?:string, next?:string, divider?:number}
export type ElasticSuggestion = {text:string, offset:number, length:number, options:[]}
export type ElasticExtensionResult = {stats:{suggestions:{[key:string]:ElasticSuggestion}, aggregations:{[key:string]:any}}}
export type StatusCommentsResult<T> = {results:T[], count:number, parent:T}
export type ElasticResult<T> = PaginationResult<T> & ElasticExtensionResult
export type ApiClientFeedPageCallback<T> = (data: PaginationResult<T>, status:string, error:string|null, errorData?:RequestErrorData) => void;
export type ApiClientCallback<T> = (data: T|null, status:string, error:string|null, errorData?:RequestErrorData) => void;
export type ApiStatusCommentsCallback<T> = (data: StatusCommentsResult<T>, status:string, error:string|null, errorData?:RequestErrorData) => void;
export type SearchArguments = {
    term?:string
    types?:ElasticSearchType[]
    use_simple_query_string?:boolean
    include_results?:boolean
    include_suggestions?:boolean
    include_aggregations?:boolean
    slim_types?:boolean
    filters?:{[key:string]:string}
    tags?:string[]
    date_sort?:boolean
    from_date?:string
    to_date?:string
}

export enum ListOrdering {
    ALPHABETICALLY = "alphabetically",
    RECENT = "recent",
    MOST_USED = "most_used",
    RECENT_ACTIVIY = "recent_activity"
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
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getBackendVersionInfo(callback:ApiClientCallback<VersionInfo>){
        const url = Constants.apiRoute.versionUrl
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static createTimesheet(task:number, description:string, date:moment.Moment,  hours:number, minutes:number, callback:ApiClientCallback<Timesheet>){
        const url = Constants.apiRoute.timeSheetUrl
        AjaxRequest.postJSON(url,  { task, date:date.format("YYYY-MM-DD"), description, hours, minutes}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getDashboards(callback:ApiClientFeedPageCallback<Dashboard>){
        const url = Constants.apiRoute.dashboardListEndpoint + "?" + this.getQueryString({})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static reportObject(type:string, contextId:number, tags:string[], description:string , callback:ApiClientCallback<ReportResult>){

        const endpoint = Constants.apiRoute.reportUrl(type,contextId)
        AjaxRequest.postJSON(endpoint,  { description, tags}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
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
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getSearchHistory(callback:ApiClientFeedPageCallback<SearchHistory>){
        const url = Constants.apiRoute.getSearchHistoryUrl
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static deleteSearchHistory(id:number, callback:ApiClientCallback<any>){
        const url = Constants.apiRoute.removeSearchHistoryUrl(id)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static createSearchHistory(term:string, callback:ApiClientFeedPageCallback<SearchHistory>){
        const url = Constants.apiRoute.createSearchHistoryUrl
        AjaxRequest.postJSON(url, {term}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static createStatusAttribute(status:number, attribute:ObjectAttributeType, user:number, callback:ApiClientCallback<StatusObjectAttribute>){
        const endpoint = Constants.apiRoute.statusAttributes
        AjaxRequest.postJSON(endpoint, {status, attribute, user}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static setStatusesRead(ids:number[], callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.statusMarkRead
        AjaxRequest.postJSON(url, {ids}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static setMessagesRead(ids:number[], callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.messageMarkRead
        AjaxRequest.postJSON(url, {ids}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static deleteStatusAttribute(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.statusAttributesId(id)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static deleteTaskAttribute(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.taskAttributesId(id)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getEmbedCards(urls:string[], callback:ApiClientCallback<EmbedCardItem[]>){
        const url = Constants.apiRoute.embedlyApiEndpoint + "?" + this.getQueryString({urls})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static search2( limit:number, offset:number, params:SearchArguments, callback:ApiClientCallback<ElasticResult<any>>){
        let url = Constants.apiRoute.searchUrl + "?" + this.getQueryString({limit, offset})
        AjaxRequest.postJSON(url, params, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static statusComments(parent:number, position:number, children:number, includeParent:boolean, callback:ApiStatusCommentsCallback<Status>)
    {
        const inclParent = includeParent ? true : undefined
        let url = Constants.apiRoute.postCommentsUrl(parent) + "?" + this.getQueryString({children, indices:position, parent:inclParent })
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static statusSingle(id:number, callback:ApiStatusCommentsCallback<Status>)
    {
        let url = Constants.apiRoute.statusSingle(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static newsfeedV2(limit:number,offset:number,context_natural_key:ContextNaturalKey, context_object_id:number, parent:number, children:number,attribute:ObjectAttributeType, include_sub_context:boolean = true, after:number, callback:ApiClientFeedPageCallback<Status>)
    {
        let url = Constants.apiRoute.postUrl + "?" + this.getQueryString({limit,offset,context_natural_key	,context_object_id, parent, children, attribute, include_sub_context, after })
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static newsfeed(limit:number,offset:number, parent:number|null, children:number|null, callback:ApiClientFeedPageCallback<Status>)
    {
        let url = Constants.apiRoute.postUrl + "?" + this.getQueryString({limit,offset,parent,children})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getNotifications(callback:ApiClientCallback<UnhandledNotifications>)
    {
        let url = Constants.apiRoute.notificationsUnhandledUrl
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })

    }
    static getRecentActivity(limit:number, offset:number, callback:ApiClientFeedPageCallback<RecentActivity>)
    {
        let url = Constants.apiRoute.recentActivityUrl + "?" + this.getQueryString({limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })

    }
    static readActivity(id:number, callback: (success, response) => void)
    {
        let url = Constants.apiRoute.recentActivityMarkReadUrl
        AjaxRequest.post(url, {serialization_ids:[id]}, (data, status, request) => {
            callback(true, data)
        }, (request, status, error) => {
            callback(false, error)
        })
    }
    static readAllActivities(callback: ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.recentActivityMarkAllReadUrl
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static readNotificationActions(callback: ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.notificationsMarkActionsReadUrl
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static createStatus(status:Status, callback:ApiClientCallback<Status>)
    {
        let url = Constants.apiRoute.postUrl
        AjaxRequest.post(url,status, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static deleteStatus(statusId:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.postUrl + statusId + "/"
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    
    static archiveConversation(conversationId:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.archiveConversation(conversationId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static deleteConversation(conversationId:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.conversation(conversationId)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static updateConversation(id:number, conversation:Partial<Conversation>, callback:ApiClientCallback<Conversation>)
    {
        let url = Constants.apiRoute.conversation(id)
        AjaxRequest.patch(url, conversation, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static addConversationUsers(conversation:number, users:number[], callback:ApiClientCallback<Conversation>)
    {
        let url = Constants.apiRoute.addConversationUsers(conversation)
        AjaxRequest.post(url, {users}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static removeConversationUsers(conversation:number, users:number[], callback:ApiClientCallback<Conversation>)
    {
        let url = Constants.apiRoute.removeConversationUsers(conversation)
        AjaxRequest.post(url, {remove:users}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static leaveConversation(id:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.leaveConversation(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static updateTask(id:number, task:Partial<Task>, callback:ApiClientCallback<Task>)
    {
        let url = Constants.apiRoute.taskIdUrl(id)
        AjaxRequest.patch(url, task, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static updateStatus(status:Partial<Status>, callback:ApiClientCallback<Status>)
    {
        let url = Constants.apiRoute.postUrl + status.id + "/"
        AjaxRequest.patchJSON(url, status, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getStatus(id:number|string, callback:ApiClientCallback<Status>)
    {
        let url = Constants.apiRoute.postUpdateUrl(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getCommunity(communityId:string|number, callback:ApiClientCallback<Community>)
    {
        let url = Constants.apiRoute.communityUrl(communityId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static setMainCommunity(communityId:string|number, callback:ApiClientCallback<Community>)
    {
        let url = Constants.apiRoute.setMainCommunityUrl(communityId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getFiles(context_natural_key:ContextNaturalKey, context_object_id:number, limit:number, offset:number, callback:ApiClientFeedPageCallback<UploadedFile>){
        let url = Constants.apiRoute.fileUploadUrl + "?" + this.getQueryString({context_natural_key,context_object_id, limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getCommunityFiles(communityId:string|number, limit:number, offset:number, callback:ApiClientFeedPageCallback<UploadedFile>)
    {
        let url = Constants.apiRoute.communityFilesUrl(communityId) + "?" + this.getQueryString({limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getProject(projectId:string|number, callback:ApiClientCallback<Project>)
    {
        let url = Constants.apiRoute.projectDetailUrl(projectId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
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
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getTask(taskId:number, callback:ApiClientCallback<Task>)
    {
        let url = Constants.apiRoute.taskDetailUrl(taskId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getEvent(eventId:string|number, callback:ApiClientCallback<Event>)
    {
        let url = Constants.apiRoute.eventDetailUrl(eventId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getProfilesByIds(profiles:number[], callback:ApiClientFeedPageCallback<UserProfile>)
    {
        let url = Constants.apiRoute.profilesUrl + "?" + this.getQueryString({limit:profiles.length, id:profiles.join(",")})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getProfiles(limit:number, offset:number, callback:ApiClientFeedPageCallback<UserProfile>)
    {
        let url = Constants.apiRoute.profilesUrl + "?" + this.getQueryString({limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static reactToStatus(statusId:number,reaction:string, callback:ApiClientCallback<any>)
    {
        AjaxRequest.post(Constants.apiRoute.postReaction(statusId), {reaction}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
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
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getProfile(id:string|number, callback:ApiClientCallback<UserProfile>)
    {
        AjaxRequest.get(Constants.apiRoute.profileUrl(id), (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getProfilesBySlug(slug:string, callback:ApiClientFeedPageCallback<UserProfile>)
    {
        const url = Constants.apiRoute.profilesUrl + "?" + this.getQueryString({slug_name:encodeURIComponent( slug )})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getMyProfile(callback:ApiClientCallback<UserProfile>)
    {
        AjaxRequest.get(Constants.apiRoute.myProfileUrl, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getGDPRForm(preferredLanguage:string, callback:ApiClientCallback<GDPRInfo>)
    {
        let url = Constants.apiRoute.gdprForm + "?" + this.getQueryString({preferred_language:preferredLanguage})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static apiLogin(email:string, password:string, update_gdpr_continuation_key:string, gdpr_user_response:GDPRFormAnswers,callback:ApiClientCallback<{token:string}>)
    {
        const data = this.getQueryString({username:email,password,update_gdpr_continuation_key, gdpr_user_response:gdpr_user_response && JSON.stringify(gdpr_user_response)})
        AjaxRequest.post(Constants.apiRoute.login,data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static apiSocialLogin(provider:string, accessToken:string, code:string, id_token:string, update_gdpr_continuation_key:string, gdpr_user_response:GDPRFormAnswers, callback:ApiClientCallback<{token:string}>)
    {
        const data = this.getQueryString({provider,access_token:accessToken,code,id_token, update_gdpr_continuation_key, gdpr_user_response:gdpr_user_response && JSON.stringify(gdpr_user_response)})
        AjaxRequest.post(Constants.apiRoute.socialLogin, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static nativeLogin(email:string, password:string, update_gdpr_continuation_key:string, gdpr_user_response:GDPRFormAnswers, callback:ApiClientCallback<{token:string}>)
    {
        const data = this.getQueryString({username:email,password,update_gdpr_continuation_key, gdpr_user_response:gdpr_user_response && JSON.stringify(gdpr_user_response)})
        AjaxRequest.post(Constants.apiRoute.nativeLogin, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getCommunities(is_member:boolean, ordering:ListOrdering, limit:number, offset:number,callback:ApiClientFeedPageCallback<Community>)
    {
        let url = Constants.apiRoute.communityList + "?" + this.getQueryString({is_member:(is_member ? "True":"False"), limit, offset, ordering})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getGroups(community:number, parent:number, limit:number, offset:number, ordering:GroupSorting, callback:ApiClientFeedPageCallback<Group>)
    {
        const subgroups = parent ? true : false
        let url = Constants.apiRoute.groupsUrl + "?" + this.getQueryString({community, parent, subgroups, limit, offset, ordering})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }

    static getGroup(groupId:string, callback:ApiClientCallback<Group>)
    {
        let url = Constants.apiRoute.groupUrl(groupId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getTimesheets(community:number, user:number, project:number, task:number, limit:number, offset:number,callback:ApiClientFeedPageCallback<Timesheet>)
    {
        let url = Constants.apiRoute.timeSheetUrl + "?" + this.getQueryString({community, user, project, task, limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getEvents(community:number, parent:number, group:number, limit:number, offset:number, ordering:string, upcoming:boolean, callback:ApiClientFeedPageCallback<Event>)
    {
        let start_date = upcoming ? "&start_after=" : "&start_before="
        let sessions = parent ? true : false
        let url = Constants.apiRoute.eventsUrl + "?" + this.getQueryString({community, limit, offset, ordering, parent, sessions, group}) + start_date + moment().format("YYYY-MM-DD")
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getProjects(community:number, group:number, limit:number, offset:number, ordering:ProjectSorting, responsible:boolean, assigned:boolean, callback:ApiClientFeedPageCallback<Project>)
    {
        let url = Constants.apiRoute.projectsUrl + "?" + this.getQueryString({community, group, limit, offset, ordering, responsible, assigned})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getConversations(limit:number, offset:number, archived:boolean, withUsers:number[], callback:ApiClientFeedPageCallback<Conversation>)
    {
        let url = Constants.apiRoute.conversations + "?" + this.getQueryString({limit, offset, archived, with_users:withUsers && withUsers.join(",")})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getConversation(id:number,callback:ApiClientCallback<Conversation>)
    {
        let url = Constants.apiRoute.conversation(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
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
    static getFavorites(callback:ApiClientFeedPageCallback<Favorite>)
    {
        let url = Constants.apiRoute.favoritesUrl + "?" + this.getQueryString({limit:100})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static createFavorite(object_natural_key:ContextNaturalKey, object_id:number, index:number, callback:ApiClientCallback<Favorite>)
    {
        let url = Constants.apiRoute.favoritesUrl
        const data:Partial<Favorite> = {}
        data.object_natural_key = object_natural_key
        data.object_id = object_id
        if(index)
            data.index = index
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static updateFavorite(id:number, object_natural_key:ContextNaturalKey, object_id:number, index:number, callback:ApiClientCallback<Favorite>)
    {
        let url = Constants.apiRoute.updateFavoriteUrl(id)
        AjaxRequest.patchJSON(url, {object_natural_key, object_id, index}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static deleteFavorite(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.updateFavoriteUrl(id)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    private static sendMessage(message:Message, callback:ApiClientCallback<Message>){
        var data = { conversation: message.conversation, text: message.text, uid: message.uid, mentions:message.mentions, files:(message.files || []).map(f => f.id) }
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
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static updateFilename(fileId:number,filename:string, callback:ApiClientCallback<UploadedFile>)
    {
        AjaxRequest.post(Constants.apiRoute.fileUploadUpdateName(fileId), {filename}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    private static uploadFile(message:Message, completion:(message:Message) => void){
        let file = message.tempFile.file
        let uploader = new FileUploader(file, (progress) => {
            let m = Object.assign({}, message)
            m.tempFile = Object.assign({}, m.tempFile)
            m.tempFile.progress = progress
            ConversationManager.updateQueuedMessage(m)
        })
        uploader.doUpload((file:UploadedFile) => {
            let m = Object.assign({}, message)
            if(file)
            {
                m.tempFile = null
                if(m.files)
                {
                    m.files.push(file)
                }
                else
                {
                    m.files = [file]
                }
            }
            else
            {
                m.tempFile = Object.assign({}, m.tempFile)
                m.tempFile.progress = 0
                m.tempFile.error = "error"
            }
            ConversationManager.updateQueuedMessage(m)
            completion(m)
        })
    }
    static getConversationMessages(conversation:number, limit:number, offset:number,callback:ApiClientFeedPageCallback<Message>)
    {
        let url = Constants.apiRoute.conversationMessagesUrl +  "?" + this.getQueryString({limit, offset, conversation})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static markConversationAsRead(conversationId:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.conversationMarkAsReadUrl(conversationId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static markTaskAsRead(id:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.taskMarkAsReadUrl(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getPage<T>(endpoint:string, limit:number, offset:number,callback:ApiClientFeedPageCallback<T>)
    {
        let url = endpoint + "?" + this.getQueryString({ limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static friendInvitationGetId = (userId:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.friendInvitation + `?user_id=${userId}`
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static friendInvitationSend = (userId:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.friendInvitation
        AjaxRequest.post(url, {to_user: userId }, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static friendInvitationAccept = (invitation:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.friendInvitationAccept(invitation)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static friendInvitationDelete(invitation:number, block:boolean, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.friendInvitationDelete(invitation) + "?" + this.getQueryString({block})
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static userBlockGetId = (userId:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.blockUrl + `?user_id=${userId}`
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static userBlock(userId:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.blockUrl
        const data = { to_user: userId }
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static userUnBlock(blocking:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.blockDelete(blocking)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static groupInvitationAccept = (invitation:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.groupInvitationAcceptUrl(invitation)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static groupInvitationDelete(invitation:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.groupInvitationDeleteUrl(invitation)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static groupMembershipRequestAccept = (id:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.groupMembershipRequestAcceptUrl(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static groupMembershipRequestDelete(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.groupMembershipRequestDeleteUrl(id)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static communityInvitationAccept = (invitation:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.communityInvitationAcceptUrl(invitation)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static communityInvitationDelete(invitation:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.communityInvitationDeleteUrl(invitation)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static communityMembershipRequestAccept = (id:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.communityMembershipRequestAcceptUrl(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static communityMembershipRequestDelete(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.communityMembershipRequestDeleteUrl(id)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static eventInvitationGoing = (invitation:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.eventInvitationGoingUrl(invitation)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static eventInvitationNotGoing = (invitation:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.eventInvitationNotGoingUrl(invitation)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static eventInvitationDelete(invitation:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.eventInvitationDeleteUrl(invitation)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static eventMembershipRequestAccept = (id:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.eventMembershipRequestAcceptUrl(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static eventMembershipRequestDelete(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.eventMembershipRequestDeleteUrl(id)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getUnreadNotifications(callback:ApiClientCallback<UnreadNotificationCounts>){
        let url = Constants.apiRoute.notificationUnreadUrl
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getLanguages(limit:number, offset:number, user:number, callback:ApiClientFeedPageCallback<ProfileLanguage>){
        let url = Constants.apiRoute.languageUrl + "?" + this.getQueryString({limit, offset, user})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getCertifications(limit:number, offset:number, user:number, callback:ApiClientFeedPageCallback<ProfileCertification>){
        let url = Constants.apiRoute.certificationUrl + "?" + this.getQueryString({limit, offset, user})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getEducations(limit:number, offset:number, user:number, callback:ApiClientFeedPageCallback<ProfileEducation>){
        let url = Constants.apiRoute.educationUrl + "?" + this.getQueryString({limit, offset, user})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getPositions(limit:number, offset:number, user:number, callback:ApiClientFeedPageCallback<ProfilePosition>){
        let url = Constants.apiRoute.positionUrl + "?" + this.getQueryString({limit, offset, user})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getVolunteering(limit:number, offset:number, user:number, callback:ApiClientFeedPageCallback<ProfileVolunteeringExperience>){
        let url = Constants.apiRoute.volunteeringUrl + "?" + this.getQueryString({limit, offset, user})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static sendCrashReport(level:CrashLogLevel, message:string, stack:string, componentStack:string, user_id:number, user_agent:string, endpoint:string, extra:string, callback:ApiClientCallback<any>){
        const url = Constants.apiRoute.createCrashReportUrl
        AjaxRequest.postJSON(url,  { level, message, stack, componentStack, user_id, user_agent, endpoint, extra}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }
    static getCalendarItems(start:Date, end:Date, callback:ApiClientCallback<(CalendarItem | Event | Task)[]>){
        const startString = moment(start).format(DateFormat.serverDay)
        const endString = moment(end).format(DateFormat.serverDay)
        let url = Constants.apiRoute.calendarUrl + "?" + this.getQueryString({start:startString, end:endString})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error, new RequestErrorData(request.responseJSON))
        })
    }

}
export class FileUploader
{
    file:Blob
    progress:(percent:number) => void
    request:any = null
    constructor(file:Blob, progress:(percent:number) => void)
    {
        this.file = file
        this.progress = progress
        this.doUpload = this.doUpload.bind(this)
        this.progressHandling = this.progressHandling.bind(this)
    }
    doUpload = (completion:(file:UploadedFile, error?:any) => void) => {
        let url = EndpointManager.applyEndpointDomain(Constants.apiRoute.fileUploadUrl)
        const data = new FormData();
        data.append("file", this.file)
        //data.append("error", "true")
        this.request = $.ajax({
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
                completion(null, error)
            },
            async: true,
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            timeout: 60000
        })
    }
    abort = () => {
        if(this.request && this.request.abort)
            this.request.abort()
    }
    progressHandling = (event) => {
        var percent = 0;
        var position = event.loaded || event.position;
        var total = event.total;
        if (event.lengthComputable) {
            percent = Math.ceil(position / total * 100);
        }
        this.progress(percent)
    }
}
