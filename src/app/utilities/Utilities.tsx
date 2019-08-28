import { Settings } from './Settings';
import Embedly from '../components/general/embedly/Embedly';
const processString = require('react-process-string');
import Routes from './Routes';
import * as React from 'react';
import { UserProfile, Community, Project, Group, Event, Coordinate, SimpleUserProfile, ContextNaturalKey, AvatarAndCover, Permissible, IdentifiableObject, Linkable } from '../types/intrasocial_types';
import Constants from '../utilities/Constants';
import { translate } from '../localization/AutoIntlProvider';
import * as moment from 'moment-timezone';
import Link from '../components/general/Link';
import { Link as ReactLink } from 'react-router-dom';
import { ContextManager } from '../managers/ContextManager';
import IntraSocialMention from '../components/general/IntraSocialMention';
let timezone = moment.tz.guess()
export const getDomainName = (url: string) => {
    var url_parts = url.split("/")
    var domain_name_parts = url_parts[2].split(":")
    var domain_name = domain_name_parts[0]
    return domain_name
}
export const parseJSONObject = (param: string) => {
    try {
        const data = JSON.parse(param)
        if (typeof data == "object")
            return data
    } catch (e) {
        return null
    }
    return null
}

export function userFullName(user: SimpleUserProfile | UserProfile, fallback?: string) {
    if (!user) {
        if (fallback !== undefined)
            return fallback
        return "Anonymous"
    }
    if (user.first_name) {
        return `${user.first_name} ${user.last_name}`;
    }
    const un = (user as UserProfile).username
    if (un)
        return un
    if (fallback !== undefined)
        return fallback
    return "No name";
}
export function isAdmin(user: UserProfile) {
    return user && (user.is_superuser || user.is_staff)
}
export function communityName(community: Community) {
    return (community && community.name) || translate("community.active.empty")
}

export function userAvatar(user: UserProfile, thumbnail = false) {
    let val: string = null
    if (user)
        val = thumbnail ? user.avatar_thumbnail || user.avatar : user.avatar || user.avatar_thumbnail
    return val || Constants.resolveUrl(Constants.defaultImg.user)()
}
export function communityAvatar(community: Community, thumbnail = false) {
    let val: string = null
    if (community)
        val = thumbnail ? community.avatar_thumbnail || community.avatar : community.avatar || community.avatar_thumbnail
    return val || Constants.resolveUrl(Constants.defaultImg.communityAvatar)()
}
export function groupAvatar(group: Group, thumbnail = false) {
    let val: string = null
    if (group)
        val = thumbnail ? group.avatar_thumbnail || group.avatar : group.avatar || group.avatar_thumbnail
    return val || Constants.resolveUrl(Constants.defaultImg.groupAvatar)()
}
export function projectAvatar(project: Project, thumbnail = false) {
    let val: string = null
    if (project)
        val = thumbnail ? project.avatar_thumbnail || project.avatar : project.avatar || project.avatar_thumbnail
    return val || Constants.resolveUrl(Constants.defaultImg.projectAvatar)()
}
export function eventAvatar(event: Event, thumbnail = false) {
    let val: string = null
    if (event)
        val = thumbnail ? event.avatar_thumbnail || event.avatar : event.avatar || event.avatar_thumbnail
    return val || Constants.resolveUrl(Constants.defaultImg.eventAvatar)()
}
export function contextCover(contextObject: AvatarAndCover, thumbnail = false, contextNaturalKey?: ContextNaturalKey): string {
    let val: string = null
    if (contextObject)
        val = thumbnail ? contextObject.cover_thumbnail || contextObject.cover_cropped : contextObject.cover_cropped || contextObject.cover_thumbnail
    return val || (contextNaturalKey && contextDefaultAvatar(contextNaturalKey))
}
export function contextAvatar(contextObject: AvatarAndCover, thumbnail = false, contextNaturalKey?: ContextNaturalKey): string {
    let val: string = null
    if (contextObject)
        val = thumbnail ? contextObject.avatar_thumbnail || contextObject.avatar : contextObject.avatar || contextObject.avatar_thumbnail
    return val || (contextNaturalKey && contextDefaultAvatar(contextNaturalKey))
}
export function contextDefaultCover(contextNaturalKey: ContextNaturalKey) {
    switch (contextNaturalKey) {
        case ContextNaturalKey.COMMUNITY: return Constants.resolveUrl(Constants.defaultImg.community)()
        case ContextNaturalKey.EVENT: return Constants.resolveUrl(Constants.defaultImg.event)()
        case ContextNaturalKey.GROUP: return Constants.resolveUrl(Constants.defaultImg.group)()
        case ContextNaturalKey.PROJECT: return Constants.resolveUrl(Constants.defaultImg.project)()
        case ContextNaturalKey.USER: return Constants.resolveUrl(Constants.defaultImg.user)()
        default: return null
    }
}
export function contextDefaultAvatar(contextNaturalKey: ContextNaturalKey) {
    switch (contextNaturalKey) {
        case ContextNaturalKey.COMMUNITY: return Constants.resolveUrl(Constants.defaultImg.communityAvatar)()
        case ContextNaturalKey.EVENT: return Constants.resolveUrl(Constants.defaultImg.eventAvatar)()
        case ContextNaturalKey.GROUP: return Constants.resolveUrl(Constants.defaultImg.groupAvatar)()
        case ContextNaturalKey.PROJECT: return Constants.resolveUrl(Constants.defaultImg.projectAvatar)()
        case ContextNaturalKey.USER: return Constants.resolveUrl(Constants.defaultImg.userAvatar)()
        default: return null
    }
}
export function userCover(user: UserProfile, thumbnail = false) {
    let val: string = null
    if (user)
        val = thumbnail ? user.cover_thumbnail || user.cover_cropped : user.cover_cropped || user.cover_thumbnail
    return val || Constants.resolveUrl(Constants.defaultImg.user)()
}
export function communityCover(community: Community, thumbnail = false) {
    let val: string = null
    if (community)
        val = thumbnail ? community.cover_thumbnail || community.cover_cropped : community.cover_cropped || community.cover_thumbnail
    return val || Constants.resolveUrl(Constants.defaultImg.community)()
}
export function projectCover(project: Project, thumbnail = false) {
    let val: string = null
    if (project)
        val = thumbnail ? project.cover_thumbnail || project.cover_cropped : project.cover_cropped || project.cover_thumbnail
    return val || Constants.resolveUrl(Constants.defaultImg.project)()
}
export function groupCover(group: Group, thumbnail = false) {
    let val: string = null
    if (group)
        val = thumbnail ? group.cover_thumbnail || group.cover_cropped : group.cover_cropped || group.cover_thumbnail
    return val || Constants.resolveUrl(Constants.defaultImg.group)()
}
export function eventCover(event: Event, thumbnail = false) {
    let val: string = null
    if (event)
        val = thumbnail ? event.cover_thumbnail || event.cover_cropped : event.cover_cropped || event.cover_thumbnail
    return val || Constants.resolveUrl(Constants.defaultImg.event)()
}

export const coordinateIsValid = (coordinate: Coordinate) => {
    return coordinate && coordinate.lat && coordinate.lon
}
export enum DateFormat {
    date = "L LT",
    day = "L",
    time = "LT",
    monthYear = "MMM YYYY",
    serverDay = "YYYY-MM-DD",
    year = "YYYY"
}
export const stringToDateFormat = (string: string, format?: DateFormat) => {
    return moment(string).tz(timezone).format(format || DateFormat.date)
}
export const stringToDate = (string?: string) => {
    return moment(string).tz(timezone)
}
export const EMAIL_REGEX = /(\b\s+)(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gm
export const URL_REGEX = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim
export const URL_WWW_REGEX = /(^(\b|\s+)(www)\.[\S]+(\b|$))/gim
export const HASHTAG_REGEX = /(?:#)(\w(?:(?:\w|(?:\.(?!\.))){0,200}(?:\w))?)/ig
export const HASHTAG_REGEX_WITH_HIGHLIGHT = /(?:#)((?:\w|(?:<em>))(?:(?:(?:\w|(?:<\/em>))|(?:\.(?!\.))){0,200}(?:(?:\w|(?:<\/em>))))?)/ig
export const HASHTAG_REGEX_NO_GLOBAL = /\B#(\w[^\s]+)/i
export const TAG_REGEX = /(<([^>]+)>)/ig
export const IS_ONLY_LINK_REGEX = /^(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])$/i
export const LINEBREAK_REGEX = /\r?\n|\r/g
export const SENTENCES_REGEX = /[^\.!\?]+[\.!\?]+|[^\.!\?]+$/g
export const truncate = (text, maxChars) => {
    return text && text.length > (maxChars - 3) ? text.substring(0, maxChars - 3) + '...' : text;
}
export const MENTION_REGEX = new RegExp("@(" + ContextNaturalKey.all.map(s => s.replace(".", "\\.")).join("|") + "):(\\d+)(:([^.:]+):)?", 'g') 
export class MentionData{
    contextNaturalKey:ContextNaturalKey
    contextId:number
    contextObjectName?:string
    private contextObject:Permissible & IdentifiableObject & Linkable = null 
    originalString:string
    private constructor(contextNaturalKey:ContextNaturalKey, contextId:number,contextObjectName:string, originalString:string)
    {
        this.contextNaturalKey = contextNaturalKey
        this.contextId = contextId
        this.contextObjectName = contextObjectName
        this.originalString = originalString
    }
    static fromRegex = (regex:string[]) => {
        return new MentionData(regex[1] as ContextNaturalKey, parseInt(regex[2]), regex[4], regex[0])
    }
    getName = () => {
        const object = this.getContextObject()
        const name = object && ContextNaturalKey.nameForContextObject(this.contextNaturalKey, object as any) || this.contextObjectName || "Unknown"
        return name
    }
    getContextObject = () => {
        if(this.contextObject)
            return this.contextObject
        return this.contextObject = ContextManager.getStoreObject(this.contextNaturalKey, this.contextId)
    }
}
export function getTextContent(prefixId: string, text: string, includeEmbedlies: boolean, truncateLength: number = 0, linebreakLimit: number = 0) {
    var processed: any = null
    var config = []
    let embedlyArr: { [id: string]: JSX.Element } = {}
    let seed = 0
    const getKey = (key: string) => {
        return `${prefixId}_${key}_${seed++}`
    }
    const embedlies = {
        regex: URL_REGEX,
        fn: (key, result) => {
            if (includeEmbedlies) {
                embedlyArr[result[0]] = <Embedly renderOnError={false} key={getKey("embedly_" + result[0])} url={result[0]} />
            }
            return (<Link key={getKey("link_" + result[0])} title={result[0]} to={result[0]}>{truncate(result[0], 50)}</Link>)
        }
    }
    config.push(embedlies)
    if (Settings.searchEnabled) {
        const hashtags = {
            regex: HASHTAG_REGEX_WITH_HIGHLIGHT,
            fn: (key, result) => {
                const href = Routes.searchUrl(result[0])//result[1] == without #
                return (<ReactLink title={translate("search.for") + " " + result[0]} key={getKey("hashtag" + result[0])} to={{pathname:Routes.SEARCH, state:{modal:true}, search:"term=" + encodeURIComponent(result[0])}}>{result[0]}</ReactLink>)
            }
        }
        config.push(hashtags)
    }
    const breaks = {
        regex: LINEBREAK_REGEX,
        fn: (key, result) => {
            return (<br key={uniqueId()} />)
        }
    }
    config.push(breaks)
    const mentionSearch = {
        regex: MENTION_REGEX,
        fn: (key, result:string[]) => {
            const data = MentionData.fromRegex(result)
            return <IntraSocialMention key={getKey(key)} data={data} />
        }
    }
    config.push(mentionSearch)
    config = config.concat(mentionSearch)
    processed = processString(config)(text)
    const embedKeys = Object.keys(embedlyArr)
    let flatten = flattenElements(processed)
    let hasMore = false
    let length = 0
    if (truncateLength > 0) {
        const truncatedResult = truncateElements(flatten, truncateLength, linebreakLimit)
        flatten = truncatedResult.result
        hasMore = truncatedResult.rest.length > 0
        length = truncatedResult.length
    }
    const ret: { textContent: JSX.Element[], linkCards: JSX.Element[], hasMore: boolean, length:number } = { textContent: flatten, linkCards: [], hasMore, length }
    if (includeEmbedlies && embedKeys.length > 0) {
        ret.linkCards = embedKeys.map(k => embedlyArr[k])
    }
    return ret
}
export const flattenElements = (arr: any): JSX.Element[] => {
    if (typeof arr == "string" && !Array.isArray(arr)) {
        return arr as any
    }
    let result = []
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i]
        if (typeof item != "string" && Array.isArray(item)) {
            result = result.concat(flattenElements(item))
        }
        else {
            if (typeof item != "string" || item.length > 0)
                result.push(item)
        }
    }
    return result
}
const truncateElements = (arr: JSX.Element[], limit: number, linebreakLimit: number) => {
    let result: JSX.Element[] = []
    let rest: JSX.Element[] = []
    let banked = 0
    let linebreaks = 0
    const processLinebreaks = linebreakLimit > 0
    const bank = (item: any, length: number, ignoreIfEmpty = false, isLinebreak = false) => {
        if (!ignoreIfEmpty || length > 0) {
            if (processLinebreaks && isLinebreak) {
                linebreaks += 1
                if (linebreaks >= linebreakLimit)
                    done = true
            }
            if (done)
                rest.push(item)
            else {
                result.push(item)
                banked += length
                if (banked > limit)
                    done = true
            }
        }
    }
    let done = false
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i]
        if (done) {
            bank(item, 0, true)
        }
        if (typeof item == "string") {
            const str = item as string
            const len = str.length
            if (len + banked > limit) //too big, split string
            {
                const sentences = str.match(SENTENCES_REGEX)
                if (sentences && sentences.length > 0) {
                    for (let si = 0; si < sentences.length; si++) {
                        const sentence = sentences[si];
                        bank(sentence, sentence.length, true)
                    }
                }
                else {

                    bank(str, len, true)
                }
            }
            else {
                bank(str, len, true)
            }
        }
        else if (item.props && item.props.children && typeof item.props.children == "string")//must be type 'Text'
        {
            bank(item, item.props.children.length)
        }
        else {//must be type 'br'
            bank(item, 0, false, true)
        }
    }
    return { result, length: banked, rest }
}

/**
 * Maintaining Scroll Position When Adding Content to the Top of a Container
 * 
 * http://kirbysayshi.com/2013/08/19/maintaining-scroll-position-knockoutjs-list.html
 */
export function ScrollPosition(node: HTMLElement) {
    this.node = node;
    this.previousScrollHeightMinusTop = 0;
    this.readyFor = 'up';
}
ScrollPosition.prototype.restore = function () {
    if (this.readyFor === 'up') {
        this.node.scrollTop = this.node.scrollHeight - this.previousScrollHeightMinusTop;
    }

    // 'down' doesn't need to be special cased unless the
    // content was flowing upwards, which would only happen
    // if the container is position: absolute, bottom: 0 for
    // a Facebook private_messaging effect
}

ScrollPosition.prototype.prepareFor = function (direction) {
    this.readyFor = direction || 'up';
    this.previousScrollHeightMinusTop = this.node.scrollHeight - this.node.scrollTop;
}
export function cloneDictKeys(dict: {}) {
    let keys = Object.keys(dict)
    let newDict = {}
    keys.forEach(key => {
        newDict[key] = dict[key]
    })
    return newDict
}
export const nullOrUndefined = (any) => {
    return any === null || any === undefined
}
export const uniqueId = () => {
    return Math.random().toString(36).substr(2, 16);
}
export const filterArray = (array, text) => {
    var filteredArray = null;
    filteredArray = array.filter(object => {
        const query = text.toLowerCase();
        return object.toLowerCase().startsWith(query);
    });
    return filteredArray;
}
export const parseQueryString = (queryString:string) => {
	var dictionary = {};
	
	// remove the '?' from the beginning of the
	// if it exists
	if (queryString.indexOf('?') === 0) {
		queryString = queryString.substr(1);
	}
	
	// Step 1: separate out each key/value pair
	var parts = queryString.split('&amp;');
	
	for(var i = 0; i < parts.length; i++) {
		var p = parts[i];
		// Step 2: Split Key/Value pair
		var keyValuePair = p.split('=');
		
		// Step 3: Add Key/Value pair to Dictionary object
		var key = keyValuePair[0];
		var value = keyValuePair[1];
		
		// decode URI encoded string
		value = decodeURIComponent(value);
		value = value.replace(/\+/g, ' ');
		
		dictionary[key] = value;
	}
	
	// Step 4: Return Dictionary Object
	return dictionary;
}
export function compareObjects(o1: object, o2: object) {
    for (var p in o1) {
        if (o1.hasOwnProperty(p)) {
            if (o1[p] !== o2[p]) {
                return false;
            }
        }
    }
    for (var p in o2) {
        if (o2.hasOwnProperty(p)) {
            if (o1[p] !== o2[p]) {
                return false;
            }
        }
    }
    return true;
}

export const normalizeIndex = (selectedIndex, max) => {
    let index = selectedIndex % max;
    if (index < 0) {
        index += max;
    }
    return index;
}
export const shallowCompare = (obj1:Object, obj2:Object) =>
  Object.keys(obj1).length === Object.keys(obj2).length &&
  Object.keys(obj1).every(key => 
    obj2.hasOwnProperty(key) && obj1[key] === obj2[key]
  )
export const shallowCompareFields = (keys:string[], obj1:Object, obj2:Object) =>
    keys.every(key => 
        obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key) && obj1[key] === obj2[key]
  )