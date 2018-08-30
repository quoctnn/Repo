import { Settings } from './Settings';
import { UserProfile } from '../reducers/profileStore';
import { Routes } from './Routes';
export const getDomainName = (url:string) =>  {
    var url_parts = url.split("/")
    var domain_name_parts = url_parts[2].split(":")
    var domain_name = domain_name_parts[0]
    return domain_name
}
export const appendTokenToUrl = (url:string) => 
{
    if(url && Settings.accessToken)
    {
        let img = new URL(url)
        img.searchParams.set('token', Settings.accessToken);
        return img.href
    }
    return url
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
export const truncate = (text, maxChars) => {
    return text.length > (maxChars - 3) ? text.substring(0, maxChars - 3) + '...' : text;
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
        mentions.map(function (user) {
            let el = `<a href="${user.absolute_url}" data-toggle="tooltip" title="${userFullName(user)}">${user.first_name}</a>`
            // let elementHTML = "<a href=" + user.absolute_url + ">" + user.first_name + "</a>";
            let regexExpression = new RegExp("@" + user.username, 'g');
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