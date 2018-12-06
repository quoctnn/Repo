import Constants from "../utilities/Constants";
import {AjaxRequest} from "./AjaxRequest";
var $ = require("jquery")
import store from '../main/App';
import { Status, UserProfile, UploadedFile } from "../types/intrasocial_types";

export type ApiClientCallback = (data: any, status:string, error:string) => void;
export type ApiClientCommunityMembersCallback = (data: UserProfile[], status:string, error:string) => void;
export type ApiClientStatusCallback = (data: Status, status:string, error:string) => void;

export enum ListOrdering {
    ALPHABETICAL = "alphabetical",
    LAST_USED = "last-used",
    MOST_USED = "most-used",
}
export default class ApiClient
{
    static getQueryString(params:any)
    {
        let keys = Object.keys(params)
        let values = keys.map(key => params[key])
        var arr:string[] = []
        Object.keys(params).forEach(key => {
            var val = params[key]
            if(typeof val != "string" && Array.isArray(val))
            {
                val = val.join(",")
            }
            if(val)
            {
                arr.push(key + '=' + val)
            }
        })
        return arr.join('&');
    }
    static newsfeed(limit:number,offset:number,parent:number|null, max_children:number|null, callback:ApiClientStatusCallback)
    {
        let url = Constants.apiRoute.newsfeed + "?" + this.getQueryString({limit,offset,parent,max_children})
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static createStatus(status:Status, callback:ApiClientStatusCallback)
    {
        let url = Constants.apiRoute.postUrl
        AjaxRequest.post(url,status, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static deleteStatus(statusId:number, callback:ApiClientStatusCallback)
    {
        let url = Constants.apiRoute.postUrl + statusId + "/"
        AjaxRequest.delete(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getCommunityMembers(communityId:number, callback:ApiClientCommunityMembersCallback)
    {
        let url = Constants.apiRoute.communityMembersUrl(communityId)
        AjaxRequest.get(url, (data, status, request) => {
            let result = data && data.results ? data.results : []
            callback(result, status, null)
        }, (request, status, error) => {
            callback([], status, error)
        })
    }
    static getProfiles(profiles:number[], callback:ApiClientCallback)
    {
        let url = Constants.apiRoute.profilesUrl +  "?id=" + profiles.join()
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static reactToStatus(statusId:number,reaction:string, callback:ApiClientCallback)
    {
        AjaxRequest.post(Constants.apiRoute.postReaction(statusId), {reaction}, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static createConversation(title:string, users:number[], callback:ApiClientCallback)
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
    static getProfile(id:number, callback:ApiClientCallback)
    {
        AjaxRequest.get(Constants.apiRoute.profileUrl(id), (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getProfileBySlug(slug:string, callback:ApiClientCallback)
    {
        AjaxRequest.get(Constants.apiRoute.profilesUrl + "?slug_name=" + encodeURIComponent( slug ), (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getMyProfile(callback:ApiClientCallback)
    {
        AjaxRequest.get(Constants.apiRoute.myProfileUrl, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static apiLogin(email:string, password:string,callback:ApiClientCallback)
    {
        AjaxRequest.post(Constants.apiRoute.login,`username=${email}&password=${password}`, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static sessionLogin(email:string, password:string,callback:ApiClientCallback)
    {
        AjaxRequest.postHtml(Constants.urlsRoute.login,`login=${email}&password=${password}&next=/`, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static nativeLogin(email:string, password:string,callback:ApiClientCallback)
    {
        AjaxRequest.post(Constants.apiRoute.nativeLogin,`username=${email}&password=${password}`, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getCommunities(is_member:boolean, ordering:ListOrdering, limit:number, offset:number,callback:ApiClientCallback)
    {
        let url = Constants.apiRoute.communityList + "?limit=" + limit + "&offset=" + offset + "&is_member=" + (is_member ? "True":"False") + "&ordering=" + ordering;
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getGroups(community:number, limit:number, offset:number,callback:ApiClientCallback)
    {
        let url = Constants.apiRoute.groupsUrl + "?limit=" + limit + "&offset=" + offset + "&community=" + community;
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getEvents(community:number, limit:number, offset:number,callback:ApiClientCallback)
    {
        let url = Constants.apiRoute.eventsUrl + "?limit=" + limit + "&offset=" + offset + "&community=" + community;
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getProjects(community:number, limit:number, offset:number,callback:ApiClientCallback)
    {
        let url = Constants.apiRoute.projectsUrl + "?limit=" + limit + "&offset=" + offset + "&community=" + community;
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getConversations(limit:number, offset:number,callback:ApiClientCallback)
    {
        let url = Constants.apiRoute.conversations + "?limit=" + limit + "&offset=" + offset;
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getConversation(id:number,callback:ApiClientCallback)
    {
        let url = Constants.apiRoute.conversation(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getConversationMessages(conversationId:number, limit:number, offset:number,callback:ApiClientCallback)
    {
        let url = Constants.apiRoute.conversationMessagesUrl(conversationId) + "?limit=" + limit + "&offset=" + offset;
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static markConversationAsRead(conversationId:number, callback:ApiClientCallback)
    {
        let url = Constants.apiRoute.conversationMarkAsReadUrl(conversationId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getPage(endpoint:string, limit:number, offset:number,callback:ApiClientCallback)
    {
        let url = endpoint + "?limit=" + limit + "&offset=" + offset;
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
        let state = store.getState().debug
        let url = state.availableApiEndpoints[state.apiEndpoint].endpoint + Constants.apiRoute.fileUploadUrl
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
