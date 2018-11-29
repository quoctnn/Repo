import { Settings } from './Settings';
import { UserProfile } from '../reducers/profileStore';
import Embedly from '../components/general/Embedly';
import { Link} from 'react-router-dom'
const processString = require('react-process-string');
import { Routes } from './Routes';
import * as React from 'react';
export const getDomainName = (url:string) =>  {
    var url_parts = url.split("/")
    var domain_name_parts = url_parts[2].split(":")
    var domain_name = domain_name_parts[0]
    return domain_name
}
export function userFullName(user:UserProfile) {
    if (user.first_name) {
        return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
}
export const EMAIL_REGEX = /(\b\s+)(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gm
export const URL_REGEX = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim
export const URL_WWW_REGEX = /(^(\b|\s+)(www)\.[\S]+(\b|$))/gim
export const HASHTAG_REGEX = /(?:#)(\w(?:(?:\w|(?:\.(?!\.))){0,28}(?:\w))?)/ig
export const HASHTAG_REGEX_WITH_HIGHLIGHT = /(?:#)((?:\w|(?:<em>))(?:(?:(?:\w|(?:<\/em>))|(?:\.(?!\.))){0,28}(?:(?:\w|(?:<\/em>))))?)/ig
export const TAG_REGEX = /(<([^>]+)>)/ig
export const IS_ONLY_LINK_REGEX = /^(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])$/i
export const LINEBREAK_REGEX = /\r?\n|\r/g
export const truncate = (text, maxChars) => {
    return text.length > (maxChars - 3) ? text.substring(0, maxChars - 3) + '...' : text;
}
export function getTextContent(text:string, mentions:UserProfile[], includeEmbedlies:false)
{
    var processed:any = null
    var config = []
    let embedlyArr:{[id:string]:any} = {}
    let k = {
        regex: URL_REGEX,
        fn: (key, result) => 
        {
            if(includeEmbedlies)
            {
                embedlyArr[result[0]] = <Embedly key={uniqueId()} url={result[0]} />
            }
            return (<a key={uniqueId()} href={result[0]} target="_blank"  data-toggle="tooltip" title={result[0]}>{truncate(result[0], 50 )}</a>)
        }
    }
    config.push(k)
    let breaks = {
        regex: LINEBREAK_REGEX,
        fn: (key, result) => 
        {
            return (<br key={uniqueId()} />)
        }
    }
    config.push(breaks)
    let mentionSearch = mentions.map(user => {
        return {
            regex:new RegExp("@" + user.username.replace("+","\\+"), 'g'),
            fn: (key, result) => {
                return <Link key={key} to={Routes.PROFILES + user.slug_name }>{user.first_name + " " + user.last_name}</Link>;
            }
        }
    }).filter(o => o)
    config = config.concat(mentionSearch)
    processed = processString(config)(text);
    let embedKeys = Object.keys(embedlyArr)
    if(includeEmbedlies && embedKeys.length > 0)
    {
        processed = processed.concat( embedKeys.map(k => embedlyArr[k]) )
    }
    return processed
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
            let el = `<a href="${Routes.PROFILES + user.slug_name}" data-toggle="tooltip" title="${userFullName(user)}">${user.first_name + " " + user.last_name}</a>`
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


export function ProtectNavigation(enabled) {
    if (enabled) {
        window.onbeforeunload = function(e) {
            let dialogText = "Navigating away will remove your typed text, are you sure?";
            e.returnValue = dialogText;
            return dialogText;
        }
    } else {
        window.onbeforeunload = null
    }
}
export function cloneDictKeys(dict)
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
  
  
export const normalizeIndex = (selectedIndex, max) => {
    let index = selectedIndex % max;
    if (index < 0) {
    index += max;
    }
    return index;
}