export default abstract class Routes {
    static ANY = "*"
    static ROOT = "/"
    static PROFILE_UPDATE = "/profile/update"
    static SIGNIN = "/signin"
    static DEVELOPER_TOOL = "/developer-tool"
    static CONVERSATIONS = "/conversations/"
    static CONVERSATION_CREATE = "/conversation/create/"
    static SEARCH = "/search/"
    static UPDATE_TOOL = "/app-update"
    
    private static PROFILE = "/profile/"
    private static COMMUNITY = "/community/"
    private static CONVERSATION = "/conversation/"
    private static PROJECT = "/project/"
    private static TASK = "/task/"
    private static GROUP = "/group/"
    private static EVENT = "/event/"

    static profileUrl = (profile:string|number) => {
        return `${Routes.PROFILE}${profile}/`
    }
    static conversationUrl = (conversation:string|number, includeTrailingSlash:boolean = true) => {
        return `${Routes.CONVERSATION}${conversation}${includeTrailingSlash ? "/": ""}`
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