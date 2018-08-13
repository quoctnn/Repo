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
    static getProfile(id:number, callback:ApiRequestCallback) 
    {
        AjaxRequest.get(Constants.apiRoute.profileUrl(id), (data, status, request) => {
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
}