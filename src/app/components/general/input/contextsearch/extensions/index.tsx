
import * as React from 'react';
import { convertFromRaw, SelectionState, Modifier, EditorState, RawDraftContentState, DraftEntityMutability, ContentState, Entity } from 'draft-js';
import { HASHTAG_REGEX_NO_GLOBAL, nullOrUndefined } from '../../../../../utilities/Utilities';
import Constants from '../../../../../utilities/Constants';
import { ElasticSearchType, ContextNaturalKey } from '../../../../../types/intrasocial_types';
import { AutocompleteSection, AutocompleteSectionItem } from '../Autocomplete';

export const SearchBoxSearchFilter = (props:any) => {
    return <span className="search-filter">{props.children}</span>;
}
export const SearchBoxSearchIdObject = (props:any) => {
    return <span className="search-id-object">{props.children}</span>;
}
export type InsertEntity = {
    type:SearchEntityType,
    text:string,
    data:TokenData,
    start:number,
    end:number,
    appendSpace:boolean
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
export class SearchOption {
    name:string
    key:string
    resolveOrder:number
    value:ElasticSearchType
    allowedWithOptions:string[]
    description?:string
    constructor(key:string, name:string, resolveOrder:number, value:ElasticSearchType, allowedWithOptions:string[], description?:string){
        this.key = key
        this.name = name
        this.resolveOrder = resolveOrder
        this.value = value
        this.allowedWithOptions = allowedWithOptions
        this.description = description
    }
    getName = () => {
        return this.name || this.key
    }
}
const SEARCHFILTER_REGEX_GENERATOR = (searchOptions:SearchOption[]) => RegExp("(" + searchOptions.map(o => o.getName()).join("|") + "):\\w*","i")
export const ID_OBJECT_REGEX = /\B@(\w[^\s]+)/gi
export const ID_OBJECT_REGEX_NO_GLOBAL = /^([0-9]*)$|^\B@(\w[^\s]+)$/i

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
type ContextObject = {
    contextNaturalKey:ContextNaturalKey
    id:number
    resolveOrder:number
    value:string
}
export class ContextSearchData{
    tokens:SearchToken[]
    stateTokens:SearchToken[]
    query:string
    tags:string[]
    filters: {[key:string]:string}
    originalText: string
    focusOffset:number = 0
    constructor(data:{filters:{[key:string]:string}, query: string, tags: string[], tokens: SearchToken[], stateTokens:SearchToken[], originalText: string}) {
        this.filters = data.filters
        this.query = data.query
        this.tags = data.tags
        this.tokens = data.tokens
        this.originalText = data.originalText
        this.stateTokens = data.stateTokens
    }
    contextObject = (searchOptions:SearchOption[]):ContextObject => {

       let fk:ContextObject[] = Object.keys(this.filters).map(k =>
            {
                const so = searchOptions.find(so => so.getName() == k)
                if(so)
                {
                    const index = this.tokens.findIndex(o => o.token == so.getName()+":")
                    const valueToken = this.tokens[index + 1]
                    const value = (valueToken && valueToken.data && valueToken.data.title) || this.filters[k]
                    return {contextNaturalKey: so && ElasticSearchType.contextNaturalKeyForType(so.value), value:value, resolveOrder:so.resolveOrder * 100 - index, id:valueToken && valueToken.data && valueToken.data.id}
                }
            })
            .filter(o => !nullOrUndefined( o.contextNaturalKey) && !o.value.startsWith("*"))

        if(fk.length > 0)
        {
            fk = fk.sort((a, b) =>  a.resolveOrder - b.resolveOrder)
            return fk[0]
        }
        return null
    }
}
type DraftEntity = {
    entityKey: string,
    blockKey: string,
    entity:Draft.EntityInstance
    start:number
    end:number
}
export type TokenData = {name:string, id:number, key:string, title:string}
export type SearchToken = {
    start:number
    end:number
    data?:TokenData
    type?:SearchEntityType
    accepted?:boolean
    token:string
}
export class SearcQueryManager
{
    static isWhiteSpace(ch){ return " \t\n\r\v".indexOf(ch) != -1 }
    static isFilterEndChar(ch){ return ch == ":" }

    static convertToContentState2(text:string, searchOptions:SearchOption[])
    {
        const raw = SearcQueryManager.convertToRaw2(text, searchOptions)
        const state = convertFromRaw(raw)
        return state
    }
    static convertToRaw2(text:string, searchOptions:SearchOption[]){
        const parsed = SearcQueryManager.parse(text, searchOptions)
        const raw:RawDraftContentState = {entityMap:{}, blocks:[{key:"7fubk", text:text, type:"unstyled", depth:0, inlineStyleRanges:[], entityRanges:[]}]}
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
    static convertToRaw(data:ContextSearchData, searchOptions:SearchOption[]){
        const raw:RawDraftContentState = {entityMap:{}, blocks:[{key:"7fubk", text:data.originalText, type:"unstyled", depth:0, inlineStyleRanges:[], entityRanges:[]}]}
        let index = 0
        data.tokens.forEach(token => {
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
    static convertToContentState(data:ContextSearchData, searchOptions:SearchOption[]){
        const raw = SearcQueryManager.convertToRaw(data, searchOptions)
        const state = convertFromRaw(raw)
        return state
    }
    static parse(text:string, searchOptions:SearchOption[]):ContextSearchData
    {
        const SEARCHFILTER_REGEX = SEARCHFILTER_REGEX_GENERATOR(searchOptions)
        //extract tokens
        let tokens = []
        var currentToken = ""
        const addToken = (end:number) => {
            if(currentToken.length > 0)
            {
                const start = end - currentToken.length
                const extra:{data?:TokenData,type?:string} = {}
                const searchableEntitiesKeys = Object.keys(searchEntities)
                for (let index = 0; index < searchableEntitiesKeys.length; index++) {
                    const se = searchEntities[searchableEntitiesKeys[index]]
                    if(searchOptions.length > 0 && se.regex(searchOptions).test(currentToken))
                    {
                        extra.type = se.type
                        extra.data = {name:currentToken, id:-1, key:null, title:null}
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
                    acceptedFilters[filterName] = appendTilde ? nextTokenValue + "*" : nextTokenValue
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
        return new ContextSearchData({filters:acceptedFilters,query:queryText,tags,tokens,originalText:text, stateTokens:[]})
    }
    static getFilters = (tokens:SearchToken[]) => {
        const filters = {}
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
                    filters[filterName] = nextTokenValue
                }
                else if(!nextToken.type)
                {
                    nextToken.accepted = true
                    const appendTilde = !HASHTAG_REGEX_NO_GLOBAL.test(nextTokenValue)
                    filters[filterName] = appendTilde ?  nextTokenValue + "*" : nextTokenValue
                }
            }
        }
        return filters
    }
    static getEntities(editorState:EditorState, entityType = null, ignoreNonEntities = false ){
        const content = editorState.getCurrentContent();
        const entities:DraftEntity[] = []
        content.getBlocksAsArray().forEach((block) => {
            let selectedEntity:DraftEntity = null;
            block.findEntityRanges(
                (character) => {
                    const blockKey = block.getKey()
                    if (character.getEntity() !== null) {
                        const entity = content.getEntity(character.getEntity());

                        if (!entityType || (entityType && entity.getType() === entityType)) {
                            selectedEntity = {
                                entityKey: character.getEntity(),
                                blockKey,
                                entity,
                                start:-1,
                                end:-1
                            };
                            return true
                        }
                    }
                    else if(!ignoreNonEntities) {
                        selectedEntity = {entityKey:null, blockKey, entity:null, start:-1, end:-1}
                        return true
                    }
                    return false
                },
                (start, end) => {
                    entities.push({...selectedEntity, start, end});
                });
        });
        return entities
    }
    static appendTextToState = (text:string, focus:boolean, editorState:EditorState) => {
        let state = editorState
        state = EditorState.moveSelectionToEnd(state)
        let contentState = state.getCurrentContent()
        const selectionState = state.getSelection()
        contentState = Modifier.insertText(contentState, selectionState, text)

        state = EditorState.push(
            state,
            contentState,
            'insert-characters'
        )
        if(focus)
            state = EditorState.moveFocusToEnd(state)
        return state
    }
    static appendText = (text:string, focus:boolean, editorState:EditorState) =>{
        let state = editorState
        state = SearcQueryManager.appendTextToState(text, focus, state)
        return state
    }
    static clearState = (editorState:EditorState) => {
        let state = editorState
        state = EditorState.push(state, ContentState.createFromText(''), 'remove-range');
        state = EditorState.moveFocusToEnd(state)
        return state
    }
    static removeNonEntities = (editorState:EditorState) => {
        let state = editorState
        let contentState = state.getCurrentContent()
        let entities:{start:number, end:number, blockKey:string}[] = []
        contentState.getBlocksAsArray().forEach((block) => {

            const blockKey = block.getKey();
            block.findEntityRanges(
                (character) => {
                    return character.getEntity() == null;
                },
                (start, end) => {
                    entities.push({start, end, blockKey});
                })
        })
        entities = entities.sort((a, b) => b.end - a.end)
        entities.forEach(e => {
            const blockSelection = SelectionState
                .createEmpty(e.blockKey)
                .merge({
                anchorOffset: e.start,
                focusOffset: e.end,
            }) as SelectionState;
            contentState = Modifier.removeRange(
                contentState,
                blockSelection,
                "forward"
            )
            state = EditorState.push(
                state,
                contentState,
                'remove-range'
            )
        })
        state = EditorState.moveFocusToEnd(state)
        return state
    }
    static insertEntities = (entities:InsertEntity[], editorState:EditorState) => {
        let state = editorState
        let contentState = state.getCurrentContent()
        const contentBlock = state.getCurrentContent().getBlockMap().first()
        const blockKey = contentBlock.getKey();
        entities.forEach(e => {
            const blockSelection = SelectionState
            .createEmpty(blockKey)
            .merge({
            anchorOffset: e.start,
            focusOffset: e.end,
          }) as SelectionState;
          const meta = searchEntities[e.type]
          const contentStateWithEntity = contentState.createEntity(
              meta.type,
              meta.mutability,
              e.data
          )
          const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
          contentState = Modifier.applyEntity(
              contentStateWithEntity,
              blockSelection,
              entityKey
          )
          contentState = Modifier.replaceText(contentState, blockSelection, e.text, null, entityKey)
          state = EditorState.push( state, contentState, 'insert-characters')
          if(e.appendSpace)
              state = SearcQueryManager.appendTextToState(" ", true, state)
          else
              state = EditorState.moveFocusToEnd(state)
        })
        return state
    }
    static getTokens = (editorState:EditorState, ignoreNonEntities?:boolean) => {
        const entities = SearcQueryManager.getEntities(editorState, null, ignoreNonEntities)
        const tokens:SearchToken[] = []
        entities.forEach(e => {
            tokens.push({token:null, start:e.start, end:e.end, data:e.entity && e.entity.getData(), type: e.entity && e.entity.getType() as SearchEntityType})
        })
        return tokens
    }
    static getContextSearchData = (editorState:EditorState, searchOptions:SearchOption[]) => {
        let text = editorState.getCurrentContent().getPlainText()
        let tokens = SearcQueryManager.getTokens(editorState, true)
        tokens.forEach(t => {
            t.token = text.slice(t.start, t.end)
        })
        const parsed = SearcQueryManager.parse(text, searchOptions)
        tokens.map(t => {
            const parsedToken = parsed.tokens.find(pt => pt.start == t.start && pt.end == t.end)
            if(parsedToken)
                parsedToken.data = t.data
        })
        const data = new ContextSearchData({tokens:parsed.tokens, query:parsed.query, tags:parsed.tags, filters:parsed.filters, stateTokens:tokens, originalText:text})
        return data
    }
    static getStateWithEntities(editorState:EditorState, searchOptions:SearchOption[])
    {
        const contentBlock = editorState.getCurrentContent().getBlockMap().first()
        let contentState = editorState.getCurrentContent()
        const stateData = SearcQueryManager.getContextSearchData(editorState, searchOptions)
        const parsedEntities = stateData.tokens.filter(t => !!t.type)
        const stateEntities = stateData.stateTokens.filter(t => !!t.type)
        const blockKey = contentBlock.getKey();
        //copy keys
        //remove old ones
        //add new ones
        //resolve unresolved entities when idle

        /*if(parsedEntities.length > stateEntities.length)
        {
            parsedEntities.forEach(ne => { // add
                const blockSelection = SelectionState
                    .createEmpty(blockKey)
                    .merge({
                    anchorOffset: ne.start,
                    focusOffset: ne.end,
                    });
                const key = ne.data.name
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
            console.warn("stuff pasted")
            return EditorState.push( editorState, contentState, "apply-entity")
        }
        return editorState*/
        console.warn("need to fix this. id_objects are not immutable. Check if prev objects are the same as new objects before creating objects")
        //only one block allowed for now(single line)
        if(true)//parsedEntities.length > stateEntities.length)
        {
            stateEntities.forEach(pe => { // remove
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
            parsedEntities.forEach(ne => { // add
                const blockSelection = SelectionState
                    .createEmpty(blockKey)
                    .merge({
                    anchorOffset: ne.start,
                    focusOffset: ne.end,
                    });
                const meta = searchEntities[ne.type]
                const contentStateWithEntity = contentState.createEntity(
                    meta.type,
                    meta.mutability,
                    ne.data
                )
                const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
                contentState = Modifier.applyEntity(
                    contentStateWithEntity,
                    blockSelection as SelectionState,
                    entityKey
                )
            })
        }


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

    static getActiveSearchType = (searchData:ContextSearchData, selectionOffset:number, searchOptions:SearchOption[], searchClosest:boolean = false):ElasticSearchType => {
        let activeSearchTypeIndex = searchData.tokens.findIndex(t => t.start <= selectionOffset && t.end >= selectionOffset)
        if(searchClosest && activeSearchTypeIndex == -1)
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
                const so = searchOptions.find(so => so.getName() == filter)
                if(so)
                {
                    return so.value
                }
            }
        }
        return null
    }
    static getActiveSearchToken(tokens:SearchToken[], selectionOffset:number)
    {
        const activeSearchTypeIndex = tokens.findIndex(t => t.start <= selectionOffset && t.end >= selectionOffset)
        if(activeSearchTypeIndex == -1)
        {
            const token = [...tokens].reverse().find(t => t.end <= selectionOffset)
            return token
        }
        else
        {
            return tokens[activeSearchTypeIndex]
        }
    }
    static getActiveSearchQueryNotEntityConnected = (searchData:ContextSearchData, selectionOffset:number) => {
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
            case ElasticSearchType.COMMUNITY:return new AutocompleteSectionItem(item.django_id, item.slug, item.name, null, null, null, ElasticSearchType.COMMUNITY, item.avatar || ContextNaturalKey.defaultAvatarForKey(ContextNaturalKey.COMMUNITY) , onItemSelect, null)
            case ElasticSearchType.GROUP:return new AutocompleteSectionItem(item.django_id, item.slug, item.name, null, null, null, ElasticSearchType.GROUP, item.avatar || ContextNaturalKey.defaultAvatarForKey(ContextNaturalKey.GROUP), onItemSelect, null)
            case ElasticSearchType.USER:return new AutocompleteSectionItem(item.django_id, item.slug, item.user_name, null, null, null, ElasticSearchType.USER, item.avatar || ContextNaturalKey.defaultAvatarForKey(ContextNaturalKey.USER), onItemSelect, null)
            case ElasticSearchType.PROJECT:return new AutocompleteSectionItem(item.django_id, item.slug, item.name, null, null, null, ElasticSearchType.PROJECT, item.avatar || ContextNaturalKey.defaultAvatarForKey(ContextNaturalKey.PROJECT), onItemSelect, null)
            case ElasticSearchType.TASK:return new AutocompleteSectionItem(item.django_id, item.slug, item.title, null, null, null, ElasticSearchType.TASK, item.avatar || ContextNaturalKey.defaultAvatarForKey(ContextNaturalKey.TASK), onItemSelect, null)
            case ElasticSearchType.EVENT:return new AutocompleteSectionItem(item.django_id, item.slug, item.name, null, null, null, ElasticSearchType.EVENT, item.avatar || ContextNaturalKey.defaultAvatarForKey(ContextNaturalKey.EVENT), onItemSelect, null)

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