
import * as React from 'react';
import { convertFromRaw, SelectionState, Modifier, EditorState, RawDraftContentState, DraftEntityMutability } from 'draft-js';
import { HASHTAG_REGEX_NO_GLOBAL } from '../../../../../utilities/Utilities';
import Constants from '../../../../../utilities/Constants';
import { ElasticSearchType, ContextNaturalKey } from '../../../../../types/intrasocial_types';
import { AutocompleteSection, AutocompleteSectionItem } from '../Autocomplete';

export const SearchBoxSearchFilter = (props:any) => {
    return <span className="search-filter">{props.children}</span>;
}
export const SearchBoxSearchIdObject = (props:any) => {
    return <span className="search-id-object">{props.children}</span>;
}
export type SearchType = {
    type:ElasticSearchType 
    class:string
    listInAutocomplete:boolean
    titleProp:string
    defaultAvatar?:() => string
}
export const supportedSearchTypes:{[key:string]:SearchType} = {
    Status:{type:ElasticSearchType.STATUS, class:"fa fa-comment-o", listInAutocomplete:false, titleProp:"object_type"},
    Task:{type:ElasticSearchType.TASK, class:"fa fa-tasks", listInAutocomplete:false, titleProp:"title"},

    UploadedFile:{type:ElasticSearchType.UPLOADED_FILE, class:"fa file-icon fa-file-o", listInAutocomplete:false, titleProp:"filename"},
    Event:{type:ElasticSearchType.EVENT, class:"fa fa-calendar", listInAutocomplete:true, titleProp:"name", defaultAvatar:Constants.resolveUrl(Constants.defaultImg.eventAvatar)},
    User:{type:ElasticSearchType.USER, class:"fa fa-user", listInAutocomplete:true, titleProp:"user_name", defaultAvatar:Constants.resolveUrl(Constants.defaultImg.userAvatar)},
    Group:{type:ElasticSearchType.GROUP, class:"fa fa-group", listInAutocomplete:true, titleProp:"name", defaultAvatar:Constants.resolveUrl(Constants.defaultImg.groupAvatar)},
    Community:{type:ElasticSearchType.COMMUNITY, class:"fa fa-group", listInAutocomplete:true, titleProp:"name", defaultAvatar:Constants.resolveUrl(Constants.defaultImg.communityAvatar)},
    Project:{type:ElasticSearchType.PROJECT, class:"fa fa-folder-open", listInAutocomplete:true, titleProp:"name", defaultAvatar:Constants.resolveUrl(Constants.defaultImg.projectAvatar)},
}
export type SearchOption = {
    name:string 
    value:ElasticSearchType
}
const SEARCHFILTER_REGEX_GENERATOR = (searchOptions:SearchOption[]) => RegExp("(" + searchOptions.map(o => o.name).join("|") + "):\\w*","i")
export const ID_OBJECT_REGEX = /\B@(\w[^\s]+)/gi
export const ID_OBJECT_REGEX_NO_GLOBAL = /\B@(\w[^\s]+)/i

export type SearchEntity = {
    type:SearchEntityType 
    mutability:DraftEntityMutability 
    component:(props: any) => JSX.Element
    regex:(args:any) => RegExp
}
export enum SearchEntityType{
    FILTER = "FILTER",
    ID_OBJECT = "ID_OBJECT"
}
export const searchEntities:{[key:string]:SearchEntity} = {
    FILTER:{type: SearchEntityType.FILTER, mutability:"IMMUTABLE", component:SearchBoxSearchFilter, regex:(args) => SEARCHFILTER_REGEX_GENERATOR(args)},
    ID_OBJECT:{type: SearchEntityType.ID_OBJECT, mutability:"IMMUTABLE", component:SearchBoxSearchIdObject, regex:() => ID_OBJECT_REGEX_NO_GLOBAL},
}
export type SearchData = {
    filters: {}
    query: string
    tags: string[]
    tokens: SearchToken[]
    originalText: string
}
export type SearchToken = {
    token:string
    start:number
    end:number
    data?:{name:string}
    type?:SearchEntityType
    accepted?:boolean
}
export class SearcQueryManager
{
    static isWhiteSpace(ch){ return " \t\n\r\v".indexOf(ch) != -1 }
    static isFilterEndChar(ch){ return ch == ":" }

    static convertToRaw(text:string, searchOptions:SearchOption[]){
        const parsed = SearcQueryManager.parse(text, searchOptions)
        const raw:RawDraftContentState = {entityMap:{}, blocks:[{key:"7fubk", text:text, type:"unstyled", depth:0, inlineStyleRanges:[], entityRanges:[]}]}
        console.log("parsed", parsed)
        console.log("raw", raw)
        let index = 0
        parsed.tokens.forEach(token => {
            if(token.type && (token.type == SearchEntityType.FILTER || token.accepted) )
            {
                const meta = searchEntities[token.type]
                raw.entityMap[index] = {type:token.type, mutability:meta.mutability, data:token.data}
                raw.blocks[0].entityRanges.push({offset:token.start, length:token.end - token.start, key:index})
                index++
            }
        });
        return raw
    }
    static convertToContentState(text:string, searchOptions:SearchOption[])
    {
        const raw = SearcQueryManager.convertToRaw(text, searchOptions)
        const state = convertFromRaw(raw)
        return state
    }
    static parse(text:string, searchOptions:SearchOption[]):SearchData 
    {
        const SEARCHFILTER_REGEX = SEARCHFILTER_REGEX_GENERATOR(searchOptions)
        //extract tokens
        let tokens = []
        var currentToken = ""
        const addToken = (end:number) => {
            if(currentToken.length > 0)
            {
                const start = end - currentToken.length
                const extra:{data?:{name:string},type?:string} = {}
                const searchableEntitiesKeys = Object.keys(searchEntities)
                for (let index = 0; index < searchableEntitiesKeys.length; index++) {
                    const se = searchEntities[searchableEntitiesKeys[index]]
                    if(se.regex(searchOptions).test(currentToken))
                    {
                        extra.type = se.type
                        extra.data = {name:currentToken}
                        break;
                    }
                }
                tokens.push({token:currentToken, start:start, end:end, ...extra})
                currentToken = ""
            }
        }
        for (var i = 0; i < text.length; i++) {
            const c = text.charAt(i)
            if(!SearcQueryManager.isWhiteSpace(c))
            {
                currentToken += c
                if(SearcQueryManager.isFilterEndChar(c) && SEARCHFILTER_REGEX.test(currentToken))
                { 
                    addToken(i + 1)
                }
            }
            else if(currentToken.length > 0)
            {
                addToken(i)
            }
        }
        addToken(text.length)
        const acceptedFilters = {}
        const tokenLength = tokens.length
        for (var i = 0; i < tokenLength; i++) 
        {
            const token = tokens[i]
            if(token.accepted)
                continue;
            if(token.type == SearchEntityType.FILTER && tokenLength > i + 1)
            {
                const filterName = token.token.replace(":","")
                const nextToken = tokens[i + 1]
                const nextTokenValue = nextToken.token
                if(nextToken.type == SearchEntityType.ID_OBJECT)
                {
                    nextToken.accepted = true
                    acceptedFilters[filterName] = nextTokenValue
                }
                else if(!nextToken.type)
                {
                    nextToken.accepted = true
                    const appendTilde = !HASHTAG_REGEX_NO_GLOBAL.test(nextTokenValue)
                    acceptedFilters[filterName] = appendTilde ?  "*" + nextTokenValue + "*" : nextTokenValue
                }
            }
        }
        let queryText = ""
        const tags = []
        tokens.forEach(t => {
            if(t.type || t.accepted)
                return
            if(HASHTAG_REGEX_NO_GLOBAL.test(t.token))
                tags.push(t.token.substr(1))
            else 
                queryText += " " + t.token + ""
        })
        return {filters:acceptedFilters,query:queryText, tags:tags, tokens:tokens, originalText:text }
    }
    static getEntities(editorState, entityType = null){
        const content = editorState.getCurrentContent();
        const entities = []
        content.getBlocksAsArray().forEach((block) => {
            let selectedEntity = null;
            block.findEntityRanges(
                (character) => {
                    if (character.getEntity() !== null) {
                        const entity = content.getEntity(character.getEntity());
                        if (!entityType || (entityType && entity.getType() === entityType)) {
                            selectedEntity = {
                                entityKey: character.getEntity(),
                                blockKey: block.getKey(),
                                entity: content.getEntity(character.getEntity()),
                            };
                            return true
                        }
                    }
                    return false
                },
                (start, end) => {
                    entities.push({...selectedEntity, start, end});
                });
        });
        return entities
    }
    static getStateWithEntities(editorState, searchOptions:SearchOption[])
    {
        console.log("need to fix this. id_objects are not immutable. Check if prev objects are the same as new objects before creating objects")
        let contentState = editorState.getCurrentContent()
        //only one block allowed for now(single line)
        const contentBlock = editorState.getCurrentContent().getBlockMap().first()
        const text = editorState.getCurrentContent().getPlainText()
        const searchData = SearcQueryManager.parse(text, searchOptions)
        const prevEntities = SearcQueryManager.getEntities(editorState)
        const nextEntities = searchData.tokens.filter(t => t.type && (t.type == SearchEntityType.FILTER || t.accepted))
        const blockKey = contentBlock.getKey();
        prevEntities.forEach(pe => { // remove
            const blockSelection = SelectionState
                .createEmpty(blockKey)
                .merge({
                anchorOffset: pe.start,
                focusOffset: pe.end,
            });
            contentState = Modifier.applyEntity(
                contentState,
                blockSelection as SelectionState,
                null
            )
        })
        nextEntities.forEach(ne => { // add
            const blockSelection = SelectionState
                .createEmpty(blockKey)
                .merge({
                anchorOffset: ne.start,
                focusOffset: ne.end,
                });
            const key = ne.token
            const meta = searchEntities[ne.type]
            const contentStateWithEntity = contentState.createEntity(
                meta.type,
                meta.mutability,
                {name: key}
            )
            const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
            contentState = Modifier.applyEntity(
                contentStateWithEntity,
                blockSelection as SelectionState,
                entityKey
            )
        })
        
        return EditorState.push( editorState, contentState, "apply-entity") 
    }
    static getEntityStrategy(entityName) {
        return (contentBlock, callback, contentState) => {
            contentBlock.findEntityRanges(
              (character) => {
                const entityKey = character.getEntity();
                if(entityKey === null) {
                    return false;
                }
                return contentState.getEntity(entityKey).getType() === entityName
              },
              callback
            );
        }
    }
    static getActiveSearchType = (searchData:SearchData, selectionOffset:number, searchOptions:SearchOption[]):ElasticSearchType => {
        let activeSearchTypeIndex = searchData.tokens.findIndex(t => t.start <= selectionOffset && t.end >= selectionOffset)
        if(activeSearchTypeIndex == -1)
        {
            const closestTokenLeft = [...searchData.tokens].reverse().find(t => t.end <= selectionOffset)
            if(closestTokenLeft)
            {
                activeSearchTypeIndex = searchData.tokens.indexOf(closestTokenLeft)
            }
        }
        if(activeSearchTypeIndex > -1)
        {
            let token = searchData.tokens[activeSearchTypeIndex]
            if((!token.type && token.accepted) || token.type == SearchEntityType.ID_OBJECT)//connected token
            {
                if(activeSearchTypeIndex > 0)
                    token = searchData.tokens[activeSearchTypeIndex - 1] 
            }
            if(token.type == SearchEntityType.FILTER)
            {
                const filter = token.token.replace(":","")
                const so = searchOptions.find(so => so.name == filter)
                if(so)
                {
                    return so.value
                }
            }
        }
        return null
    }
    static getActiveSearchToken(searchData:SearchData, selectionOffset:number)
    {
        const activeSearchTypeIndex = searchData.tokens.findIndex(t => t.start <= selectionOffset && t.end >= selectionOffset)
        if(activeSearchTypeIndex == -1)
        {
            const token = [...searchData.tokens].reverse().find(t => t.end <= selectionOffset)
            return token
        }
        else
        {
            return searchData.tokens[activeSearchTypeIndex]
        }
    }
    static getActiveSearchQueryNotEntityConnected = (searchData:SearchData, selectionOffset:number) => {
        const activeSearchTypeIndex = searchData.tokens.findIndex(t => t.start <= selectionOffset && t.end >= selectionOffset)
        if(activeSearchTypeIndex > -1)
        {
            const token = searchData.tokens[activeSearchTypeIndex]
            const prevToken = activeSearchTypeIndex > 0 ? searchData.tokens[activeSearchTypeIndex - 1] : null
            if((!prevToken || prevToken.type != SearchEntityType.FILTER) && !token.type)
            {
                return token.token
            }
            else 
            {
                return null
            }
        }
        else //find closest token to the left
        {
            const closestTokenLeft = [...searchData.tokens].reverse().find(t => t.end <= selectionOffset)
            if(closestTokenLeft && closestTokenLeft.type == SearchEntityType.FILTER)
            {
                return null
            }
        }
        return ""
    }
    static convertResultItem = (item:any, onItemSelect:(event:React.SyntheticEvent<any>, item:AutocompleteSectionItem) => void):AutocompleteSectionItem => {
        switch(item.object_type)
        {
            case ElasticSearchType.COMMUNITY:return new AutocompleteSectionItem(item.django_id, item.slug, item.name, null, null, null, ElasticSearchType.COMMUNITY, item.avatar || ContextNaturalKey.avatarForKey(ContextNaturalKey.COMMUNITY) , onItemSelect, null)
            case ElasticSearchType.GROUP:return new AutocompleteSectionItem(item.django_id, item.slug, item.name, null, null, null, ElasticSearchType.GROUP, item.avatar || ContextNaturalKey.avatarForKey(ContextNaturalKey.GROUP), onItemSelect, null)
            case ElasticSearchType.USER:return new AutocompleteSectionItem(item.django_id, item.slug, item.user_name, null, null, null, ElasticSearchType.USER, item.avatar || ContextNaturalKey.avatarForKey(ContextNaturalKey.USER), onItemSelect, null)
            case ElasticSearchType.PROJECT:return new AutocompleteSectionItem(item.django_id, item.slug, item.name, null, null, null, ElasticSearchType.PROJECT, item.avatar || ContextNaturalKey.avatarForKey(ContextNaturalKey.PROJECT), onItemSelect, null)
            case ElasticSearchType.TASK:return new AutocompleteSectionItem(item.django_id, item.slug, item.title, null, null, null, ElasticSearchType.TASK, item.avatar || ContextNaturalKey.avatarForKey(ContextNaturalKey.TASK), onItemSelect, null)
            case ElasticSearchType.EVENT:return new AutocompleteSectionItem(item.django_id, item.slug, item.name, null, null, null, ElasticSearchType.EVENT, item.avatar || ContextNaturalKey.avatarForKey(ContextNaturalKey.EVENT), onItemSelect, null)
            
            default: return null
        }
    }
    static groupResultItems = (items:any, onItemSelect:(event:React.SyntheticEvent<any>, item:AutocompleteSectionItem) => void):AutocompleteSection[] => {
        const groups:{[key:string]:AutocompleteSection} = {}
        items.forEach(i => {
            const object = SearcQueryManager.convertResultItem(i, onItemSelect)
            if(!object)
                return;
            let group = groups[object.type]
            if(!group)
            {
                group = new AutocompleteSection(object.type, object.type, [], false, true)
                groups[object.type] = group
            }
            group.items.push(object)
        })
        return Object.keys(groups).map(k => groups[k])
    }
}
export const searchDecorators = Object.keys(searchEntities).map(sek => {
    const se = searchEntities[sek]
    return {strategy:SearcQueryManager.getEntityStrategy(se.type), component:se.component}
})