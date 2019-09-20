import {ApiClient} from '../network/ApiClient';
import { translate } from '../localization/AutoIntlProvider';
type RouteEntry = {
    path:string
    title:() => string
}
export default abstract class Routes {
    static ANY = "*"
    static ELECTRON = "/**/electron.html"
    static ROOT = "/"
    static PROFILE_UPDATE = "/profile/update/"
    static SIGNIN = "/signin/"
    static SIGNOUT = "/signout/"
    static SIGNUP = "/signup/"
    static CONVERSATION_CREATE = "/conversation/create/"
    static COMMUNITY_CREATE = "/community/create/"
    static EVENT_CREATE = "/event/create/"
    static GROUP_CREATE = "/group/create/"
    static SEARCH = "/search/"
    static UPDATE_TOOL = "/app-update/"
    static NEWSFEED = "/newsfeed/"
    static CHANGELOG = "/changelog/"
    static FILES = "/files/"
    static DEVELOPER_TOOL = {path:"/developer-tool", title:() => {return translate("admin.developertool")}}
    static ADMIN_DASHBOARD_BUILDER:RouteEntry = {path:"/admin/dashboard-builder/", title:() => {return translate("admin.dashboard.builder")}}

    private static PROFILE = "/profile/"
    private static COMMUNITY = "/community/"
    private static PROJECT = "/project/"
    private static TASK = "/task/"
    private static GROUP = "/group/"
    private static EVENT = "/event/"
    private static CONVERSATION = "/conversation/"
    private static STATUS = "/status/"
    private static ERROR_NOT_FOUND = "/error404/"

    static searchUrl = (query:string, type?:string) => {
        if (!query && !type) return Routes.SEARCH
        let uri = `${Routes.SEARCH}?`
        if(type)
            uri += `type=${encodeURIComponent( type )}`
            if (query) uri += "&"
        if(query)
            uri += `term=${encodeURIComponent( query )}`
        return uri
    }
    static newsfeedUrl = (contextNaturalKey?: string, contextObjectId?:number|string, includeSubContext?:boolean|string) => {
        let ret = Routes.NEWSFEED
        if(contextNaturalKey && contextObjectId)
        {
            ret += `${contextNaturalKey}/${contextObjectId}/`
        }
        const query = ApiClient.getQueryString({includeSubContext})
        if(query.length > 0)
            ret += "?" + query
        return ret
    }
    static errorNotFound = () => {
        return `${Routes.ERROR_NOT_FOUND}`
    }
    static profileUrl = (profile:string|number) => {
        return `${Routes.PROFILE}${profile}/`
    }
    static statusUrl = (status:string|number) => {
        return `${Routes.STATUS}${status}/`
    }
    static conversationUrl = (conversation:string|number, includeTrailingSlash:boolean = true) => {
        return `${Routes.CONVERSATION}${conversation || ""}${!!conversation && includeTrailingSlash ? "/": ""}`
    }
    static communityUrl = (community:string|number, includeTrailingSlash:boolean = true) => {
        return `${Routes.COMMUNITY}${community}${includeTrailingSlash ? "/": ""}`
    }
    static groupUrl = (community:string|number, group:string|number, includeTrailingSlash:boolean = true) => {
        return `${Routes.communityUrl(community,false)}${Routes.GROUP}${group}${includeTrailingSlash ? "/": ""}`
    }
    static projectUrl = (community:string|number, project:string|number, includeTrailingSlash:boolean = true) => {
        return `${Routes.communityUrl(community,false)}${Routes.PROJECT}${project}${includeTrailingSlash ? "/": ""}`
    }
    static eventUrl = (community:string|number, event:string|number, includeTrailingSlash:boolean = true) => {
        return `${Routes.communityUrl(community,false)}${Routes.EVENT}${event}${includeTrailingSlash ? "/": ""}`
    }
    static taskUrl = (community:string|number, project:string|number, task:string|number, includeTrailingSlash:boolean = true) => {
        return `${Routes.projectUrl(community,project, false)}${Routes.TASK}${task}${includeTrailingSlash ? "/": ""}`
    }
}