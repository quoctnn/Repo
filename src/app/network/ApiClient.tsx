import Constants from "../utilities/Constants";
import { AjaxRequest, ErrorCallback, SuccessCallback } from './AjaxRequest';
import { EndpointManager } from '../managers/EndpointManager';

import { nullOrUndefined, DateFormat } from '../utilities/Utilities';
import moment = require("moment");
import { Settings } from "../utilities/Settings";
import { ConversationManager } from '../managers/ConversationManager';
import { CommunityConfigurationData, CommunityInvitation, AppLanguage, ContextInvitation, ContextSegmentKey, FriendRequest, CommunityRole, CommunityRoleCreatePermission, Event } from '../types/intrasocial_types';
const $ = require("jquery")
import { Status, UserProfile, UploadedFile, Community, Group, Conversation, Project, Message, Task,
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
    GDPRFormAnswers,
    UploadedFileResponse, ProfileLanguage, ProfileVolunteeringExperience, RequestErrorData, CropInfo, CropRect, ContextPhotoType} from '../types/intrasocial_types';
import { translate } from "../localization/AutoIntlProvider";
export type PaginationResult<T> = {results:T[], count:number, previous?:string, next?:string, divider?:number}
export type ElasticSuggestion = {text:string, offset:number, length:number, options:[]}
export type ElasticExtensionResult = {stats:{suggestions:{[key:string]:ElasticSuggestion}, aggregations:{[key:string]:any}}}
export type StatusCommentsResult<T> = {results:T[], count:number, parent:T}
export type ElasticResult<T> = PaginationResult<T> & ElasticExtensionResult
export type ApiClientFeedPageCallback<T> = (data: PaginationResult<T>, status:string, errorData?:RequestErrorData) => void;
export type ApiClientCallback<T> = (data: T|null, status:string, errorData?:RequestErrorData) => void;
export enum SearchSortOptions {
    relevance = "relevance",
    dateAscending = "created_at",
    dateDescending = "-created_at"
}
export namespace SearchSortOptions {
    export const all = [
        SearchSortOptions.relevance,
        SearchSortOptions.dateAscending,
        SearchSortOptions.dateDescending,
    ]
    export function translationForKey(key: SearchSortOptions) {
        return translate(`search.sort.${key}`)
    }
}
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
    sorting?:SearchSortOptions
    from_date?:string
    to_date?:string
    limit:number
    offset:number
}
export type MapBoxFeature = {
    center:[number, number]
    place_name:string
    type:string
    bbox:[number, number, number, number]
    place_type:string[]
    properties:{[key:string]:any}
    text:string
    id:string
}
export enum ListOrdering {
    ALPHABETICALLY = "alphabetically",
    RECENT = "recent",
    MOST_USED = "most_used",
    RECENT_ACTIVIY = "recent_activity"
}
export abstract class ApiClient
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
    static forwardGeocode(address:string, callback:ApiClientCallback<MapBoxFeature[]>){
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?types=address&access_token=${Settings.mapboxAccessToken}`
        AjaxRequest.get(url, (data:{features:MapBoxFeature[]}, status, request) => {
            callback(data && data.features || [], status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static reverseGeocode(location:Coordinate, callback:ApiClientCallback<MapBoxFeature[]>){
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location.long + "," + location.lat)}.json?types=address&access_token=${Settings.mapboxAccessToken}`
        AjaxRequest.get(url, (data:{features:MapBoxFeature[]}, status, request) => {
            callback(data && data.features || [], status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static placeAutocomple(query:string, callback:ApiClientCallback<MapBoxFeature[]>){
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${Settings.mapboxAccessToken}&autocomplete=true`
        AjaxRequest.get(url, (data:{features:MapBoxFeature[]}, status, request) => {
            callback(data && data.features || [], status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getBackendVersionInfo(callback:ApiClientCallback<VersionInfo>){
        const url = Constants.apiRoute.versionUrl
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static createTimesheet(task:number, description:string, date:moment.Moment,  hours:number, minutes:number, callback:ApiClientCallback<Timesheet>){
        const url = Constants.apiRoute.timeSheetUrl
        AjaxRequest.postJSON(url,  { task, date:date.format("YYYY-MM-DD"), description, hours, minutes}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getDashboards(callback:ApiClientFeedPageCallback<Dashboard>){
        const url = Constants.apiRoute.dashboardListEndpoint + "?" + ApiClient.getQueryString({})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static reportObject(type:string, contextId:number, tags:string[], description:string , callback:ApiClientCallback<ReportResult>){

        const endpoint = Constants.apiRoute.reportUrl(type,contextId)
        AjaxRequest.postJSON(endpoint,  { description, tags}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
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
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getSearchHistory(callback:ApiClientFeedPageCallback<SearchHistory>){
        const url = Constants.apiRoute.getSearchHistoryUrl
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static deleteSearchHistory(id:number, callback:ApiClientCallback<any>){
        const url = Constants.apiRoute.removeSearchHistoryUrl(id)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static createSearchHistory(term:string, callback:ApiClientFeedPageCallback<SearchHistory>){
        const url = Constants.apiRoute.createSearchHistoryUrl
        AjaxRequest.postJSON(url, {term}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static createStatusAttribute(status:number, attribute:ObjectAttributeType, user:number, callback:ApiClientCallback<StatusObjectAttribute>){
        const endpoint = Constants.apiRoute.statusAttributes
        AjaxRequest.postJSON(endpoint, {status, attribute, user}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static setStatusesRead(ids:number[], callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.statusMarkRead
        AjaxRequest.postJSON(url, {ids}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static setMessagesRead(ids:number[], callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.messageMarkRead
        AjaxRequest.postJSON(url, {ids}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static deleteStatusAttribute(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.statusAttributesId(id)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static deleteTaskAttribute(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.taskAttributesId(id)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getEmbedCards(urls:string[], callback:ApiClientCallback<EmbedCardItem[]>){
        const url = Constants.apiRoute.embedlyApiEndpoint + "?" + ApiClient.getQueryString({urls})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static search(args:SearchArguments, callback:ApiClientCallback<ElasticResult<any>>){
        const params = {...args}
        if(params.sorting && params.sorting == SearchSortOptions.relevance)
            delete params.sorting
        let url = Constants.apiRoute.searchUrl
        AjaxRequest.postJSON(url, params, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static statusComments(parent:number, position:number, children:number, includeParent:boolean, callback:ApiClientCallback<StatusCommentsResult<Status>>)
    {
        const inclParent = includeParent ? true : undefined
        let url = Constants.apiRoute.postCommentsUrl(parent) + "?" + ApiClient.getQueryString({children, indices:position, parent:inclParent })
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static statusSingle(id:number, callback:ApiClientCallback<StatusCommentsResult<Status>>)
    {
        let url = Constants.apiRoute.statusSingle(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static newsfeedV2(limit:number,offset:number,context_natural_key:ContextNaturalKey, context_object_id:number, parent:number, children:number,attribute:ObjectAttributeType, include_sub_context:boolean = true, after:number, callback:ApiClientFeedPageCallback<Status>)
    {
        let url = Constants.apiRoute.postUrl + "?" + ApiClient.getQueryString({limit,offset,context_natural_key	,context_object_id, parent, children, attribute, include_sub_context, after })
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static newsfeed(limit:number,offset:number, parent:number|null, children:number|null, callback:ApiClientFeedPageCallback<Status>)
    {
        let url = Constants.apiRoute.postUrl + "?" + ApiClient.getQueryString({limit,offset,parent,children})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getNotifications(callback:ApiClientCallback<UnhandledNotifications>)
    {
        let url = Constants.apiRoute.notificationsUnhandledUrl
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })

    }
    static getRecentActivity(limit:number, offset:number, onlyUnseen, callback:ApiClientFeedPageCallback<RecentActivity>)
    {
        let url = Constants.apiRoute.recentActivityUrl + "?" + ApiClient.getQueryString({limit, offset})
        if (onlyUnseen) {
            url += '&only_unseen=true'
        }
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })

    }
    static markActivitiesAsSeen(ids:number[], callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.notificationMarkSeenUrl
        AjaxRequest.post(url, {serialization_ids:ids}, (data, status, request) => {
            callback(true, data)
        }, (request, status, error) => {
            callback(false, error)
        })
    }
    static markActivitiesAsRead(ids:number[], callback: (success, response) => void)
    {
        let url = Constants.apiRoute.notificationMarkReadUrl
        AjaxRequest.post(url, {serialization_ids:ids}, (data, status, request) => {
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
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static readNotificationActions(callback: ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.notificationsMarkActionsReadUrl
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static createStatus(status:Status, callback:ApiClientCallback<Status>)
    {
        let url = Constants.apiRoute.postUrl
        AjaxRequest.post(url,status, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static deleteStatus(statusId:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.postUrl + statusId + "/"
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }

    static archiveConversation(conversationId:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.archiveConversation(conversationId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static deleteConversation(conversationId:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.conversation(conversationId)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static updateConversation(id:number, conversation:Partial<Conversation>, callback:ApiClientCallback<Conversation>)
    {
        let url = Constants.apiRoute.conversation(id)
        AjaxRequest.patch(url, conversation, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static addConversationUsers(conversation:number, users:number[], callback:ApiClientCallback<Conversation>)
    {
        let url = Constants.apiRoute.addConversationUsers(conversation)
        AjaxRequest.post(url, {users}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static removeConversationUsers(conversation:number, users:number[], callback:ApiClientCallback<Conversation>)
    {
        let url = Constants.apiRoute.removeConversationUsers(conversation)
        AjaxRequest.post(url, {remove:users}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static leaveConversation(id:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.leaveConversation(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static updateTask(id:number, task:Partial<Task>, callback:ApiClientCallback<Task>)
    {
        let url = Constants.apiRoute.taskIdUrl(id)
        AjaxRequest.patch(url, task, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static updateStatus(status:Partial<Status>, callback:ApiClientCallback<Status>)
    {
        let url = Constants.apiRoute.postUrl + status.id + "/"
        AjaxRequest.patchJSON(url, status, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getStatus(id:number|string, callback:ApiClientCallback<Status>)
    {
        let url = Constants.apiRoute.postUpdateUrl(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getCommunity(communityId:string|number, callback:ApiClientCallback<Community>)
    {
        let url = Constants.apiRoute.communityUrl(communityId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getCommunityAvatar(communityId:number, callback:ApiClientCallback<CropInfo>)
    {
        let url = Constants.apiRoute.communityAvatarUrl(communityId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static updateCommunityAdmin(communityId:number, add:number[], remove:number[], callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.communityAdminUrl(communityId)
        const data = {add, remove}
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static setContextPhoto(type:ContextPhotoType, contextNaturalKey:ContextNaturalKey, contextObjectId:number, file:File|string, crop:CropRect, callback:ApiClientCallback<CropInfo>)
    {
        const url = this.getContextPhotoUrl(type, contextNaturalKey, contextObjectId)
        if(!url)
        {
            callback(null, "500", new RequestErrorData({detail:`api endpoint not set for ${contextNaturalKey} and type ${type}`}, "error"))
            return
        }
        if(file instanceof File)
        {
            // do upload
            const formData = new FormData()
            formData.append("image", file)
            formData.append("top_left", crop.top_left[0].toString())
            formData.append("top_left", crop.top_left[1].toString())
            formData.append("bottom_right", crop.bottom_right[0].toString())
            formData.append("bottom_right", crop.bottom_right[1].toString())
            const uploader = new FileUploader<CropInfo>(formData, url,  () => {})
            uploader.doUpload((data, status, error) => {
                if(error)
                    error.renameErrorField("image", type.toString())
                callback(data, status, error)
            })
        }
        else
        {
            AjaxRequest.postJSON(url, crop, (data, status, request) => {
                callback(data, status, null)
            }, (request, status, error) => {
                const e = new RequestErrorData(request.responseJSON, error)
                if(e)
                    e.renameErrorField("image", type.toString())
                callback(null, status, e)
            })
        }
    }
    private static getContextPhotoUrl = (type:ContextPhotoType, contextNaturalKey:ContextNaturalKey, contextObjectId:number) => {
        let url:string = null
        switch (contextNaturalKey + type) {
            case ContextNaturalKey.COMMUNITY + ContextPhotoType.avatar:url = Constants.apiRoute.communityAvatarUrl(contextObjectId); break;
            case ContextNaturalKey.COMMUNITY + ContextPhotoType.cover:url = Constants.apiRoute.communityCoverUrl(contextObjectId); break;
            case ContextNaturalKey.EVENT + ContextPhotoType.avatar:url = Constants.apiRoute.eventAvatarUrl(contextObjectId); break;
            case ContextNaturalKey.EVENT + ContextPhotoType.cover:url = Constants.apiRoute.eventCoverUrl(contextObjectId); break;
            case ContextNaturalKey.GROUP + ContextPhotoType.avatar:url = Constants.apiRoute.groupAvatarUrl(contextObjectId); break;
            case ContextNaturalKey.GROUP + ContextPhotoType.cover:url = Constants.apiRoute.groupCoverUrl(contextObjectId); break;
            case ContextNaturalKey.USER + ContextPhotoType.avatar:url = Constants.apiRoute.profileAvatarUrl(contextObjectId); break;
            case ContextNaturalKey.USER + ContextPhotoType.cover:url = Constants.apiRoute.profileCoverUrl(contextObjectId); break;
            case ContextNaturalKey.PROJECT + ContextPhotoType.avatar:url = Constants.apiRoute.projectAvatarUrl(contextObjectId); break;
            case ContextNaturalKey.PROJECT + ContextPhotoType.cover:url = Constants.apiRoute.projectCoverUrl(contextObjectId); break;
            default:break;
        }
        return url
    }
    static getContextPhoto(type:ContextPhotoType, contextNaturalKey:ContextNaturalKey, contextObjectId:number, callback:ApiClientCallback<CropInfo>)
    {
        const url = this.getContextPhotoUrl(type, contextNaturalKey, contextObjectId)
        if(!url)
        {
            callback(null, "500", new RequestErrorData({detail:`api endpoint not set for ${contextNaturalKey} and type ${type}`}, "error"))
            return
        }
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    private static getContextLeaveData = (contextNaturalKey:ContextNaturalKey, contextObjectId:number) => {
        let url:string = null
        switch (contextNaturalKey ) {
            case ContextNaturalKey.COMMUNITY:url = Constants.apiRoute.communityLeaveUrl(contextObjectId); break;
            case ContextNaturalKey.EVENT:url = Constants.apiRoute.eventLeaveUrl(contextObjectId); break;
            case ContextNaturalKey.GROUP:url = Constants.apiRoute.groupLeaveUrl(contextObjectId); break;
            case ContextNaturalKey.PROJECT:url = Constants.apiRoute.projectMembershipUrl(contextObjectId); break;
            default:break;
        }
        return url
    }
    private static getContextDeleteDataUrl = (contextNaturalKey:ContextNaturalKey, contextObjectId:number) => {
        let url:string = null
        switch (contextNaturalKey ) {
            case ContextNaturalKey.COMMUNITY:url = Constants.apiRoute.communityDeleteUrl(contextObjectId); break;
            case ContextNaturalKey.EVENT:url = Constants.apiRoute.eventDeleteUrl(contextObjectId); break;
            case ContextNaturalKey.GROUP:url = Constants.apiRoute.groupDeleteUrl(contextObjectId); break;
            case ContextNaturalKey.PROJECT:url = Constants.apiRoute.projectDeleteUrl(contextObjectId); break;
            default:break;
        }
        return url
    }
    static leaveContext = (contextNaturalKey:ContextNaturalKey, contextObjectId:number, callback:ApiClientCallback<any>) => {
        const url = ApiClient.getContextLeaveData(contextNaturalKey, contextObjectId)
        if(!url)
        {
            callback(null, "500", new RequestErrorData({detail:`leave api endpoint not set for ${contextNaturalKey}`}, "error"))
            return
        }
        AjaxRequest.get(url,(data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static deleteContext = (contextNaturalKey:ContextNaturalKey, contextObjectId:number, callback:ApiClientCallback<any>) => {
        const url = ApiClient.getContextDeleteDataUrl(contextNaturalKey, contextObjectId)
        if(!url)
        {
            callback(null, "500", new RequestErrorData({detail:`delete api endpoint not set for ${contextNaturalKey}`}, "error"))
            return
        }
        AjaxRequest.delete(url,(data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    private static getContextMuteUrl = (contextNaturalKey:ContextNaturalKey, contextObjectId:number) => {
        let url:string = null
        switch (contextNaturalKey ) {
            case ContextNaturalKey.COMMUNITY:url = Constants.apiRoute.communityMuteUrl(contextObjectId); break;
            case ContextNaturalKey.EVENT:url = Constants.apiRoute.eventMuteUrl(contextObjectId); break;
            case ContextNaturalKey.GROUP:url = Constants.apiRoute.groupMuteUrl(contextObjectId); break;
            case ContextNaturalKey.PROJECT:url = Constants.apiRoute.projectMuteUrl(contextObjectId); break;
            default:break;
        }
        return url
    }
    static muteContext = (muted:boolean, contextNaturalKey:ContextNaturalKey, contextObjectId:number, callback:ApiClientCallback<any>) => {
        const url = ApiClient.getContextMuteUrl(contextNaturalKey, contextObjectId)
        if(!url)
        {
            callback(null, "500", new RequestErrorData({detail:`mute api endpoint not set for ${contextNaturalKey}`}, "error"))
            return
        }
        AjaxRequest.post(url, {muted},(data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    private static getContextMembersKickUrl = (contextNaturalKey:ContextNaturalKey, contextObjectId:number) => {
        let url:string = null
        switch (contextNaturalKey ) {
            case ContextNaturalKey.COMMUNITY:url = Constants.apiRoute.communityMembersKickUrl(contextObjectId); break;
            case ContextNaturalKey.EVENT:url = Constants.apiRoute.eventMembersKickUrl(contextObjectId); break;
            case ContextNaturalKey.GROUP:url = Constants.apiRoute.groupMembersKickUrl(contextObjectId); break;
            case ContextNaturalKey.PROJECT:url = Constants.apiRoute.projectMembersKickUrl(contextObjectId); break;
            default:break;
        }
        return url
    }
    static kickContextMembers = (ids:number[], contextNaturalKey:ContextNaturalKey, contextObjectId:number, callback:ApiClientCallback<any>) => {
        let url = ApiClient.getContextMembersKickUrl(contextNaturalKey, contextObjectId)
        if(!url)
        {
            callback(null, "500", new RequestErrorData({detail:`kick members api endpoint not set for ${contextNaturalKey}`}, "error"))
            return
        }
        const data = {remove:ids}
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    private static getContextRolesUrl = (contextNaturalKey:ContextNaturalKey, contextObjectId:number) => {
        let url:string = null
        switch (contextNaturalKey ) {
            case ContextNaturalKey.GROUP:url = Constants.apiRoute.groupRolesUrl(contextObjectId); break;
            case ContextNaturalKey.PROJECT:url = Constants.apiRoute.projectRolesUrl(contextObjectId); break;
            default:break;
        }
        return url
    }
    static updateContextRoles(contextNaturalKey:ContextNaturalKey, contextObjectId:number, add:number[], remove:number[], callback:ApiClientCallback<any>)
    {
        let url = ApiClient.getContextRolesUrl(contextNaturalKey, contextObjectId)
        if(!url)
        {
            callback(null, "500", new RequestErrorData({detail:`roles api endpoint not set for ${contextNaturalKey}`}, "error"))
            return
        }
        const data = {add, remove}
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }

    private static getContextModeratorUrl = (contextNaturalKey:ContextNaturalKey, contextObjectId:number) => {
        let url:string = null
        switch (contextNaturalKey ) {
            case ContextNaturalKey.GROUP:url = Constants.apiRoute.groupModerateUrl(contextObjectId); break;
            case ContextNaturalKey.PROJECT:url = Constants.apiRoute.projectModerateUrl(contextObjectId); break;
            case ContextNaturalKey.EVENT:url = Constants.apiRoute.eventModerateUrl(contextObjectId); break;
            default:break;
        }
        return url
    }
    static updateContextModerators(contextNaturalKey:ContextNaturalKey, contextObjectId:number, add:number[], remove:number[], callback:ApiClientCallback<any>)
    {
        let url = ApiClient.getContextModeratorUrl(contextNaturalKey, contextObjectId)
        if(!url)
        {
            callback(null, "500", new RequestErrorData({detail:`moderate api endpoint not set for ${contextNaturalKey}`}, "error"))
            return
        }
        const data = {add, remove}
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static updateContextManagers(contextNaturalKey:ContextNaturalKey, contextObjectId:number, add:number[], remove:number[], callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.projectManagerUrl(contextObjectId)
        const data = {add, remove}
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    private static getContextMembersUrl = (contextNaturalKey:ContextNaturalKey, contextObjectId:number) => {
        let url:string = null
        switch (contextNaturalKey ) {
            case ContextNaturalKey.COMMUNITY:url = Constants.apiRoute.communityMembersUrl(contextObjectId); break;
            case ContextNaturalKey.EVENT:url = Constants.apiRoute.eventMembersUrl(contextObjectId); break;
            case ContextNaturalKey.GROUP:url = Constants.apiRoute.groupMembersUrl(contextObjectId); break;
            case ContextNaturalKey.PROJECT:url = Constants.apiRoute.projectMembersUrl(contextObjectId); break;
            default:break;
        }
        return url
    }
    static getContextMembers(contextNaturalKey:ContextNaturalKey, contextObjectId:number, limit:number, offset:number, search:string, callback:ApiClientFeedPageCallback<UserProfile>)
    {
        let url = this.getContextMembersUrl(contextNaturalKey, contextObjectId)
        if(!url)
        {
            callback(null, "500", new RequestErrorData({detail:`members api endpoint not set for ${contextNaturalKey}`}, "error"))
            return
        }
        url += "?" + ApiClient.getQueryString({ limit, offset, search })
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static updateCommunity(communityId:string|number, data:Partial<Community>, callback:ApiClientCallback<Community>)
    {
        let url = Constants.apiRoute.communityUrl(communityId)
        AjaxRequest.patchJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static createCommunity(data:Partial<Community>, callback:ApiClientCallback<Community>)
    {
        let url = Constants.apiRoute.communityList
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static updateCommunityConfiguration(communityId:string|number, data:Partial<Community>, callback:ApiClientCallback<CommunityConfigurationData>)
    {
        let url = Constants.apiRoute.communityConfigurationUrl(communityId)
        AjaxRequest.patchJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getCommunityConfiguration(communityId:string|number, callback:ApiClientCallback<CommunityConfigurationData>)
    {
        let url = Constants.apiRoute.communityConfigurationUrl(communityId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static setMainCommunity(communityId:string|number, callback:ApiClientCallback<Community>)
    {
        let url = Constants.apiRoute.setMainCommunityUrl(communityId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getFiles(context_natural_key:ContextNaturalKey, context_object_id:number, limit:number, offset:number, callback:ApiClientFeedPageCallback<UploadedFile>){
        let url = Constants.apiRoute.fileUploadUrl + "?" + ApiClient.getQueryString({context_natural_key,context_object_id, limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getCommunityRoles(communityId:number, limit:number, offset:number, callback:ApiClientFeedPageCallback<CommunityRole>)
    {
        let url = Constants.apiRoute.communityRolesUrl + "?" + ApiClient.getQueryString({limit, offset, id:communityId})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static createCommunityRole(role:CommunityRole, callback:ApiClientCallback<CommunityRole>)
    {
        let url = Constants.apiRoute.communityRolesUrl
        AjaxRequest.postJSON(url, role, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }

    static deleteCommunityRoles = (ids:number[], callback:ApiClientCallback<{failed:{delete:number}[]}>) => {
        let url = Constants.apiRoute.communityRolesBatchUrl
        const data = ids.map(id => {return {delete:id}})
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static updateCommunityRole(role:Partial<CommunityRole>, callback:ApiClientCallback<CommunityRole>)
    {
        let url = Constants.apiRoute.communityRoleUrl(role.id)
        AjaxRequest.patchJSON(url, role, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }

    static getCommunityFiles(communityId:string|number, limit:number, offset:number, callback:ApiClientFeedPageCallback<UploadedFile>)
    {
        let url = Constants.apiRoute.communityFilesUrl(communityId) + "?" + ApiClient.getQueryString({limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getProject(projectId:string|number, callback:ApiClientCallback<Project>)
    {
        let url = Constants.apiRoute.projectDetailUrl(projectId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static updateProject(projectId:number, projectData:Partial<Project>, callback:ApiClientCallback<Project>)
    {
        AjaxRequest.patchJSON(Constants.apiRoute.projectDetailUrl(projectId), projectData, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static updateProjectMembership(projectId:number, add:number[], remove:number[], moderator:boolean, manager:boolean, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.projectMembershipUrl(projectId)
        const data = {add, remove, moderator, manager}
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static projectReviewAccept = (id:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.projectReviewUrl
        const data = {accept: [id]}
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static projectReviewDelete(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.projectReviewUrl
        const data = {decline: [id]}
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static createProject(projectData:Partial<Project>, callback:ApiClientCallback<Project>)
    {
        AjaxRequest.postJSON(Constants.apiRoute.projectsUrl, projectData, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
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
        let url = Constants.apiRoute.taskUrl + "?" + ApiClient.getQueryString({limit,
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
                                                                        term,
                                                                        parent:"null"
                                                                    })
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
        console.warn("REMOVE parent:null")
    }
    static getTask(taskId:number, callback:ApiClientCallback<Task>)
    {
        let url = Constants.apiRoute.taskDetailUrl(taskId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static createTask(data:Object, callback:ApiClientCallback<Task>) {
        let url = Constants.apiRoute.taskUrl;
        AjaxRequest.post(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getEvent(eventId:string|number, callback:ApiClientCallback<Event>)
    {
        let url = Constants.apiRoute.eventDetailUrl(eventId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static updateEvent(eventId:string|number, data:Partial<Event>, callback:ApiClientCallback<Event>)
    {
        let url = Constants.apiRoute.eventDetailUrl(eventId)
        AjaxRequest.patchJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static createEvent(data:Partial<Event>, callback:ApiClientCallback<Event>)
    {
        let url = Constants.apiRoute.eventsUrl
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getProfilesByIds(profiles:(number|string)[], callback:ApiClientFeedPageCallback<UserProfile>)
    {
        let url = Constants.apiRoute.profilesUrl + "?" + ApiClient.getQueryString({limit:profiles.length, id:profiles.join(",")})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getProfiles(limit:number, offset:number, callback:ApiClientFeedPageCallback<UserProfile>)
    {
        let url = Constants.apiRoute.profilesUrl + "?" + ApiClient.getQueryString({limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static reactToStatus(statusId:number,reaction:string, callback:ApiClientCallback<any>)
    {
        AjaxRequest.post(Constants.apiRoute.postReaction(statusId), {reaction}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
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
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getProfile(id:string|number, callback:ApiClientCallback<UserProfile>)
    {
        AjaxRequest.get(Constants.apiRoute.profileUrl(id), (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static updateProfile(profileData:Partial<UserProfile>, callback:ApiClientCallback<UserProfile>)
    {
        AjaxRequest.putJSON(Constants.apiRoute.myProfileUrl, profileData, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getProfilesBySlug(slug:string, callback:ApiClientFeedPageCallback<UserProfile>)
    {
        const url = Constants.apiRoute.profilesUrl + "?" + ApiClient.getQueryString({slug_name:encodeURIComponent( slug )})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getMyProfile(callback:ApiClientCallback<UserProfile>)
    {
        AjaxRequest.get(Constants.apiRoute.myProfileUrl, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getGDPRForm(preferredLanguage:string, callback:ApiClientCallback<GDPRInfo>)
    {
        let url = Constants.apiRoute.gdprForm + "?" + ApiClient.getQueryString({preferred_language:preferredLanguage})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static apiRegister(firstName:string, lastName:string, email:string, password:string, gdpr_user_response:GDPRFormAnswers,callback:ApiClientCallback<any>)
    {
        const data = ApiClient.getQueryString({firstName, lastName, email, password, gdpr_user_response:gdpr_user_response && JSON.stringify(gdpr_user_response)})
        AjaxRequest.post(Constants.apiRoute.register, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static apiLogin(email:string, password:string, update_gdpr_continuation_key:string, gdpr_user_response:GDPRFormAnswers,callback:ApiClientCallback<{token:string}>)
    {
        const data = ApiClient.getQueryString({username:email,password,update_gdpr_continuation_key, gdpr_user_response:gdpr_user_response && JSON.stringify(gdpr_user_response)})
        AjaxRequest.post(Constants.apiRoute.login,data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static apiSocialLogin(provider:string, accessToken:string, code:string, id_token:string, update_gdpr_continuation_key:string, gdpr_user_response:GDPRFormAnswers, callback:ApiClientCallback<{token:string}>)
    {
        const data = ApiClient.getQueryString({provider,access_token:accessToken,code,id_token, update_gdpr_continuation_key, gdpr_user_response:gdpr_user_response && JSON.stringify(gdpr_user_response)})
        AjaxRequest.post(Constants.apiRoute.socialLogin, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static nativeLogin(email:string, password:string, update_gdpr_continuation_key:string, gdpr_user_response:GDPRFormAnswers, callback:ApiClientCallback<{token:string}>)
    {
        const data = ApiClient.getQueryString({username:email,password,update_gdpr_continuation_key, gdpr_user_response:gdpr_user_response && JSON.stringify(gdpr_user_response)})
        AjaxRequest.post(Constants.apiRoute.nativeLogin, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getCommunities(is_member:boolean, ordering:ListOrdering, limit:number, offset:number,callback:ApiClientFeedPageCallback<Community>)
    {
        let url = Constants.apiRoute.communityList + "?" + ApiClient.getQueryString({is_member, limit, offset, ordering})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getGroups(community:number, parent:number, limit:number, offset:number, ordering:GroupSorting, callback:ApiClientFeedPageCallback<Group>)
    {
        const subgroups = parent ? true : false
        let url = Constants.apiRoute.groupsUrl + "?" + ApiClient.getQueryString({community, parent, subgroups, limit, offset, ordering})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }

    static getGroup(groupId:string, callback:ApiClientCallback<Group>)
    {
        let url = Constants.apiRoute.groupUrl(groupId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }

    static updateGroup(groupId:string|number, data:Partial<Group>, callback:ApiClientCallback<Group>)
    {
        let url = Constants.apiRoute.groupUrl(groupId)
        AjaxRequest.patchJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static createGroup(data:Partial<Group>, callback:ApiClientCallback<Group>)
    {
        let url = Constants.apiRoute.groupsUrl
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getTimesheets(community:number, user:number, project:number, task:number, limit:number, offset:number,callback:ApiClientFeedPageCallback<Timesheet>)
    {
        let url = Constants.apiRoute.timeSheetUrl + "?" + ApiClient.getQueryString({community, user, project, task, limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getEvents(community:number, parent:number, group:number, limit:number, offset:number, ordering:string, upcoming:boolean, callback:ApiClientFeedPageCallback<Event>)
    {
        let start_date = upcoming ? "&start_after=" : "&start_before="
        let sessions = parent ? true : false
        let url = Constants.apiRoute.eventsUrl + "?" + ApiClient.getQueryString({community, limit, offset, ordering, parent, sessions, group}) + start_date + moment().format("YYYY-MM-DD")
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getProjects(community:number, group:number, limit:number, offset:number, ordering:ProjectSorting, responsible:boolean, assigned:boolean, callback:ApiClientFeedPageCallback<Project>)
    {
        let url = Constants.apiRoute.projectsUrl + "?" + ApiClient.getQueryString({community, group, limit, offset, ordering, responsible, assigned})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getConversations(limit:number, offset:number, archived:boolean, withUsers:number[], callback:ApiClientFeedPageCallback<Conversation>)
    {
        let url = Constants.apiRoute.conversations + "?" + ApiClient.getQueryString({limit, offset, archived, with_users:withUsers && withUsers.join(",")})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getConversation(id:number,callback:ApiClientCallback<Conversation>)
    {
        let url = Constants.apiRoute.conversation(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static createMessage(message:Message, callback:ApiClientCallback<Message>)
    {
        this.sendMessage(message, callback)

    }
    static getFavorites(callback:ApiClientFeedPageCallback<Favorite>)
    {
        let url = Constants.apiRoute.favoritesUrl + "?" + ApiClient.getQueryString({limit:100})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
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
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static updateFavorite(id:number, object_natural_key:ContextNaturalKey, object_id:number, index:number, callback:ApiClientCallback<Favorite>)
    {
        let url = Constants.apiRoute.updateFavoriteUrl(id)
        AjaxRequest.patchJSON(url, {object_natural_key, object_id, index}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static deleteFavorite(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.updateFavoriteUrl(id)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    private static sendMessage(message:Message, callback:ApiClientCallback<Message>){
        var data = { conversation: message.conversation, text: message.text, uid: message.uid, mentions:message.mentions, files:(message.files || []).map(f => f.id) }
        AjaxRequest.postJSON(Constants.apiRoute.conversationMessagesUrl, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            let m = Object.assign({}, message)
            m.tempFiles = (m.tempFiles || []).map(f => Object.assign({}, f))
            m.error = status
            ConversationManager.updateQueuedMessage(m)
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static updateFilename(fileId:number,filename:string, callback:ApiClientCallback<UploadedFile>)
    {
        AjaxRequest.post(Constants.apiRoute.fileUploadUpdateName(fileId), {filename}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    private static uploadFile(file:File, id:string,  update:(tempFileId:string, progress:number ) => void, completion:(tempFileId:string, file?:UploadedFile) => void){
        let uploader = FileUploader.fromUploadedFile(file, (progress) => {
            update(id, progress)
        })
        uploader.doUpload((response) => {
            const file = response && response.files && response.files[0]
            completion(id, file)
        })
    }
    static getConversationMessages(conversation:number, limit:number, offset:number,callback:ApiClientFeedPageCallback<Message>)
    {
        let url = Constants.apiRoute.conversationMessagesUrl +  "?" + ApiClient.getQueryString({limit, offset, conversation})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static markConversationAsRead(conversationId:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.conversationMarkAsReadUrl(conversationId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static markTaskAsRead(id:number, callback:ApiClientCallback<any>)
    {
        let url = Constants.apiRoute.taskMarkAsReadUrl(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getPage<T>(endpoint:string, limit:number, offset:number,callback:ApiClientFeedPageCallback<T>)
    {
        let url = endpoint + "?" + ApiClient.getQueryString({ limit, offset})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static friendInvitationSend = (userId:number, callback:ApiClientCallback<FriendRequest>) => {
        let url = Constants.apiRoute.friendInvitation
        const data = { to_user: userId }
        AjaxRequest.post(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static friendInvitationAccept = (userId:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.friendInvitationAccept(userId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static friendInvitationDelete(userId:number, block:boolean, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.friendInvitationDelete(userId) + "?" + ApiClient.getQueryString({block})
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static userUnfriend(userId:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.friendsDelete(userId)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static userBlock(userId:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.blockUrl
        const data = { to_user: userId }
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static userUnBlock(userId:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.blockDelete(userId)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static groupInvitationAccept = (invitation:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.groupInvitationAcceptUrl(invitation)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static groupInvitationDelete(invitation:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.groupInvitationDeleteUrl(invitation)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static groupMembershipRequestAccept = (id:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.groupMembershipRequestAcceptUrl(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static groupMembershipRequestDelete(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.groupMembershipRequestDeleteUrl(id)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static eventReviewAccept = (id:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.eventReviewUrl
        const data = {accept: [id]}
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static eventReviewDelete(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.eventReviewUrl
        const data = {decline: [id]}
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getCommunityInvitations = (limit:number, offset:number, community:number, search:string, email:boolean, user:boolean, search_email:boolean, search_user:boolean, search_from_user:boolean,  callback:ApiClientFeedPageCallback<CommunityInvitation>) => {
        const data = {community, limit, offset, email, user, search, search_fields:undefined}
        const searchFilters:string[] = []
        if(search_email)
            searchFilters.push("email")
        if(search_user)
            searchFilters.push("user")
        if(search_from_user)
            searchFilters.push("from_user")
        if(searchFilters.length > 0)
            data.search_fields = searchFilters
        let url = Constants.apiRoute.communityInvitationUrl + "?" + ApiClient.getQueryString(data)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    private static getContextMembershipRequestUrl = (contextNaturalKey:ContextNaturalKey) => {
        let url:string = null
        switch (contextNaturalKey) {
            case ContextNaturalKey.EVENT :url = Constants.apiRoute.eventMembershipRequestUrl; break;
            case ContextNaturalKey.GROUP :url = Constants.apiRoute.groupMembershipRequestUrl; break;
            case ContextNaturalKey.COMMUNITY :url = Constants.apiRoute.communityMembershipRequestUrl; break;
            default:break;
        }
        return url
    }
    static createContextMembershipRequest(contextNaturalKey:ContextNaturalKey, contextObjectId:number, callback:ApiClientCallback<any>){
        let url = ApiClient.getContextMembershipRequestUrl(contextNaturalKey)
        if(!url)
        {
            callback(null, "500", new RequestErrorData({detail:`delete invitation endpoint not set for ${contextNaturalKey}`}, "error"))
            return
        }
        const data:Object = {}
        const key = ContextNaturalKey.elasticTypeForKey(contextNaturalKey).toLocaleLowerCase()
        data[key] = contextObjectId
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    private static getContextInvitationUrl = (contextNaturalKey:ContextNaturalKey) => {
        let url:string = null
        switch (contextNaturalKey) {
            case ContextNaturalKey.EVENT :url = Constants.apiRoute.eventInvitationListUrl; break;
            case ContextNaturalKey.GROUP :url = Constants.apiRoute.groupInvitationListUrl; break;
            default:break;
        }
        return url
    }
    private static getContextInvitationBatchUrl = (contextNaturalKey:ContextNaturalKey) => {
        let url:string = null
        switch (contextNaturalKey) {
            case ContextNaturalKey.EVENT :url = Constants.apiRoute.eventInvitationBatchUrl; break;
            case ContextNaturalKey.GROUP :url = Constants.apiRoute.groupInvitationBatchUrl; break;
            default:break;
        }
        return url
    }
    static deleteContextInvitations = (contextNaturalKey:ContextNaturalKey, ids:number[], callback:ApiClientCallback<{failed:{delete:number}[]}>) => {
        let url = ApiClient.getContextInvitationBatchUrl(contextNaturalKey)
        if(!url)
        {
            callback(null, "500", new RequestErrorData({detail:`delete invitation endpoint not set for ${contextNaturalKey}`}, "error"))
            return
        }
        const data = ids.map(id => {return {delete:id}})
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getContextInvitations = (contextNaturalKey:ContextNaturalKey, contextObjectId:number, limit:number, offset:number, search:string, callback:ApiClientFeedPageCallback<ContextInvitation>) => {
        let url = ApiClient.getContextInvitationUrl(contextNaturalKey)
        if(!url)
        {
            callback(null, "500", new RequestErrorData({detail:`invitation endpoint not set for ${contextNaturalKey}`}, "error"))
            return
        }
        const key = ContextSegmentKey.keyForNaturalKey(contextNaturalKey)
        const data = {limit, offset, search}
        data[key] = contextObjectId
        url = url + "?" + ApiClient.getQueryString(data)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }

    private static getContextJoinUrl = (contextNaturalKey:ContextNaturalKey, contextObjectId:number) => {
        let url:string = null
        switch (contextNaturalKey) {
            case ContextNaturalKey.COMMUNITY :url = Constants.apiRoute.communityJoinUrl(contextObjectId); break;
            case ContextNaturalKey.GROUP :url = Constants.apiRoute.groupJoinUrl(contextObjectId); break;
            case ContextNaturalKey.EVENT :url = Constants.apiRoute.eventAttendUrl(contextObjectId); break;
            default:break;
        }
        return url
    }
    static joinContext = (contextNaturalKey:ContextNaturalKey, contextObjectId:number, callback:ApiClientCallback<any>) => {
        let url = ApiClient.getContextJoinUrl(contextNaturalKey, contextObjectId)
        if(!url)
        {
            callback(null, "500", new RequestErrorData({detail:`join endpoint not set for ${contextNaturalKey}`}, "error"))
            return
        }
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static createContextInvitation = (contextNaturalKey:ContextNaturalKey, contextObjectId:number, users:number[], moderator:boolean,  callback:ApiClientCallback<any>) => {
        let url = ApiClient.getContextInvitationUrl(contextNaturalKey)
        if(!url)
        {
            callback(null, "500", new RequestErrorData({detail:`invitation endpoint not set for ${contextNaturalKey}`}, "error"))
            return
        }
        const key = ContextSegmentKey.keyForNaturalKey(contextNaturalKey)
        const data = { users, moderator }
        data[key] = contextObjectId
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static deleteCommunityInvitations = (ids:number[], callback:ApiClientCallback<{failed:{delete:number}[]}>) => {
        let url = Constants.apiRoute.communityInvitationBatchUrl
        const data = ids.map(id => {return {delete:id}})
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static createCommunityInvitation = (community:number, message:string, language:AppLanguage, email:string[], users:number[], callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.communityInvitationUrl
        const data = {community, message, language, email, users}
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static communityInvitationAccept = (invitation:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.communityInvitationAcceptUrl(invitation)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static communityInvitationDelete(invitation:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.communityInvitationDeleteUrl(invitation)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static communityMembershipRequestAccept = (id:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.communityMembershipRequestAcceptUrl(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static communityMembershipRequestDelete(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.communityMembershipRequestDeleteUrl(id)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static eventInvitationGoing = (invitation:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.eventInvitationGoingUrl(invitation)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static eventInvitationNotGoing = (invitation:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.eventInvitationNotGoingUrl(invitation)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static eventInvitationDelete(invitation:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.eventInvitationDeleteUrl(invitation)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static eventMembershipRequestAccept = (id:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.eventMembershipRequestAcceptUrl(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static eventMembershipRequestDelete(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.eventMembershipRequestDeleteUrl(id)
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static groupReviewAccept = (id:number, callback:ApiClientCallback<any>) => {
        let url = Constants.apiRoute.groupReviewUrl
        const data = {accept: [id]}
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static groupReviewDelete(id:number, callback:ApiClientCallback<any>){
        let url = Constants.apiRoute.groupReviewUrl
        const data = {decline: [id]}
        AjaxRequest.postJSON(url, data, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getUnreadNotifications(callback:ApiClientCallback<UnreadNotificationCounts>){
        let url = Constants.apiRoute.notificationUnreadUrl
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getLanguages(limit:number, offset:number, user:number, callback:ApiClientFeedPageCallback<ProfileLanguage>){
        let url = Constants.apiRoute.languageUrl + "?" + ApiClient.getQueryString({limit, offset, user})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getCertifications(limit:number, offset:number, user:number, callback:ApiClientFeedPageCallback<ProfileCertification>){
        let url = Constants.apiRoute.certificationUrl + "?" + ApiClient.getQueryString({limit, offset, user})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getEducations(limit:number, offset:number, user:number, callback:ApiClientFeedPageCallback<ProfileEducation>){
        let url = Constants.apiRoute.educationUrl + "?" + ApiClient.getQueryString({limit, offset, user})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getPositions(limit:number, offset:number, user:number, callback:ApiClientFeedPageCallback<ProfilePosition>){
        let url = Constants.apiRoute.positionUrl + "?" + ApiClient.getQueryString({limit, offset, user})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getVolunteering(limit:number, offset:number, user:number, callback:ApiClientFeedPageCallback<ProfileVolunteeringExperience>){
        let url = Constants.apiRoute.volunteeringUrl + "?" + ApiClient.getQueryString({limit, offset, user})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static sendCrashReport(level:CrashLogLevel, message:string, stack:string, componentStack:string, user_id:number, user_agent:string, endpoint:string, extra:string, callback:ApiClientCallback<any>){
        const url = Constants.apiRoute.createCrashReportUrl
        AjaxRequest.postJSON(url,  { level, message, stack, componentStack, user_id, user_agent, endpoint, extra}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }
    static getCalendarItems(start:Date, end:Date, callback:ApiClientCallback<(CalendarItem | Event | Task)[]>){
        const startString = moment(start).format(DateFormat.serverDay)
        const endString = moment(end).format(DateFormat.serverDay)
        let url = Constants.apiRoute.calendarUrl + "?" + ApiClient.getQueryString({start:startString, end:endString})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, new RequestErrorData(request.responseJSON, error))
        })
    }

}
export class FileUploader<T>
{
    formData:FormData
    progress:(percent:number) => void
    request:any = null
    endpoint:string
    static fromUploadedFile(file:Blob, progress:(percent:number) => void)
    {
        const data = new FormData()
        data.append("file", file)
        return new FileUploader<UploadedFileResponse>(data, Constants.apiRoute.fileUploadUrl, progress)
    }
    constructor(formData:FormData, endpoint:string, progress:(percent:number) => void)
    {
        this.formData = formData
        this.progress = progress
        this.endpoint = endpoint
        this.doUpload = this.doUpload.bind(this)
        this.progressHandling = this.progressHandling.bind(this)
    }
    doUpload = (completion:ApiClientCallback<T>) => {
        let url = EndpointManager.applyEndpointDomain(this.endpoint)
        const onError:ErrorCallback = (request, status, error) => {
            completion(null, status, new RequestErrorData(request.responseJSON, error))
        }
        const onSuccess:SuccessCallback = (data, status, request) => {
            completion(data, status, null)
        }
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
            success: onSuccess,
            error: onError,
            async: true,
            data: this.formData,
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
