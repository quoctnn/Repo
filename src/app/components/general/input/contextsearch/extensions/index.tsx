
import * as React from 'react';
import { convertFromRaw, SelectionState, Modifier, EditorState, RawDraftContentState, DraftEntityMutability } from 'draft-js';
import { HASHTAG_REGEX_NO_GLOBAL } from '../../../../../utilities/Utilities';
import Constants from '../../../../../utilities/Constants';
import { ElasticSearchType } from '../../../../../types/intrasocial_types';

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
    defaultAvatar?:string
}
export const supportedSearchTypes:{[key:string]:SearchType} = {
    Status:{type:ElasticSearchType.STATUS, class:"fa fa-comment-o", listInAutocomplete:false, titleProp:"object_type"},
    Task:{type:ElasticSearchType.TASK, class:"fa fa-tasks", listInAutocomplete:false, titleProp:"title"},
    UploadedFile:{type:ElasticSearchType.UPLOADED_FILE, class:"fa file-icon fa-file-o", listInAutocomplete:false, titleProp:"filename"},
    Event:{type:ElasticSearchType.EVENT, class:"fa fa-calendar", listInAutocomplete:true, titleProp:"name", defaultAvatar:Constants.staticUrl + Constants.defaultImg.eventAvatar},
    User:{type:ElasticSearchType.USER, class:"fa fa-user", listInAutocomplete:true, titleProp:"user_name", defaultAvatar:Constants.staticUrl + Constants.defaultImg.userAvatar},
    Group:{type:ElasticSearchType.GROUP, class:"fa fa-group", listInAutocomplete:true, titleProp:"name", defaultAvatar:Constants.staticUrl + Constants.defaultImg.groupAvatar},
    Community:{type:ElasticSearchType.COMMUNITY, class:"fa fa-group", listInAutocomplete:true, titleProp:"name", defaultAvatar:Constants.staticUrl + Constants.defaultImg.communityAvatar},
}
export type SearchOption = {
    name:string 
    value:ElasticSearchType
}
export const searchOptions:SearchOption[] = [
    {name: "from", value:supportedSearchTypes.User.type},
    {name: "community", value:supportedSearchTypes.Community.type},
    {name: "group", value:supportedSearchTypes.Group.type},
]
export const SEARCHFILTER_REGEX = RegExp("(" + searchOptions.map(o => o.name).join("|") + "):\\w*","i")
export const ID_OBJECT_REGEX = /\B@(\w[^\s]+)/gi
export const ID_OBJECT_REGEX_NO_GLOBAL = /\B@(\w[^\s]+)/i

export type SearchEntity = {
    type:string 
    mutability:DraftEntityMutability 
    component:(props: any) => JSX.Element
    regex:RegExp
}
export const searchEntities:{[key:string]:SearchEntity} = {
    FILTER:{type: "FILTER", mutability:"IMMUTABLE", component:SearchBoxSearchFilter, regex:SEARCHFILTER_REGEX},
    ID_OBJECT:{type: "ID_OBJECT", mutability:"MUTABLE", component:SearchBoxSearchIdObject, regex:ID_OBJECT_REGEX_NO_GLOBAL},
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
    type?:string
    accepted?:boolean
}
export class SearcQueryManager
{
    static isWhiteSpace(ch){ return " \t\n\r\v".indexOf(ch) != -1 }
    static isFilterEndChar(ch){ return ch == ":" }

    static convertToRaw(text:string){
        const parsed = SearcQueryManager.parse(text)
        const raw:RawDraftContentState = {entityMap:{}, blocks:[{key:"7fubk", text:text, type:"unstyled", depth:0, inlineStyleRanges:[], entityRanges:[]}]}
        console.log("parsed", parsed)
        console.log("raw", raw)
        let index = 0
        parsed.tokens.forEach(token => {
            if(token.type && (token.type == searchEntities.FILTER.type || token.accepted) )
            {
                const meta = searchEntities[token.type]
                raw.entityMap[index] = {type:token.type, mutability:meta.mutability, data:token.data}
                raw.blocks[0].entityRanges.push({offset:token.start, length:token.end - token.start, key:index})
                index++
            }
        });
        return raw
    }
    static convertToContentState(text:string)
    {
        const raw = SearcQueryManager.convertToRaw(text)
        const state = convertFromRaw(raw)
        return state
    }
    static parse(text:string):SearchData 
    {
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
                    if(se.regex.test(currentToken))
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
            if(token.type == searchEntities.FILTER.type && tokenLength > i + 1)
            {
                const filterName = token.token.replace(":","")
                const nextToken = tokens[i + 1]
                const nextTokenValue = nextToken.token
                if(nextToken.type == searchEntities.ID_OBJECT.type)
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
    static getStateWithEntities(editorState)
    {
        let contentState = editorState.getCurrentContent()
        //only one block allowed for now(single line)
        const contentBlock = editorState.getCurrentContent().getBlockMap().first()
        const text = editorState.getCurrentContent().getPlainText()
        const searchData = SearcQueryManager.parse(text)
        const prevEntities = SearcQueryManager.getEntities(editorState)
        const nextEntities = searchData.tokens.filter(t => t.type && (t.type == searchEntities.FILTER.type || t.accepted))
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
}
export const searchDecorators = Object.keys(searchEntities).map(sek => {
    const se = searchEntities[sek]
    return {strategy:SearcQueryManager.getEntityStrategy(se.type), component:se.component}
})