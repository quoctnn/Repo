import Constants from "../utilities/Constants";
import {AjaxRequest} from "./AjaxRequest";

export type ApiRequestCallback = (data: any, status:string, error:string) => void;
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
}