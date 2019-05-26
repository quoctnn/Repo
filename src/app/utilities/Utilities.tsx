import { Settings } from './Settings';
import Embedly from '../components/general/embedly/Embedly';
const processString = require('react-process-string');
import Routes from './Routes';
import * as React from 'react';
import { UserProfile, StatusActions, Community, Project, Group, Event, IntraSocialType, Coordinate, SimpleUserProfile } from '../types/intrasocial_types';
import {Text} from '../components/general/Text';
import Constants from '../utilities/Constants';
import { translate } from '../localization/AutoIntlProvider';
import { IntraSocialLink } from '../components/general/IntraSocialLink';
import * as moment from 'moment-timezone';
import Link from '../components/general/Link';
let timezone = moment.tz.guess()
export const getDomainName = (url:string) =>  {
    var url_parts = url.split("/")
    var domain_name_parts = url_parts[2].split(":")
    var domain_name = domain_name_parts[0]
    return domain_name
}
export const parseJSONObject = (param:string) => {
    try {
        const data = JSON.parse(param)
        if(typeof data == "object")
            return data
    } catch(e) {
        return null
    }
    return null
}

export function userFullName(user:SimpleUserProfile | UserProfile) {
    if(!user)
        return "Anonymous"
    if (user.first_name) {
        return `${user.first_name} ${user.last_name}`;
    }
    return (user as UserProfile).username || "No name";
}
export function isAdmin(user:UserProfile) {
    return user && (user.is_superuser || user.is_staff)
}
export function communityName(community:Community) {
    return (community && community.name) || translate("community.active.empty")
}

export function userAvatar(user:UserProfile, thumbnail = false) {
    return (user && (thumbnail ? user.avatar_thumbnail : user.avatar)) || Constants.resolveUrl( Constants.defaultImg.user )()
}
export function communityAvatar(community:Community, thumbnail = false) {
    return (community && (thumbnail ? community.avatar_thumbnail : community.avatar)) || Constants.resolveUrl(Constants.defaultImg.communityAvatar)()
}
export function groupAvatar(group:Group, thumbnail = false) {
    return (group && (thumbnail ? group.avatar_thumbnail : group.avatar)) || Constants.resolveUrl(Constants.defaultImg.groupAvatar)()
}
export function projectAvatar(project:Project, thumbnail = false) {
    return (project && (thumbnail ? project.avatar_thumbnail : project.avatar_thumbnail || project.avatar)) || Constants.resolveUrl(Constants.defaultImg.projectAvatar)()
}

export function userCover(user:UserProfile, thumbnail = false) {
    return (user && (thumbnail ? user.cover_thumbnail : user.cover_cropped || user.cover)) || Constants.resolveUrl(Constants.defaultImg.user)()
}
export function communityCover(community:Community, thumbnail = false) {
    return (community && (thumbnail ? community.cover_thumbnail : community.cover_cropped || community.cover)) || Constants.resolveUrl(Constants.defaultImg.community)()
}
export function projectCover(project:Project, thumbnail = false) {
    return (project && (thumbnail ? project.cover_thumbnail : project.cover_cropped || project.cover)) || Constants.resolveUrl(Constants.defaultImg.project)()
}
export function groupCover(group:Group, thumbnail = false) {
    return (group && (thumbnail ? group.cover_thumbnail : group.cover_cropped || group.cover)) || Constants.resolveUrl(Constants.defaultImg.group)()
}
export function eventCover(event:Event, thumbnail = false) {
    return (event && (thumbnail ? event.cover_thumbnail : event.cover_cropped || event.cover)) || Constants.resolveUrl(Constants.defaultImg.event)()
}
export const coordinateIsValid = (coordinate:Coordinate) => {
    return coordinate && coordinate.lat && coordinate.lon
}
export enum DateFormat {
    date = "L LT",
    day = "L", 
    time = "LT"
}
export const stringToDateFormat = (string:string, format?:DateFormat ) => {
    return moment(string).tz(timezone).format(format || DateFormat.date)
}
export const stringToDate = (string?:string) => {
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
    return text.length > (maxChars - 3) ? text.substring(0, maxChars - 3) + '...' : text;
}
export function getTextContent(prefixId:string, 
                                text:string, 
                                mentions:UserProfile[], 
                                includeEmbedlies:boolean, 
                                onLinkPress:(action:StatusActions, extra?:Object) => void, 
                                truncateLength:number = 0,
                                linebreakLimit:number = 0)
{
    var processed:any = null
    var config = []
    let embedlyArr:{[id:string]:JSX.Element} = {}
    let seed = 0
    const getKey = (key:string ) => {
        return `${prefixId}_${key}_${seed++}`
    }
    const embedlies = {
        regex: URL_REGEX,
        fn: (key, result) => 
        {
            if(includeEmbedlies)
            {
                embedlyArr[result[0]] = <Embedly renderOnError={false} key={getKey("embedly_" + result[0])} url={result[0]} />
            }
            return (<Link key={getKey("link_" + result[0])} title={result[0]} to={result[0]}>{truncate(result[0], 50 )}</Link>)
        }
    }
    config.push(embedlies)
    if (Settings.searchEnabled) {
        const hashtags = {
            regex: HASHTAG_REGEX_WITH_HIGHLIGHT,
            fn: (key, result) => 
            {
                const href = Routes.searchUrl(result[0])//result[1] == without #
                return (<Text title={translate("search.for") + " " +  result[0]} key={getKey("hashtag" + result[0])} href={href}>{result[0]}</Text>)
            }
        }
        config.push(hashtags)
    }
    const breaks = {
        regex: LINEBREAK_REGEX,
        fn: (key, result) => 
        {
            return (<br key={uniqueId()} />)
        }
    }
    config.push(breaks)
    const mentionSearch = mentions.map(user => {
        return {
            regex:new RegExp("@" + user.username.replace("+","\\+"), 'g'),
            fn: (key, result) => {
                return <IntraSocialLink key={getKey(key)} to={user} type={IntraSocialType.profile}>{userFullName(user)}</IntraSocialLink>
            }
        }
    }).filter(o => o)
    config = config.concat(mentionSearch)
    processed = processString(config)(text)
    const embedKeys = Object.keys(embedlyArr)
    let flatten = flattenElements(processed)
    let hasMore = false
    if(truncateLength > 0)
    {
        const truncatedResult = truncateElements(flatten, truncateLength,linebreakLimit)
        flatten = truncatedResult.result
        hasMore = truncatedResult.rest.length > 0
    }
    const ret:{textContent:JSX.Element[], linkCards:JSX.Element[], hasMore:boolean} = {textContent:flatten, linkCards:[], hasMore}
    if(includeEmbedlies && embedKeys.length > 0)
    {
        ret.linkCards = embedKeys.map(k => embedlyArr[k])
    }
    return ret
}
export const flattenElements = (arr:any):JSX.Element[] => {
    if(typeof arr == "string" && !Array.isArray(arr))
    {
        return arr as any
    }
    let result = []
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i]
        if(typeof item != "string" && Array.isArray(item))
        {
            result = result.concat(flattenElements(item))
        }
        else {
            if(typeof item != "string" || item.length > 0)
                result.push(item)
        }
    }
    return result
}
const truncateElements = (arr:JSX.Element[], limit:number, linebreakLimit:number) => {
    let result:JSX.Element[] = []
    let rest:JSX.Element[] = []
    let banked = 0
    let linebreaks = 0
    const processLinebreaks = linebreakLimit > 0
    const bank = (item:any, length:number, ignoreIfEmpty = false, isLinebreak = false) => {
        if(!ignoreIfEmpty ||  length > 0)
        {
            if(processLinebreaks && isLinebreak)
            {
                linebreaks += 1
                if(linebreaks >= linebreakLimit)
                    done = true
            }
            if(done)
                rest.push(item)
            else 
            {
                result.push(item)
                banked += length
                if(banked > limit)
                    done = true
            }
        }
    }
    let done = false
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i]
        if(done)
        {
            bank(item, 0, true)
        }
        if(typeof item == "string")
        {
            const str = item as string
            const len = str.length
            if(len + banked > limit) //too big, split string
            {
                const sentences = str.match(SENTENCES_REGEX)
                if(sentences.length > 0)
                {
                    for (let si = 0; si < sentences.length; si++) {
                        const sentence = sentences[si];
                        bank(sentence, sentence.length, true)
                    }
                }
                else {

                    bank(str, len, true)
                }
            }
            else 
            {
                bank(str, len, true)
            }
        }
        else if(item.props && item.props.children && typeof item.props.children == "string")//must be type 'Text'
        {
            bank(item, item.props.children.length)
        }
        else {//must be type 'br'
            bank(item, 0, false, true)
        }
    }
    return {result,length:banked, rest} 
}
export function rawMarkup(text, mentions:any[]) {
    var markup = text
    if (Settings.searchEnabled) {
        markup = markup.replace(HASHTAG_REGEX_WITH_HIGHLIGHT, (hashTag) =>
        {
            let tag = hashTag.replace(TAG_REGEX, "")
            let href = `${Routes.SEARCH}?term=${encodeURIComponent(tag)}`
            return `<a href="${href}">${hashTag}</a>`
        });
    }
    // Add missing http:// to URLs starting with "www."
    // TODO: Fix this replacement, is not working
    markup = markup.replace(URL_WWW_REGEX, 'http://$1');

    // URLs starting with http://, https://, or ftp:// replaced as link
    markup = markup.replace(URL_REGEX, (group) => {
        return `<a href="${group}" target="_blank"  data-toggle="tooltip" title="${group}">${truncate(group, 50)}</a>`
    });

    // Change email addresses to mailto:: links.
    markup = markup.replace(EMAIL_REGEX, '$1<a href="mailto:$2">$2</a>');

    // Add break lines
    markup = markup.replace(/(?:\r\n|\r|\n)/g, '<br />');

    // Replace mentions (@username) with user first name
    if (mentions !== undefined) {
        mentions.map(function (user) 
        {
            let el = `<a href="${Routes.profileUrl(user.slug_name)}" data-toggle="tooltip" title="${userFullName(user)}">${user.first_name + " " + user.last_name}</a>`
            // let elementHTML = "<a href=" + user.absolute_url + ">" + user.first_name + "</a>";
            let regexExpression = new RegExp("@" + user.username.replace("+","\\+"), 'g');
            markup = markup.replace(regexExpression, el);
        });
    }
    return {__html: markup};
}

/**
 * Maintaining Scroll Position When Adding Content to the Top of a Container
 * 
 * http://kirbysayshi.com/2013/08/19/maintaining-scroll-position-knockoutjs-list.html
 */
export function ScrollPosition(node:HTMLElement) {
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


export function ProtectNavigation(enabled:boolean) {
    if (enabled) {
        window.onbeforeunload = function(e) {
            e.preventDefault()
            let dialogText = "Navigating away will remove your typed text, are you sure?";
            e.returnValue = dialogText;
            return dialogText;
        }
    } else {
        window.onbeforeunload = null
    }
}
export function cloneDictKeys(dict:{})
{
    let keys = Object.keys(dict)
    let newDict = {}
    keys.forEach(key => {
        newDict[key] = dict[key]
    })
    return newDict
}
export const nullOrUndefined = (any) => 
{
    return any === null || any === undefined
}
export const uniqueId = () =>  {
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

export function compareObjects(o1:object, o2:object){
    for(var p in o1){
        if(o1.hasOwnProperty(p)){
            if(o1[p] !== o2[p]){
                return false;
            }
        }
    }
    for(var p in o2){
        if(o2.hasOwnProperty(p)){
            if(o1[p] !== o2[p]){
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
