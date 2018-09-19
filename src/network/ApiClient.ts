import Constants from "../utilities/Constants";
import {AjaxRequest} from "./AjaxRequest";

export type ApiRequestCallback = (data: any, status:string, error:string) => void;
export enum ListOrdering {
    ALPHABETICAL = "alphabetical",
    LAST_USED = "last-used",
    MOST_USED = "most-used",
}
export default class ApiClient
{
    static createConversation(title:string, users:number[], callback:ApiRequestCallback) 
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
    static getProfile(id:number, callback:ApiRequestCallback) 
    {
        AjaxRequest.get(Constants.apiRoute.profileUrl(id), (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getProfileBySlug(slug:string, callback:ApiRequestCallback) 
    {
        AjaxRequest.get(Constants.apiRoute.profilesUrl + "?slug_name=" + encodeURIComponent( slug ), (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getMyProfile(callback:ApiRequestCallback) 
    {
        AjaxRequest.get(Constants.apiRoute.myProfileUrl, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static apiLogin(email:string, password:string,callback:ApiRequestCallback)
    {
        AjaxRequest.post(Constants.apiRoute.login,`username=${email}&password=${password}`, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static sessionLogin(email:string, password:string,callback:ApiRequestCallback)
    {
        AjaxRequest.postHtml(Constants.urlsRoute.login,`login=${email}&password=${password}&next=/`, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static nativeLogin(email:string, password:string,callback:ApiRequestCallback)
    {
        AjaxRequest.post(Constants.apiRoute.nativeLogin,`username=${email}&password=${password}`, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getCommunities(is_member:boolean, ordering:ListOrdering, limit:number, offset:number,callback:ApiRequestCallback)
    {
        let url = Constants.apiRoute.communityList + "?limit=" + limit + "&offset=" + offset + "&is_member=" + (is_member ? "True":"False") + "&ordering=" + ordering;
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getGroups(community:number, limit:number, offset:number,callback:ApiRequestCallback)
    {
        let url = Constants.apiRoute.groupsUrl + "?limit=" + limit + "&offset=" + offset + "&community=" + community;
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getConversations(limit:number, offset:number,callback:ApiRequestCallback)
    {
        let url = Constants.apiRoute.conversations + "?limit=" + limit + "&offset=" + offset;
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getConversation(id:number,callback:ApiRequestCallback)
    {
        let url = Constants.apiRoute.conversation(id)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getConversationMessages(conversationId:number, limit:number, offset:number,callback:ApiRequestCallback)
    {
        let url = Constants.apiRoute.conversationMessagesUrl(conversationId) + "?limit=" + limit + "&offset=" + offset;
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static markConversationAsRead(conversationId:number, callback:ApiRequestCallback)
    {
        let url = Constants.apiRoute.conversationMarkAsReadUrl(conversationId)
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
    static getPage(endpoint:string, limit:number, offset:number,callback:ApiRequestCallback)
    {
        let url = endpoint + "?limit=" + limit + "&offset=" + offset;
        AjaxRequest.get(url, (data, status, request) => {
            callback(data, status, null)
        }, (request, status, error) => {
            callback(null, status, error)
        })
    }
}