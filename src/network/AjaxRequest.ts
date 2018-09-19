'use strict';
import { Settings } from "../utilities/Settings";
import store from '../main/App';
var $ = require("jquery")

var isProduction = Settings.isProduction;
export type SuccessCallback = (data: any, status:string, request:JQuery.jqXHR) => void;
export type ErrorCallback = (request:JQuery.jqXHR, status:string, error:string) => void;


export class AjaxRequest
{
    static sendAuthorization:boolean = true
    static setup(token:string)
    {
        console.log("AjaxRequest.setup", token)
        $.ajaxSetup({
            beforeSend: function (xhr, settings) {
                if(AjaxRequest.sendAuthorization && token)
                {
                    xhr.setRequestHeader("Authorization", "Token " + token);
                }
            }
        });
        
    }
    static get(url:string, success:SuccessCallback, error:ErrorCallback)
    {
        return AjaxRequest.ajaxCall("GET", url, null, success, error);
    }
    static postNoProcess(url:string, data, success:SuccessCallback, error:ErrorCallback)
    {
        return AjaxRequest.ajaxCallNoProcess("POST", url, data, success, error);
    }
    static post(url:string, data, success:SuccessCallback, error:ErrorCallback)
    {
        return AjaxRequest.ajaxCall("POST", url, data, success, error);
    }
    static postHtml(url:string, data, success:SuccessCallback, error:ErrorCallback)
    {
        return AjaxRequest.ajaxCallHtml("POST", url, data, success, error);
    }
    static put(url, data, success:SuccessCallback, error:ErrorCallback)
    {
        return AjaxRequest.ajaxCall("PUT", url, data, success, error);
    }
    static patch(url, data, success:SuccessCallback, error:ErrorCallback)
    {
        return AjaxRequest.ajaxCall("PATCH", url, data, success, error);
    }
    static delete(url, data, success:SuccessCallback, error:ErrorCallback)
    {
        return AjaxRequest.ajaxCall("DELETE", url, null, success, error);
    }
    static postJSON(url, json, success:SuccessCallback, error:ErrorCallback)
    {
        return AjaxRequest.ajaxCallJSON("POST", url, json, success, error);
    }
    static putJSON(url, json, success:SuccessCallback, error:ErrorCallback) 
    {
        return AjaxRequest.ajaxCallJSON("PUT", url, json, success, error);
    }
    private static ajaxCallJSON(type:string, url:string, json:any, success:SuccessCallback, error:ErrorCallback) 
    {
        url = AjaxRequest.applyEndpointDomain(url)
        if (typeof  success === 'undefined') {
            success = defaultCallback;
        }
    
        if (typeof  error === 'undefined') {
            error = defaultErrorCallback;
        }
        return $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            type: type,
            data: JSON.stringify(json),
            contentType: "application/json; charset=utf-8",
            success: success.bind(this),
            error: error.bind(this)
        });
    }
    private static applyEndpointDomain(url:string)
    {
        if (url.indexOf('://') > 0 || url.indexOf('//') === 0 ) 
        {
            return url
        }
        let state = store.getState().debug
        return state.availableApiEndpoints[state.apiEndpoint].endpoint + url
    }
    private static ajaxCallNoProcess(method, url, data, success:SuccessCallback, error:ErrorCallback) 
    {
        url = AjaxRequest.applyEndpointDomain(url)
        if (typeof  success === 'undefined') {
            success = defaultCallback;
        }
    
        if (typeof  error === 'undefined') {
            error = defaultErrorCallback;
        }
        return $.ajax({
            url: url,
            cache: false,
            type: method,
            traditional: true,
            data: data,
            processData: false,
            contentType: false,
            success: success.bind(this),
            error: error.bind(this)
        });
    }
    private static ajaxCall(method, url, data, success:SuccessCallback, error:ErrorCallback) 
    {
        url = AjaxRequest.applyEndpointDomain(url)
        if (typeof  success === 'undefined') {
            success = defaultCallback;
        }
    
        if (typeof  error === 'undefined') {
            error = defaultErrorCallback;
        }
        return $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            type: method,
            traditional: true,
            data: data,
            success: success.bind(this),
            error: error.bind(this)
        });
    }
    private static ajaxCallHtml(method, url, data, success:SuccessCallback, error:ErrorCallback) 
    {
        url = AjaxRequest.applyEndpointDomain(url)
        if (typeof  success === 'undefined') {
            success = defaultCallback;
        }
    
        if (typeof  error === 'undefined') {
            error = defaultErrorCallback;
        }
        return $.ajax({
            url: url,
            dataType: 'html',
            cache: false,
            type: method,
            traditional: true,
            data: data,
            success: success.bind(this),
            error: error.bind(this),
        });
    }
}
const defaultCallback:SuccessCallback = (data, status, jxhr) => {
    if (!isProduction) {
        console.log(data, status);
    }
};
const defaultErrorCallback:ErrorCallback = (xhr, status, err) => {
    if (!isProduction) {
        console.error(err.toString())
        console.error("Error status: " + xhr.statusText)
        console.log(xhr);
    }

    if (isProduction && (xhr.status === 403 || xhr.status === 401)) {
        // Redirect to main page when session expires or user is not authorized.
        window.location.href = "/";
    }

    if (isProduction && (xhr.status === 404)) {
        // Redirect to ... if object not found.
        alert("Error: Object not found!")
    }

};

