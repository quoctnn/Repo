import * as React from 'react';
import Emoji from "../components/general/Emoji";
import Constants from "../utilities/Constants";
import { translate } from "../localization/AutoIntlProvider";
import { userFullName, groupCover, communityCover, userCover, projectCover, eventCover } from '../utilities/Utilities';
import { CommunityManager } from '../managers/CommunityManager';
import { Settings } from '../utilities/Settings';
export type CommunityRole = {
    community:number
    users:number[]
    groups:number[]
    projects:number[]
    role:string
    moderator:boolean
    manager:boolean
    group_creation:CommunityRoleCreatePermission
    subgroup_creation:CommunityRoleCreatePermission
    event_creation:CommunityRoleCreatePermission
    project_creation:CommunityRoleCreatePermission
    color:string
} & IdentifiableObject
export type FriendRequest = {
    created:string
    from_user:number
    message:string
    to_user:number
} & IdentifiableObject
export enum RelationshipStatus{
    friends = "friends",
    pendingRequest = "pending-request",
    pendingInvitation = "pending-invitation",
    isBlocked = "is-blocked",
    blockedBy = "blocked-by",
    owner = "owner",
    admin = "admin",
    moderator = "moderator",
    creator = "creator",
    manager = "manager",

}
export enum AppLanguage{
    english = "en",
    norwegian = "nb",
    spanish = "es",
}
export namespace AppLanguage {
    export const all = [
        AppLanguage.english,
        AppLanguage.norwegian,
        AppLanguage.spanish,
    ]
    export function translationForKey(key: AppLanguage) {
        return translate(`language.${key}`)
    }
}
export type CommunityConfigurationData = {
    id:number
    members_publication:boolean
    members_comments: boolean
    members_wall_notifications:boolean
    public_member_list:boolean
    public_creator:boolean
    publish_files:boolean
    use_chapters:boolean
    members_group_creation:CommunityCreatePermission
    subgroups:CommunityCreatePermission
    members_event_creation:CommunityCreatePermission
    members_project_creation:CommunityCreatePermission
    allow_anonymous_users:boolean
    primary_color:string
    secondary_color:string
    community:number
}
export enum CommunityCreatePermission{
    createDenied = 0,
    createLimited = 20,
    createAllowed = 21,
}
export namespace CommunityCreatePermission {
    export const all = [
        CommunityCreatePermission.createDenied,
        CommunityCreatePermission.createLimited,
        CommunityCreatePermission.createAllowed,
    ]
    export function translationForKey(key: CommunityCreatePermission) {
        return translate(`community.create_permission.${key}`)
    }
}
export enum CommunityRoleCreatePermission{
    createDenied = 0,
    createLimited = 20,
    createAllowed = 21,
    inherit = -1
}
export namespace CommunityRoleCreatePermission {
    export const all = [
        CommunityRoleCreatePermission.createDenied,
        CommunityRoleCreatePermission.createLimited,
        CommunityRoleCreatePermission.createAllowed,
        CommunityRoleCreatePermission.inherit,
    ]
    export function translationForKey(key: CommunityRoleCreatePermission) {
        return translate(`community.create_permission.${key}`)
    }
}
export enum CommunityCategory{
    aerospace = "aerospace",
    biotech = "biotech",
    cargo_freight = "cargo_freight",
    cause = "cause",
    chemical = "chemical",
    college = "college",
    company = "company",
    community_org = "community_org",
    community_ser = "community_ser",
    computer = "computer",
    consulting = "consulting",
    educationResearch = "education-research",
    elementary = "elementary",
    energy = "energy",
    entrepreneur = "entrepreneur",
    government = "government",
    health = "health",
    high_school = "high_school",
    industrial = "industrial",
    insurance = "insurance",
    institution = "institution",
    internet = "internet",
    labor = "labor",
    media = "media",
    middle_school = "middle_school",
    mining = "mining",
    vehicle = "vehicle",
    ngo = "ngo",
    non = "non",
    political_org = "political_org",
    political_par = "political_par",
    preschool = "preschool",
    religious = "religious",
    retail = "retail",
    school = "school",
    science = "science",
    serviceProfessionals = "service-professionals",
    startup = "startup",
    telecom = "telecom",
    tobacco = "tobacco",
    travel = "travel",
    other = "other",
}
export namespace CommunityCategory {
    export const all = [
    CommunityCategory.aerospace,
    CommunityCategory.biotech,
    CommunityCategory.cargo_freight,
    CommunityCategory.cause,
    CommunityCategory.chemical,
    CommunityCategory.college,
    CommunityCategory.company,
    CommunityCategory.community_org,
    CommunityCategory.community_ser,
    CommunityCategory.computer,
    CommunityCategory.consulting,
    CommunityCategory.educationResearch,
    CommunityCategory.elementary,
    CommunityCategory.energy,
    CommunityCategory.entrepreneur,
    CommunityCategory.government,
    CommunityCategory.health,
    CommunityCategory.high_school,
    CommunityCategory.industrial,
    CommunityCategory.insurance,
    CommunityCategory.institution,
    CommunityCategory.internet,
    CommunityCategory.labor,
    CommunityCategory.media,
    CommunityCategory.middle_school,
    CommunityCategory.mining,
    CommunityCategory.vehicle,
    CommunityCategory.ngo,
    CommunityCategory.non,
    CommunityCategory.political_org,
    CommunityCategory.political_par,
    CommunityCategory.preschool,
    CommunityCategory.religious,
    CommunityCategory.retail,
    CommunityCategory.school,
    CommunityCategory.science,
    CommunityCategory.serviceProfessionals,
    CommunityCategory.startup,
    CommunityCategory.telecom,
    CommunityCategory.tobacco,
    CommunityCategory.travel,
    CommunityCategory.other,
    ]
    export function translationForKey(key: CommunityCategory) {
        return translate(`community.category.${key}`)
    }
}
export type UploadedFileResponse = {files:UploadedFile[]}

export enum ContextPhotoType{
    cover = "cover", avatar = "avatar"
}
export type CropRect = {
    top_left:number[]
    bottom_right:number[]
}
export type CropInfo = {
    image:string
    cropped:string
    thumbnail:string
} & CropRect
export type GDPRData = {
    requiredActions:OUPRequiredAction[]
    updateGdprContinuationKey:string
    gdprInfo:GDPRInfo
}
export type GDPRInfo = {
    consentSetId:string
    languageIsoCode:string
    terms:GDPRTerms
    processingActivity:GDPRProcessingActivity
}
export type GDPRTerms = {
    agreementText:string
    checked:boolean
    explanation:string
    id:string
    markNeedToFill:boolean
    questionText:string
    title:string
}
export type GDPRProcessingActivity = {
    id:string
    title:string
    consents:GDPRProcessingActivityConsent[]
}
export type GDPRProcessingActivityConsent = {
    id:string
    order:number
    mandatory:boolean
    title:string
    explanation:string
    type:GDPRProcessingActivityType
    question:string
    choices:GDPRProcessingActivityConsentChoice[]
}
export type GDPRProcessingActivityConsentChoice = {
    id:string
    message:string
}
export enum GDPRProcessingActivityType{
    singleChoice =  "single_choice",
    multipleChoice = "multiple_choice"
}
export enum OUPRequiredAction{
    verifyEmail = "VERIFY_EMAIL",
    updateProfile = "UPDATE_PROFILE",
    configureTOTP = "CONFIGURE_TOTP",
    updatePassword = "UPDATE_PASSWORD",
    gdprTermsAndCondition = "GDPR_TERMS_AND_CONDITIONS",
}
export type RequestErrorDetail = {
    error:string
    error_description:string
    extra:GDPRData
}
export type GDPRFormConsents = {
    id:string
    agreedChoiceIds:string[]
}
export type GDPRFormAnswers = {
    consentSetId:string
    processingActivityId:string
    termId:string
    termsAgreed:boolean
    consents:GDPRFormConsents[]
}
export class RequestErrorData{
    data:any
    detail?:RequestErrorDetail
    error:string
    constructor(data:any, error:string) {
        this.data = data
        this.error = error
        if(data && data.detail)
        {
            try {
                this.detail = JSON.parse(data.detail)
            } catch (error) {
            }
        }
    }
    renameErrorField = (oldKey:string, newKey?:string) => {
        if(this.data && typeof this.data == "object")
        {
            if (this.data.hasOwnProperty(oldKey)) {
                this.data[newKey] = this.data[oldKey]
                delete this.data[oldKey]
            }
        }
    }
    getErrorMessageForField = (key:string) => {
        if(this.data && typeof this.data == "object")
        {
            return this.data[key]
        }
        return null
    }
    getErrorMessagesForFields = (keys:string[]) => {
        if(this.data && typeof this.data == "object")
        {
            const obj:{[key:string]:string} = {}
            keys.forEach(k => {
                const s = this.data[k]
                if(s)
                    obj[k] = s
            })
            return obj
        }
        return null
    }
    getErrorMessage = () => {

        const error = (this.detail && this.detail.error_description) || (this.data && (this.data.non_field_errors || this.data))
        let errorMessage:string = undefined
        if(error)
        {
            if(Array.isArray(error))
                errorMessage = error[0]
            else if(typeof error == "string")
                errorMessage = error
            else if (typeof error == "object" && error.hasOwnProperty("detail"))
                errorMessage = error.detail
            else {
                console.warn(`RequestErrorData:${error} is not a string`)
            }
        }
        return errorMessage || this.error
    }
}
export enum CrashLogLevel {
    info = "info",
    debug = "debug",
    warning = "warning",
    error = "error",
}
export enum ObjectHiddenReason {
    blocked = "blocked",
    deleted = "deleted",
    review = "review",
    unknown = "unknown",
}
export enum LanguageProficiency {
    ELEMENTARY = "ELEMENTARY",
    LIMITED_WORKING = "LIMITED_WORKING",
    PROFESSIONAL_WORKING = "PROFESSIONAL_WORKING",
    FULL_PROFESSIONAL = "FULL_PROFESSIONAL",
    NATIVE_OR_BILINGUAL = "NATIVE_OR_BILINGUAL",
}
export enum VolunteeringCause {
    animalRights = "animalRights",
    artsAndCulture = "artsAndCulture",
    children = "children",
    civilRights = "civilRights",
    economicEmpowerment = "economicEmpowerment",
    education = "education",
    environment = "environment",
    health = "health",
    humanRights = "humanRights",
    humanitarianRelief = "humanitarianRelief",
    politics = "politics",
    povertyAlleviation = "povertyAlleviation",
    scienceAndTechnology = "scienceAndTechnology",
    socialServices = "socialServices",
}
export type ProfileLanguage = {
    name: string
    hidden: boolean
    hidden_reason: ObjectHiddenReason
    linkedin_id?: string
    proficiency: LanguageProficiency

} & IdentifiableObject
export type ProfileCertification = {
    name: string
    hidden: boolean
    hidden_reason: ObjectHiddenReason
    linkedin_id?: string
    start_date?: string
    end_date?: string
    authority?: string
    license_number?: string
    url?: string
    company?: ProfileCompany

} & IdentifiableObject
export type ProfileEducation = {
    name: string
    hidden: boolean
    hidden_reason: ObjectHiddenReason
    linkedin_id?: string
    start_date?: string
    end_date?: string
    activities?: string
    fields_of_study?: string
    grade?: string
    notes?: string
    program?: string
    rich_media_associations?: string
    school?: ProfileCompany

} & IdentifiableObject
export type ProfilePosition = {
    name: string
    hidden: boolean
    hidden_reason: ObjectHiddenReason
    linkedin_id?: string

    title?: string
    description?: string
    location_name?: string
    start_date?: string
    end_date?: string
    rich_media_associations?: string
    company?: ProfileCompany

} & IdentifiableObject
export type ProfileVolunteeringExperience = {
    hidden: boolean
    hidden_reason: ObjectHiddenReason
    linkedin_id?: string
    role: string
    cause: VolunteeringCause
    description?: string
    start_date?: string
    end_date?: string
    company?: ProfileCompany

} & IdentifiableObject

export type ProfileCompany = {
    name: string
    hidden: boolean
    hidden_reason: ObjectHiddenReason
    linkedin_id?: string
    description?: string
    url?: string
    avatar_original?: string
} & IdentifiableObject
export enum ContextPrivacy{
    publicOpenMembership = "public-open-membership",
    publicClosedMembership = "public-closed-membership",
    privateListed = "private-listed",
    privateUnlisted = "private-unlisted",
}
export namespace ContextPrivacy {
    export const all = [
        ContextPrivacy.publicOpenMembership,
        ContextPrivacy.publicClosedMembership,
        ContextPrivacy.privateListed,
        ContextPrivacy.privateUnlisted,
    ]
    export function iconClassForKey(key: ContextPrivacy) {
        switch (key) {
            case ContextPrivacy.publicOpenMembership: return "fas fa-globe-europe"
            case ContextPrivacy.publicClosedMembership: return "fas fa-globe-europe"
            case ContextPrivacy.privateListed: return "fas fa-lock-open"
            case ContextPrivacy.privateUnlisted: return "fas fa-lock"
            default: return null
        }
    }
    export function titleForKey(key: ContextPrivacy) {
        return translate(`context.privacy.title.${key}`)
    }
    export function descriptionForKey(key: ContextPrivacy) {
        return translate(`context.privacy.description.${key}`)
    }
}
export enum ContextNaturalKey {
    GROUP = "group.group",
    COMMUNITY = "core.community",
    USER = "auth.user",
    PROJECT = "project.project",
    TASK = "project.task",
    EVENT = "event.event",
    NEWSFEED = "newsfeed",
    CONVERSATION = "conversation.conversation",
}
export namespace ContextNaturalKey {
    export const all = [
        ContextNaturalKey.GROUP,
        ContextNaturalKey.COMMUNITY,
        ContextNaturalKey.USER,
        ContextNaturalKey.PROJECT,
        ContextNaturalKey.EVENT,
        ContextNaturalKey.TASK,
        ContextNaturalKey.CONVERSATION
    ]
    export const getMembers = (key:ContextNaturalKey, contextObject:IdentifiableObject) => {
        if (!key && !contextObject)
            return []
        switch (key) {
            case ContextNaturalKey.EVENT: return (contextObject as Event).attending || []
            case ContextNaturalKey.GROUP: return (contextObject as Group).members || []
            case ContextNaturalKey.PROJECT: return (contextObject as Project).members || []
            case ContextNaturalKey.COMMUNITY: return (contextObject as Community).members || []
            default:
                if (!Settings.isProduction) console.warn(`${key} has no 'members' field`, contextObject);
                return []
        }
    }
    export function defaultAvatarForKey(key: ContextNaturalKey) {
        switch (key) {
            case ContextNaturalKey.GROUP: return Constants.resolveUrl(Constants.defaultImg.groupAvatar)()
            case ContextNaturalKey.COMMUNITY: return Constants.resolveUrl(Constants.defaultImg.communityAvatar)()
            case ContextNaturalKey.USER: return Constants.resolveUrl(Constants.defaultImg.userAvatar)()
            case ContextNaturalKey.PROJECT: return Constants.resolveUrl(Constants.defaultImg.projectAvatar)()
            case ContextNaturalKey.EVENT: return Constants.resolveUrl(Constants.defaultImg.eventAvatar)()
            default: return null
        }
    }
    export function iconClassForKey(key: ContextNaturalKey) {
        switch (key) {
            case ContextNaturalKey.GROUP: return "fas fa-users"
            case ContextNaturalKey.COMMUNITY: return "fas fa-globe"
            case ContextNaturalKey.USER: return "fas fa-user"
            case ContextNaturalKey.PROJECT: return "fas fa-clipboard-list"
            case ContextNaturalKey.EVENT: return "fas fa-calendar"
            case ContextNaturalKey.TASK: return "fas fa-tasks"
            default: return null
        }
    }
    export function fromSegmentKey(key: ContextSegmentKey) {
        switch (key) {
            case ContextSegmentKey.GROUP: return ContextNaturalKey.GROUP
            case ContextSegmentKey.COMMUNITY: return ContextNaturalKey.COMMUNITY
            case ContextSegmentKey.USER: return ContextNaturalKey.USER
            case ContextSegmentKey.PROJECT: return ContextNaturalKey.PROJECT
            case ContextSegmentKey.EVENT: return ContextNaturalKey.EVENT
            case ContextSegmentKey.TASK: return ContextNaturalKey.TASK
            case ContextSegmentKey.CONVERSATION: return ContextNaturalKey.CONVERSATION
            default: return null
        }
    }
    export function elasticTypeForKey(key: ContextNaturalKey) {
        switch (key) {
            case ContextNaturalKey.GROUP: return ElasticSearchType.GROUP
            case ContextNaturalKey.COMMUNITY: return ElasticSearchType.COMMUNITY
            case ContextNaturalKey.USER: return ElasticSearchType.USER
            case ContextNaturalKey.PROJECT: return ElasticSearchType.PROJECT
            case ContextNaturalKey.EVENT: return ElasticSearchType.EVENT
            case ContextNaturalKey.TASK: return ElasticSearchType.TASK
            default: return null
        }
    }
    export function descriptionForContextObject(key: ContextNaturalKey, contextObject: any) {
        switch (key) {
            case ContextNaturalKey.GROUP: return (contextObject as Group).description
            case ContextNaturalKey.COMMUNITY: return (contextObject as Community).description
            case ContextNaturalKey.USER: return (contextObject as UserProfile).username
            case ContextNaturalKey.PROJECT: return (contextObject as Project).description
            case ContextNaturalKey.EVENT: return (contextObject as Event).description
            case ContextNaturalKey.TASK: return (contextObject as Task).description
            case ContextNaturalKey.CONVERSATION: return (contextObject as Conversation).users.length + translate("common.members")
            default: return null
        }
    }
    export function nameForContextObject(key: ContextNaturalKey, contextObject: Permissible & IdentifiableObject & Linkable, includeAncestor?: boolean) {
        switch (key) {
            case ContextNaturalKey.GROUP:
                {
                    const obj = contextObject as Group
                    if (includeAncestor) {
                        const community = CommunityManager.getCommunityById(obj.community)
                        if (community) {
                            return obj.name + " - " + community.name
                        }
                    }
                    return obj.name
                }

            case ContextNaturalKey.COMMUNITY: return (contextObject as Community).name
            case ContextNaturalKey.USER: return userFullName((contextObject as UserProfile))
            case ContextNaturalKey.PROJECT:
                {
                    const obj = contextObject as Project
                    if (includeAncestor) {
                        const community = CommunityManager.getCommunityById(obj.community)
                        if (community) {
                            return obj.name + " - " + community.name
                        }
                    }
                    return obj.name
                }
            case ContextNaturalKey.EVENT:
                {
                    const obj = contextObject as Event
                    if (includeAncestor) {
                        const community = CommunityManager.getCommunityById(obj.community)
                        if (community) {
                            return obj.name + " - " + community.name
                        }
                    }
                    return obj.name
                }
            case ContextNaturalKey.TASK:
                {
                    const obj = contextObject as Task
                    if (includeAncestor) {
                        return obj.title + " - " + translate("common.project.project")//project.name
                    }
                    return obj.title
                }

            case ContextNaturalKey.CONVERSATION:
                {
                    const obj = contextObject as Conversation
                    return obj.title
                }

            default: return null
        }
    }
    export function coverForContextObject(key: ContextNaturalKey, contextObject: any, thumbnail: boolean = false) {
        switch (key) {
            case ContextNaturalKey.GROUP: return groupCover(contextObject as Group, thumbnail)
            case ContextNaturalKey.COMMUNITY: return communityCover(contextObject as Community, thumbnail)
            case ContextNaturalKey.USER: return userCover(contextObject as UserProfile, thumbnail)
            case ContextNaturalKey.PROJECT: return projectCover(contextObject as Project, thumbnail)
            case ContextNaturalKey.EVENT: return eventCover(contextObject as Event, thumbnail)
            case ContextNaturalKey.TASK: return null
            default: return null
        }
    }
}
export enum ContextSegmentKey {
    GROUP = "group",
    COMMUNITY = "community",
    USER = "profile",
    PROJECT = "project",
    TASK = "task",
    EVENT = "event",
    CONVERSATION = "conversation"
}
export namespace ContextSegmentKey {
    export function keyForNaturalKey(key: ContextNaturalKey) {
        switch (key) {
            case ContextNaturalKey.GROUP: return ContextSegmentKey.GROUP
            case ContextNaturalKey.COMMUNITY: return ContextSegmentKey.COMMUNITY
            case ContextNaturalKey.USER: return ContextSegmentKey.USER
            case ContextNaturalKey.PROJECT: return ContextSegmentKey.PROJECT
            case ContextNaturalKey.EVENT: return ContextSegmentKey.EVENT
            case ContextNaturalKey.TASK: return ContextSegmentKey.TASK
            case ContextNaturalKey.CONVERSATION: return ContextSegmentKey.CONVERSATION
            default: return null
        }
    }
    export const parse = (value: string): ContextSegmentKey | null => {
        switch (value) {
            case ContextSegmentKey.GROUP: return ContextSegmentKey.GROUP
            case ContextSegmentKey.COMMUNITY: return ContextSegmentKey.COMMUNITY
            case ContextSegmentKey.USER: return ContextSegmentKey.USER
            case ContextSegmentKey.PROJECT: return ContextSegmentKey.PROJECT
            case ContextSegmentKey.EVENT: return ContextSegmentKey.EVENT
            case ContextSegmentKey.TASK: return ContextSegmentKey.TASK
            case ContextSegmentKey.CONVERSATION: return ContextSegmentKey.CONVERSATION
            default: return null
        }
    }
}

export enum DraggableType {
    favorite = "favorite",
    group = "group.group"
}
export interface Verb {
    id: number
    infinitive: string
    past_tense: string
}
export type IdentifiableObject = {
    id: number
}
/* deprecated?
export interface SimpleNotification
{
    absolute_url:string
    actor:SimpleUserProfile
    extra:any
    message:string
    verb:Verb
}
*/
export type UnreadNotificationCounts = {
    community_invitations: number
    group_invitations: number
    event_invitations: number
    friendship_invitations: number
    unread_conversations: number
    status_notifications: number
    status_reminders: number
    status_attentions: number
    task_notifications: number
    task_reminders: number
    task_attentions: number
    reported_content: number
    community_requests: number
    group_requests: number
    event_requests: number
    total: number
}
export type RecentActivity =
    {
        id: number
        created_at: string
        updated_at: string
        verb: Verb
        is_seen: boolean
        is_read: boolean
        actor_count: number
        display_text: string
        extra: any
        absolute_url: string
        uri: string
        actors: number[]
        mentions: number[]
        notifications: UnreadNotificationCounts
    }
export type TempStatus = {
    text: string
    privacy: string
    files_ids: number[]
    link: string | null
    context_natural_key?: ContextNaturalKey
    context_object_id?: number
    parent: number,
    pending?: boolean
}
export enum ProjectSorting {
    recentActivity = "recent_activity",
    recent = "recent",
    mostUsed = "most_used",
    AtoZ = "alphabetically",
}
export namespace ProjectSorting {
    export const all = [
        ProjectSorting.recentActivity,
        ProjectSorting.recent,
        ProjectSorting.mostUsed,
        ProjectSorting.AtoZ,
    ]
    export function translatedText(type: ProjectSorting) {
        switch (type) {
            case ProjectSorting.recentActivity: return translate("common.sorting.recentActivity")
            case ProjectSorting.recent: return translate("common.sorting.recent")
            case ProjectSorting.mostUsed: return translate("common.sorting.mostUsed")
            case ProjectSorting.AtoZ: return translate("common.sorting.AtoZ")
            default: return "N/A"
        }
    }
    export function icon(type: ProjectSorting) {
        switch (type) {
            case ProjectSorting.recent: return "fas fa-user-clock"
            case ProjectSorting.mostUsed: return "fas fa-burn"
            default: return "fas fa-question"
        }
    }
}
export enum ConversationFilter {
    archived = "archived",
}
export namespace ConversationFilter {
    export const all = [
        ConversationFilter.archived,
    ]
    export function translatedText(type: ConversationFilter) {
        return translate("conversation.filter." + type)
    }
    export function icon(type: ConversationFilter) {
        switch (type) {
            case ConversationFilter.archived: return "fas fa-archive"
            default: return "fas fa-globe-europe"
        }
    }
}
export enum GroupSorting {
    recent = "recent",
    mostUsed = "most_used",
    AtoZ = "alphabetically",
}
export namespace GroupSorting {
    export const all = [
        GroupSorting.recent,
        GroupSorting.mostUsed,
        GroupSorting.AtoZ
    ]
    export function translatedText(type: GroupSorting) {
        switch (type) {
            case GroupSorting.recent: return translate("common.sorting.recent")
            case GroupSorting.mostUsed: return translate("common.sorting.mostUsed")
            case GroupSorting.AtoZ: return translate("common.sorting.AtoZ")
            default: return "N/A"
        }
    }
    export function icon(type: GroupSorting) {
        switch (type) {
            case GroupSorting.recent: return "fas fa-user-clock"
            case GroupSorting.mostUsed: return "fas fa-burn"
            default: return "fas fa-question"
        }
    }
}
//notifications
export enum ActivitySorting {
    recent = "recent",
    onlyUnseen = "only_unseen",
}
export namespace ActivitySorting {
    export const all = [
        ActivitySorting.recent,
        ActivitySorting.onlyUnseen,
    ]
    export function translatedText(type: ActivitySorting) {
        switch (type) {
            case ActivitySorting.recent: return translate("common.sorting.recent")
            case ActivitySorting.onlyUnseen: return translate("common.sorting.unSeen")
            default: return "N/A"
        }
    }
    export function icon(type: ActivitySorting) {
        switch (type) {
            case ActivitySorting.recent: return "fas fa-user-clock"
            case ActivitySorting.onlyUnseen: return "fas fa-eye-slash"
            default: return ""
        }
    }
}
export type NotificationObject = {
    type: NotificationGroupKey
    created_at: string
} & IdentifiableObject
export type InvitationNotification = {
    context_object: any
    invited_by: UserProfile
    message?: string
} & NotificationObject
export type StatusNotification = {
    level: number
    created_by: number
    context_natural_key?: ContextNaturalKey
    context_object_id?: number
    context_object: ContextObject
} & Linkable & NotificationObject
export enum TaskNotificationAction {
    UPDATED = "updated",
    ASSIGNED = "assigned",
    RESPONSIBLE = "responsible",
    VERIFICATION = "verification",
}
export type ReportNotification = {
    context_natural_key: ContextNaturalKey
    creator: UserProfile
    tags: string[]
} & Linkable & NotificationObject
export type TaskNotification = {
    user: number
    created_by: number
    title: string
    action: TaskNotificationAction
    project: Project
} & Linkable & NotificationObject
export type AttentionNotification = {
    created_by: number
    created_at: string
    message?: string
} & Linkable & NotificationObject
export type ReviewNotification = {
    name: string
    community: Community
    creator: UserProfile
    created_at: string
    uri: string
    permission: number
} & NotificationObject
export type ReminderNotification = {
    datetime: string
} & AttentionNotification
export type MembershipRequestNotification = {
    context_object: IdentifiableObject & Linkable & AvatarAndCover & { name: string }
    request_by: UserProfile
} & NotificationObject
export enum NotificationGroupKey {
    COMMUNITY_INVITATIONS = "community_invitations",
    GROUP_INVITATIONS = "group_invitations",
    EVENT_INVITATIONS = "event_invitations",
    FRIENDSHIP_INVITATIONS = "friendship_invitations",

    UNREAD_CONVERSATIONS = "unread_conversations",

    TASK_NOTIFICATIONS = "task_notifications",
    TASK_REMINDERS = "task_reminders",
    TASK_ATTENTIONS = "task_attentions",

    STATUS_NOTIFICATIONS = "status_notifications",
    STATUS_REMINDERS = "status_reminders",
    STATUS_ATTENTIONS = "status_attentions",

    GROUP_UNDER_REVIEW = "group_reviews",
    EVENT_UNDER_REVIEW = "event_reviews",
    PROJECT_UNDER_REVIEW = "project_reviews",

    REPORTED_CONTENT = "reported_content",

    COMMUNITY_REQUESTS = "community_requests",
    GROUP_REQUESTS = "group_requests",
    EVENT_REQUESTS = "event_requests",
}
export type ConversationNotification = Conversation & NotificationObject
export type UnhandledNotifications = {
    //invitations
    community_invitations: InvitationNotification[]
    group_invitations: InvitationNotification[]
    event_invitations: InvitationNotification[]
    friendship_invitations: InvitationNotification[]

    unread_conversations: ConversationNotification[]

    status_notifications: StatusNotification[]
    status_reminders: ReminderNotification[]
    status_attentions: AttentionNotification[]

    task_notifications: TaskNotification[]
    task_reminders: ReminderNotification[]
    task_attentions: AttentionNotification[]

    group_reviews: ReviewNotification[]
    event_reviews: ReviewNotification[]
    project_reviews: ReviewNotification[]

    reported_content: ReportNotification[]
    //requests
    community_requests: MembershipRequestNotification[]
    group_requests: MembershipRequestNotification[]
    event_requests: MembershipRequestNotification[]
}
export type ContextObject = {
    name: string
} & Linkable & IdentifiableObject
export type Status = {
    //[key: string]: any
    can_comment: boolean
    children: Status[]
    children_ids: number[]
    comments: number
    community?: ICommunity
    context_object: ContextObject
    created_at: string
    edited_at: string
    files: UploadedFile[]
    id: number
    uid: number
    reactions: { [id: string]: number[] }
    reaction_count: number
    owner: UserProfile
    permission_set: number[]
    poll: any
    read: boolean
    read_by: number[]
    updated_at: string
    serialization_date: string
    extra?: string
    highlights?: { [id: string]: [string] }
    attributes: SimpleObjectAttribute[]
    temporary: boolean
    visibility?: number[]
    level?: number
    position: number
    highlightMode?: boolean
} & TempStatus & Permissible

export interface FileUpload {
    file: File
    progress: number
    name: string
    size: number
    type: string
    error: string | null
    fileId?: number
    id:string
}

export class Message {
    id!: number
    pending?: boolean
    uid!: string
    user!: number
    conversation!: number
    text!: string
    attachment: any
    created_at!: string
    updated_at!: string
    read_by!: number[]
    mentions!: number[]
    files?: UploadedFile[]
    tempFiles?: FileUpload[]
    error?: string
}
export enum Permission {
    none = 0,
    list = 10,
    read = 11,
    interact = 12,
    post = 13,
    limited_write = 20,
    write = 21,
    moderate = 40,
    admin = 50,
    update = 70,
    superuser = 99,
}
export namespace Permission {

    export function usesElevatedPrivileges(permission: Permission) {
        return permission == Permission.moderate || permission == Permission.admin || permission == Permission.superuser
    }
    export function getShield(permission: Permission) {
        return Permission.usesElevatedPrivileges(permission) ? "fas fa-shield-alt" : undefined
    }
    export function hasAccess(permissible: Permissible, minimumRequiredPermission:Permission) {
        return permissible.permission >= minimumRequiredPermission
    }
}
export type GenericElasticResult = {
    object_type: ElasticSearchType
    django_id: number
    created_at: string
    uri: string
    highlights: { [key: string]: string[] }
}
export type ElasticResultCreator = {
    user_id: number
    user_name: string
    profile_uri: string
    profile_avatar: string
}
export type ElasticResultCommunity = {
    avatar: string
    cover: string
    description: string
    members: number[]
    name: string
    slug: string
} & GenericElasticResult & ElasticResultCreator
export type ElasticResultGroup = {
    is_parent: boolean
    parent_id: number
    community: number
    slug: string
} & GenericElasticResult & ElasticResultCommunity
export type ElasticResultProject = {
    avatar: string
    cover: string
    community: number
    description: string
    has_documents: boolean
    members: number[]
    name: string
    slug: string
} & GenericElasticResult & ElasticResultCreator
export type ElasticResultTask = {
    community: number
    project_id: number
    responsible_id: number
    responsible_name: string
    title: string
    description: string
    has_documents: boolean
    is_parent: boolean
    parent_id: number
    slug: string
} & GenericElasticResult & ElasticResultCreator
export type ElasticResultEvent = {
    avatar: string
    cover: string
    community: number
    name: string
    description: string
    members: number[]
    is_parent: boolean
    parent_id: number
    slug: string
    start_date: string
    end_date: string
} & GenericElasticResult & ElasticResultCreator
export type ElasticResultFile = {
    filename: string
    file: string
    type: UploadedFileType
    extension: string
    thumbnail: string
    image_width: number
    image_height: number
    size: number
    image?: string
    context_natural_key: ContextNaturalKey
    context_object_id: number
    status_id:number
    community:number
    conversation:number
} & GenericElasticResult & ElasticResultCreator
export type ElasticResultStatus = {
    has_documents: boolean
    is_root_node: boolean
    parent_id: number
    text: string
    context_natural_key: ContextNaturalKey
    context_object_id: number
} & GenericElasticResult & ElasticResultCreator
export type ElasticResultUser = {
    avatar: string
    biography: string
    cover: string
    slug: string
    user_name: string
} & GenericElasticResult
export enum ElasticSearchType {
    GROUP = "Group",
    COMMUNITY = "Community",
    USER = "User",
    PROJECT = "Project",
    TASK = "Task",
    EVENT = "Event",
    STATUS = "Status",
    UPLOADED_FILE = "UploadedFile"
}
export type ElasticSearchBucket = {
    key: string
    doc_count: number
}
export type ElasticSearchBucketAggregation = {
    buckets: ElasticSearchBucket[]
    doc_count_error_upper_bound: number
    sum_other_doc_count: number
}
export namespace ElasticSearchType {

    export function contextNaturalKeyForType(key: ElasticSearchType):ContextNaturalKey {
        switch (key) {
            case ElasticSearchType.GROUP: return ContextNaturalKey.GROUP
            case ElasticSearchType.COMMUNITY: return ContextNaturalKey.COMMUNITY
            case ElasticSearchType.USER: return ContextNaturalKey.USER
            case ElasticSearchType.PROJECT: return ContextNaturalKey.PROJECT
            case ElasticSearchType.EVENT: return ContextNaturalKey.EVENT
            case ElasticSearchType.TASK: return ContextNaturalKey.TASK
            default: return null
        }
    }
    export function iconClassForKey(key: ElasticSearchType) {
        switch (key) {
            case ElasticSearchType.GROUP: return "fas fa-users"
            case ElasticSearchType.COMMUNITY: return "fas fa-globe"
            case ElasticSearchType.USER: return "fas fa-user"
            case ElasticSearchType.PROJECT: return "fas fa-clipboard-list"
            case ElasticSearchType.EVENT: return "fas fa-calendar"
            case ElasticSearchType.TASK: return "fas fa-tasks"
            case ElasticSearchType.UPLOADED_FILE: return "fas fa-file"
            case ElasticSearchType.STATUS: return "fas fa-rss"
            default: return null
        }
    }
    export function nameForKey(key: ElasticSearchType) {
        return translate("elasticsearch.type.name." + key)
    }
    export function nameSingularForKey(key: ElasticSearchType) {
        return translate("elasticsearch.type.name.s1." + key)
    }
}
export type SimpleObjectAttribute = {
    attribute: ObjectAttributeType
    datetime: string
    extra_data: string
    id: number
}
export type ObjectAttribute = {
    created_at: string
    created_by: number
    user: number
} & SimpleObjectAttribute
export type StatusObjectAttribute = {
    status: number
} & ObjectAttribute
export type TaskObjectAttribute = {
    task: number
} & ObjectAttribute
export type ReportTag = { value: string, label: string }
export type ReportResult = {
    context_natural_key: ContextNaturalKey
    context_object_id: number
    created_at: string
    creator: number
    description: string
    id: number
    moderated_at: string
    moderator: number
    tags: string[]
}
export type SearchHistory = { id: number, term: string }
export enum ObjectAttributeType {
    important = "important",
    reminder = "reminder",
    attention = "attn",
    pinned = "pinned",
    follow = "follow",
    link = "link",
}
export namespace ObjectAttributeType {
    export function translatedText(type: ObjectAttributeType) {
        return translate("newsfeed.sorting." + type)
    }
    export function iconForType(type: ObjectAttributeType, active = false) {
        switch (type) {
            case ObjectAttributeType.important: return active ? "fas fa-star" : "far fa-star"
            case ObjectAttributeType.reminder: return active ? "far fa-clock" : "far fa-clock"
            case ObjectAttributeType.attention: return active ? "fas fa-exclamation-triangle" : "fas fa-exclamation-triangle"
            case ObjectAttributeType.pinned: return active ? "fas fa-thumbtack" : "fas fa-thumbtack"
            case ObjectAttributeType.follow: return active ? "far fa-bell-slash" : "far fa-bell"
            case ObjectAttributeType.link: return active ? "fas fa-link" : "fas fa-link"
            default: return "fas fa-globe-europe"
        }
    }
}
export type ContextItem = {
    label: string
    id: number
    image?: string
    type: ContextNaturalKey
}
export type ContextGroup = {
    items: ContextItem[]
    type: ContextNaturalKey
}
export type CalendarItem = {

    object_type:string
    created_at:string
    updated_at:string
    hidden:boolean
    hidden_reason:string
    title:string
    slug:string
    description:string
    all_day:boolean
    start:string
    end:string
    timezone:string
    user:number
} & IdentifiableObject & Linkable

export enum UploadedFileType {
    IMAGE = "image",
    IMAGE360 = "360photo",
    DOCUMENT = "document",
    VIDEO = "video",
    AUDIO = "audio",
}
export namespace UploadedFileType {
    export function parseFromMimeType(mimeType: string) {
        const mime = mimeType.toLowerCase()
        if (mime.indexOf(UploadedFileType.IMAGE) > -1)
            return UploadedFileType.IMAGE
        if (mime.indexOf(UploadedFileType.VIDEO) > -1)
            return UploadedFileType.VIDEO
        if (mime.indexOf(UploadedFileType.AUDIO) > -1)
            return UploadedFileType.AUDIO
        return UploadedFileType.DOCUMENT
    }
}
export type UploadedFile =
    {
        user: number
        filename: string
        file: string
        type: UploadedFileType
        extension: string
        image: string
        image_width: number
        image_height: number
        thumbnail: string
        size: number
        created_at: string
        //extensions
        tempId?: number | string
        custom?: boolean
        uploadProgress?: number
        uploading?: boolean
        uploaded?: boolean
        hasError?: boolean

    } & IdentifiableObject

type FileIcon = { name: string, color: string }
export const fileIcon = (file: UploadedFile) => {
    switch (file.type) {
        case UploadedFileType.AUDIO: return audioIcon(file.extension)
        case UploadedFileType.VIDEO: return videoIcon(file.extension)
        case UploadedFileType.DOCUMENT: return documentIcon(file.extension)
        case UploadedFileType.IMAGE: return imageIcon(file.extension)
        default: return documentIcon(file.extension)
    }
}
export const videoIcon = (extension: string): FileIcon => {
    switch (extension) {
        default: return { name: "file-video", color: "#A63636" }
    }
}
export const audioIcon = (extension: string): FileIcon => {
    switch (extension) {
        default: return { name: "file-audio", color: "#FFD00C" }
    }
}
export const imageIcon = (extension: string): FileIcon => {
    switch (extension) {
        default: return { name: "file-image", color: "#029555" }
    }
}
export const documentIcon = (extension: string): FileIcon => {
    switch (extension) {
        case "pptx":
        case "ppt":
        case "odp": return { name: "file-powerpoint", color: "#FF8D52" }

        case "pdf": return { name: "file-pdf", color: "#FF5656" }

        case "doc":
        case "docx":
        case "txt":
        case "rtf":
        case "odt": return { name: "file-word", color: "#547980" }

        case "xlsx":
        case "xls":
        case "ods": return { name: "file-excel", color: "#6abe67" }

        default: return { name: "file-alt", color: "#4A87EC" }
    }
}

export type Permissible = {
    permission: number
}
export type INotifiable = {
    muted: boolean
}
export type Linkable = {
    uri: string
}
export type AvatarAndCover = {

    avatar: string
    avatar_thumbnail: string
    cover: string
    cover_cropped: string
    cover_thumbnail: string
}
export type Conversation =
{
    title: string
    users: number[]
    archived_by?: number[]
    last_message: Message
    read_by: any[]
    absolute_url?: string
    created_at: string
    updated_at: string
    unread_messages: number[]
    temporary?: boolean
    temporary_id?:number
    private?:boolean
    admins?:number[]

} & Linkable & IdentifiableObject & Permissible
export type IPrivacy = {
    privacy: ContextPrivacy
}
export type ICommunity = {
    cover_thumbnail: string
    avatar_thumbnail: string
    deactivated: boolean
    name: string
    slug_name: string
    primary_color: string
    secondary_color: string
    chapters?: boolean
    creator:number
} & Linkable & IdentifiableObject
export type IMembershipStatus = {
    invited:boolean
    pending:boolean
}
export type ContextInvitation = {
    created_at: string
    target_user:number
    user:number
    moderator:boolean
    event:number
} & IdentifiableObject

export type CommunityInvitation = {
    created_at: string
    community:number
    message:string
    language:AppLanguage
    email:string
    user:number
} & IdentifiableObject
export type Community = {
    members: number[]
    relationship: any
    description: string
    updated_at: string
    visit_count:number
    last_visited:string
    category:CommunityCategory
    //
    event_creation_permission:CommunityCreatePermission
    group_creation_permission:CommunityCreatePermission
    project_creation_permission:CommunityCreatePermission
    subgroup_creation_permission:CommunityCreatePermission
    //
} & INotifiable & ICommunity & AvatarAndCover & Permissible & IPrivacy & IMembershipStatus

export type SimpleUserProfile = {
    absolute_url: string,
    avatar: string,
    first_name: string,
    last_name: string,
} & IdentifiableObject
export type ProfileConnections = {
    count: number
    ids: number[]
}
export type UserProfile = {
    email: string | null
    locale: AppLanguage
    theme?: string
    timezone: string | null
    username: string
    uuid: string | null
    user_status: UserStatus
    biography: string
    slug_name: string
    relationship?: RelationshipStatus[]
    mutual_friends?: number[]
    last_seen?: number
    is_anonymous: boolean
    is_staff: boolean
    is_superuser: boolean
    connections?: number[]
    active_community?: number
    mutual_contacts: ProfileConnections
    unresolved_time?:string
} & SimpleUserProfile & AvatarAndCover & Linkable & Permissible

export type Group = {
    name: string
    slug: string
    community: number
    description: string
    creator: number
    members: number[]
    members_count: number
    created_at: string
    parent: number
    subgroups: number
    updated_at: string
    hidden_reason: ObjectHiddenReason
} & INotifiable & AvatarAndCover & Linkable & Permissible & IdentifiableObject & IPrivacy & IMembershipStatus

export type Favorite = {
    index: number
    object_natural_key: ContextNaturalKey
    image: string
    object: ContextObject
    object_id: number
} & IdentifiableObject
export class Coordinate {
    lat: number
    long: number
    static equals(a: Coordinate, b: Coordinate): boolean {
        if((!a && b) || (a && !b))
            return false
        return (!a && !b) || ( a.lat == b.lat && a.long == b.long)
    }
    static isValid(coordinate: Coordinate): boolean {
        if(!coordinate)
            return false
        return coordinate.lat > 0 && coordinate.long > 0
    }
}
export type Event = {
    name: string
    slug: string
    community: number
    description: string
    creator: number
    attending: number[]
    attending_count: number
    not_attending: number[]
    not_attending_count: number
    invited_count: number
    created_at: string
    group: ContextObject
    updated_at: string
    start: string
    end: string
    location: Coordinate
    address: string
    parent: Event
    sessions: number
    hidden_reason: ObjectHiddenReason
} & INotifiable & AvatarAndCover & Linkable & Permissible & IdentifiableObject & IPrivacy & IMembershipStatus

export type Project = {
    name: string
    slug: string
    community: number
    description: string
    creator: number
    tasks: number
    tags: string[]
    managers: number[]
    members: number[]
    members_count: number
    created_at: string
    group: ContextObject
    updated_at: string
    task_count: number
    tasks_assigned: number
    tasks_attention: number
    tasks_completed: number
    tasks_responsible: number
    hidden_reason: ObjectHiddenReason
    is_private:boolean
} & INotifiable & AvatarAndCover & Linkable & Permissible & IdentifiableObject & IPrivacy

export type TimeSpent = {
    hours: number
    minutes: Number
}

export type Task = {
    id: number
    updated_at: string
    project: number
    title: string
    description: string
    last_change_by: number
    absolute_url: string
    category: string
    creator: number
    responsible?: number
    assigned_to?: number[]
    priority: TaskPriority
    state: TaskState
    spent_time: TimeSpent
    serialization_date: string
    visibility?: number[]
    attributes?: TaskObjectAttribute[]
    due_date:string
} & Linkable & Permissible & IdentifiableObject

export enum TaskPriority {
    low = "low",
    medium = "medium",
    high = "high",
}
export namespace TaskPriority {
    export const all = [
        TaskPriority.low,
        TaskPriority.medium,
        TaskPriority.high,
    ]
    export function colorForPriority(type: TaskPriority) {
        switch (type) {
            case TaskPriority.low: return "info"
            case TaskPriority.medium: return "warning"
            case TaskPriority.high: return "danger"
            default: return null
        }
    }
}
export enum TaskState {
    notStarted = "not-started",
    progress = "progress",
    toVerify = "to-verify",
    notApplicable = "not-applicable",
    completed = "completed"
}
export namespace TaskState {
    export const all = [
        TaskState.notStarted,
        TaskState.progress,
        TaskState.toVerify,
        TaskState.completed,
        TaskState.notApplicable,
    ]
    export function colorForState(type: TaskState) {
        switch (type) {
            case TaskState.notStarted: return "secondary"
            case TaskState.progress: return "info"
            case TaskState.toVerify: return "warning"
            case TaskState.completed: return "success"
            case TaskState.notApplicable: return "light"
            default: return null
        }
    }
}
function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
    return o.reduce((res, key) => {
        res[key] = key;
        return res;
    }, Object.create(null));
}
export enum StatusReaction {
    LIKE = "like",
    HEART = "heart",
    SAD = "sad",
    JOY = "joy",
    DISLIKE = "dislike",
    COMPLETE = "complete"
}
export enum StatusReactionStyle {
    emoji, icon
}
export interface StatusReactionProps {
    reaction: StatusReaction
    onClick?: (event: any) => void
    large: boolean
    showBackground?: boolean
    style?: React.CSSProperties
    innerRef?: any
    selected: boolean
    reactionStyle?: StatusReactionStyle
}
export abstract class StatusReactionUtilities {
    public static parseStatusReaction = (reaction: string): StatusReaction => {
        switch (reaction) {
            case StatusReaction.JOY: return StatusReaction.JOY
            case StatusReaction.HEART: return StatusReaction.HEART
            case StatusReaction.SAD: return StatusReaction.SAD
            case StatusReaction.DISLIKE: return StatusReaction.DISLIKE
            case StatusReaction.COMPLETE: return StatusReaction.COMPLETE
            default: return StatusReaction.LIKE
        }
    }
    public static reactionsList = (): StatusReaction[] => {
        var arr = []
        for (var n in StatusReaction) {
            if (typeof StatusReaction[n] === 'string') {
                arr.push(StatusReaction[n]);
            }
        }
        return arr.map(s => StatusReactionUtilities.parseStatusReaction(s))
    }
    public static classNameForReactionContainer = (props: StatusReactionProps) => {
        return "emoji-reaction-container" + (props.large ? " large" : "")
    }
    public static emojiForReaction = (props: StatusReactionProps) => {
        const reactionStyle = props.reactionStyle || StatusReactionStyle.emoji
        switch (props.reaction) {
            case StatusReaction.SAD: return <span className={StatusReactionUtilities.classNameForReactionContainer(props)} onClick={props.onClick}>
                <Emoji symbol="😔" label={props.reaction} />
            </span>
            case StatusReaction.JOY: return <span className={StatusReactionUtilities.classNameForReactionContainer(props)} onClick={props.onClick}>
                <Emoji symbol="😂" label={props.reaction} />
            </span>
            case StatusReaction.HEART: return <span className={StatusReactionUtilities.classNameForReactionContainer(props)} onClick={props.onClick}>
                <Emoji symbol="❤️" label={props.reaction} />
            </span>
            case StatusReaction.DISLIKE: return <span className={StatusReactionUtilities.classNameForReactionContainer(props)} onClick={props.onClick}>
                <Emoji symbol="👎" label={props.reaction} />
            </span>
            case StatusReaction.COMPLETE: return <span className={StatusReactionUtilities.classNameForReactionContainer(props)} onClick={props.onClick}>
                <Emoji symbol="✔️" label={props.reaction} />
            </span>
            case StatusReaction.LIKE: return <span className={StatusReactionUtilities.classNameForReactionContainer(props)} onClick={props.onClick}>
                {reactionStyle == StatusReactionStyle.emoji && <Emoji symbol="👍" label={props.reaction} />}
                {reactionStyle == StatusReactionStyle.icon && <i className="far fa-thumbs-up"></i>}
            </span>
        }
    }
    public static Component = (props: StatusReactionProps) => {
        return StatusReactionUtilities.emojiForReaction(props)
    }
}
export enum AvatarStatusColor {
    GREEN = "#01d100",
    ORANGE = "orange",
    RED = "red",
    GRAY = "gray",
    NONE = "inherit",
}
export enum UserStatus {
    active = "active",
    away = "away",
    unavailable = "unavailable",
    dnd = "dnd",
    vacation = "vacation",
    invisible = "invisible",
}
export type UserStatusItem = {
    type: UserStatus
    color: AvatarStatusColor
    translation: () => string
}
const UserStatusObjects: { [key: string]: UserStatusItem } = {
    active: { type: UserStatus.active, color: AvatarStatusColor.GREEN, translation: () => UserStatus.getTranslation(UserStatus.active) },
    away: { type: UserStatus.away, color: AvatarStatusColor.ORANGE, translation: () => UserStatus.getTranslation(UserStatus.away) },
    unavailable: { type: UserStatus.unavailable, color: AvatarStatusColor.NONE, translation: () => UserStatus.getTranslation(UserStatus.unavailable) },
    dnd: { type: UserStatus.dnd, color: AvatarStatusColor.RED, translation: () => UserStatus.getTranslation(UserStatus.dnd) },
    vacation: { type: UserStatus.vacation, color: AvatarStatusColor.GRAY, translation: () => UserStatus.getTranslation(UserStatus.vacation) },
    invisible: { type: UserStatus.invisible, color: AvatarStatusColor.NONE, translation: () => UserStatus.getTranslation(UserStatus.invisible) },
}
export namespace UserStatus {

    export function getObject(status: UserStatus) {
        return UserStatusObjects[status] || UserStatusObjects[UserStatus.invisible]
    }
    export function getTranslation(status: UserStatus) {
        return translate("user.status." + status)
    }
    export function getSelectableStates(excludes?: UserStatus[]) {
        let selectables = [UserStatus.active, UserStatus.dnd, UserStatus.vacation, UserStatus.invisible]
        if (excludes)
            selectables = selectables.filter(s => !excludes.contains(s))
        return selectables.map(s => UserStatusObjects[s])
    }
}
//DASHBOARD
export type Module = {
    id: number
    name: string
    type: string
    disabled: boolean
    properties: Object
    parent?:GridColumn
}
export type GridColumn = {
    id: number
    module: Module
    width: number
    children: GridColumn[]
    index: number
    sticky?: boolean
    tabbed_layout?: boolean
    parent?:GridColumn
}
export type GridColumns = {
    id: number
    columns: GridColumn[]
    title: string
    min_width: number
    fill: boolean
}
export type Dashboard = {
    id: number
    grid_layouts: GridColumns[]
    created_at: string
    updated_at: string
    hidden: boolean
    hidden_reason: ObjectHiddenReason
    position: number
    title: string
    slug: string
    user: number
    category: string
}
//DASHBOARD END


export type VersionInfo = {
    major_version: number
    minor_version: number
    version_string: string
    release_date: string
}

export type Version = {
    major: number,
    minor: number,
    revision: number,
    version_string: string
}

export type Timesheet = {
    id: number
    created_at: string
    updated_at: string
    user: SimpleUserProfile
    date: string
    hours: number
    minutes: number
    description: string
    project: number
    task: number
    task_title: string
} & Permissible & Linkable
export interface EmbedMedia {
    height: number
    width: number
    type: string
    html: string
}
export type EmbedImage = {

    caption: string,
    height: number,
    width: number,
    size: number,
    url: string
}
export interface EmbedCardItem {
    key: string
    url: string
    provider_url: string
    provider_display: string
    original_url: string
    description: string
    title: string
    favicon_url: string
    images: EmbedImage[]
    media: EmbedMedia
    error_code: number
    type: string
    avatar: string
    subtitle: string
    internal?: boolean
}
export enum TaskActions {
    /**Changes priority for Task: extra:{priority:TaskPriority} */
    setPriority,
    setState,
    /**add time to Task: extra:{description:string, date:moment.Moment, hours:number, minutes:number} */
    addTime,
    /**Creates a new Status: extra:{message:string, mentions?:number[], files?:UploadedFile[], completion?:(success:boolean) => void} */
    addStatus,

}
export enum StatusActions {
    /**Navigates to the context of the current status (context_natural_key and context_object_id), i.e "group.group" or "core.community" ... and the the corresponding object id */
    context = 0,
    /**Navigates to the community of the current status: extra:{} */
    community = 1,
    /**Navigates to User profile for the current status or the profile in extra field: extra:{profile?:UserProfile} */
    user = 3,
    /**Navigates to a browser component that loads the "link": extra:{link:string} */
    link = 4,
    /**Sends a reaction to the server: extra:{reaction:string|null} */
    react = 5,
    /**Creates a new comment: extra:{message:string, mentions?:number[], files?:UploadedFile[], completion?:(success:boolean) => void} */
    new = 6,
    /**Edits a status: extra:{status:Status, files?:UploadedFile[], completion?:(success:boolean) => void} */
    edit = 7,
    /** NOOP extra:{} */
    delete = 8,
    /** NOOP extra:{} */
    reactionsCount = 9,
    /** NOOP extra:{} */
    file = 10,
    /**Navigates to an intrasocial link that loads "link": extra:{link:string} */
    intrasocial_link = 11,
    /**Navigates to a status; extra:{status:number} */
    status = 12,
    /**Navigates to a search page; extra:{query:string} */
    search,
    /**creates an attribute on status; extra:{type:ObjectAttributeType, user?:number} */
    createAttribute,
    /**deletes an attribute on status; extra:{id:number} */
    deleteAttribute,
    /**activates reply box for comments; extra:{id:number}, where id = status_id */
    showCommentReply,

}
