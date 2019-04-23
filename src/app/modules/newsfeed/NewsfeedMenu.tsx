import * as React from "react";
import { translate } from "../../localization/AutoIntlProvider";
import { Label, Input, FormGroup, Button, ButtonGroup } from 'reactstrap';
import { ObjectAttributeType, ElasticSearchType } from "../../types/intrasocial_types";
import { SearcQueryManager, SearchEntityType, SearchOption, InsertEntity, ContextSearchData, SearchToken } from "../../components/general/input/contextsearch/extensions";
import { ContextSearch } from "../../components/general/input/contextsearch/ContextSearch";
import { AutocompleteSection, AutocompleteSectionItem } from "../../components/general/input/contextsearch/Autocomplete";
import ApiClient, { ElasticResult } from "../../network/ApiClient";
import { nullOrUndefined } from "../../utilities/Utilities";

type Props =
{
    selectedSearchContext:ContextSearchData
    includeSubContext:boolean
    filter:ObjectAttributeType
    onUpdate:(data:NewsfeedMenuData) => void
    availableFilters:ObjectAttributeType[]
}
type State = {
    includeSubContext:boolean
    filter:ObjectAttributeType
    selectedSearchContext:ContextSearchData
    sections:AutocompleteSection[]
    focusOffset:number
    activeSearchType:ElasticSearchType
    searchResult:ElasticResult<any>
}
export type NewsfeedMenuData = {
    includeSubContext:boolean
    filter:ObjectAttributeType
    selectedSearchContext:ContextSearchData
}
export const allowedSearchOptions:SearchOption[] = []
allowedSearchOptions.push(new SearchOption("community", null, 2,  ElasticSearchType.COMMUNITY, ["user", "group", "event", "project", "task", ], "newsfeed.menu.filter.community.description"))
allowedSearchOptions.push(new SearchOption("group", null, 1, ElasticSearchType.GROUP, [], "newsfeed.menu.filter.group.description"))
allowedSearchOptions.push(new SearchOption("from", "user", 2, ElasticSearchType.USER, ["community", "group", "event", "project", "task", ], "newsfeed.menu.filter.user.description"))
allowedSearchOptions.push(new SearchOption("project", null, 1, ElasticSearchType.PROJECT, ["task", ], "newsfeed.menu.filter.project.description"))
allowedSearchOptions.push(new SearchOption("task", null, 1, ElasticSearchType.TASK, [], "newsfeed.menu.filter.task.description"))
allowedSearchOptions.push(new SearchOption("event", null, 1,  ElasticSearchType.EVENT, [], "newsfeed.menu.filter.event.description"))

const allowedSearchTypes = allowedSearchOptions.map(k => k.value)
export default class NewsfeedMenu extends React.Component<Props, State> {
    contextSearch = React.createRef<ContextSearch>()
    allowMultipleFilters = true
    constructor(props:Props) {
        super(props);
        const searchContext = this.props.selectedSearchContext
        this.state = {
            includeSubContext:this.props.includeSubContext,
            filter:this.props.filter,
            selectedSearchContext:searchContext,
            sections:[],
            focusOffset:0,
            activeSearchType:null,
            searchResult:null,
        }
    }
    includeSubContextChanged = (event:React.ChangeEvent<HTMLInputElement>) => {
        this.setState({includeSubContext:event.target.checked}, this.sendUpdate)
    }
    sendUpdate = () => {
        this.props.onUpdate({ includeSubContext:this.state.includeSubContext, filter:this.state.filter, selectedSearchContext:this.state.selectedSearchContext })
    }
    filterButtonChanged = (filter:ObjectAttributeType) => (event) => {
        const currentFilter = this.state.filter
        const newFilter = filter == currentFilter ? null : filter
        this.setState({filter:newFilter}, this.sendUpdate)
    }
    getAllowedSearchOptions = (searchData:ContextSearchData, allowedSearchOptions:SearchOption[]) => {
        const filterKeys = Object.keys(searchData.filters).map(s => allowedSearchOptions.find(so => so.getName() == s)).filter(so => !nullOrUndefined(so)).map(so => so.allowedWithOptions)
        let allowed = allowedSearchOptions.map(so => so.getName())
        filterKeys.forEach(arr => {
            const intersections = allowed.filter(x => arr.contains(x))
            allowed = intersections
        })
        return allowedSearchOptions.filter(so => allowed.contains(so.getName()))
    }
    getRealFilters = (filters:{[key:string]:string}) => {
        const clone = {...filters}
        const keysToAlter = allowedSearchOptions.filter(f => !nullOrUndefined( f.name ))
        keysToAlter.forEach(k => {
            const val = clone[k.name]
            if(val)
                delete Object.assign(clone, {[k.key]: val })[k.name]
        })
        return clone
    }
    onSearchDataChanged = (data:ContextSearchData, focusOffset:number, activeSearchType:ElasticSearchType) => {
        const hasActiveSearchType = !!activeSearchType
        const types = hasActiveSearchType ? [activeSearchType] : this.getAllowedSearchOptions(data, allowedSearchOptions).map(so => so.value)
        const q = hasActiveSearchType ? "" : data.query.length > 0 ? "*" + data.query + "*" : data.query
        const searchForbidden = types.length == 0 || this.isSearchForbidden(data)
        const sections = searchForbidden ? [] : this.getAutocompleteSections(data, focusOffset, this.state.searchResult)
        this.setState({selectedSearchContext:data, sections, focusOffset, activeSearchType}, this.sendUpdate)
        if(searchForbidden)
            return;
        ApiClient.search(10, 0, q, types, false, true, false, true, this.getRealFilters(data.filters), data.tags,(searchResult, status, error) => {
            const sections = this.getAutocompleteSections(data, focusOffset, searchResult)
            this.setState({selectedSearchContext:data, sections, focusOffset, activeSearchType, searchResult})
        })
    }
    onSearchResultItemSelected = (event: React.SyntheticEvent<any>, item: AutocompleteSectionItem) => {
        const focusOffset = this.state.focusOffset
        const slug = !!item.slug ? "@" + item.slug : item.id.toString()
        const fn = allowedSearchOptions.find(so => so.value == item.type).getName()
        if(this.state.activeSearchType)
        {
            const activeToken = SearcQueryManager.getActiveSearchToken(this.state.selectedSearchContext.tokens, focusOffset)
            let start = 0
            let end = 0
            if(activeToken)
            {
                if(activeToken.type == SearchEntityType.FILTER)
                {
                    start = activeToken.end
                }
                else
                {
                    start = activeToken.start
                }
                end = activeToken.end
            }
            let state = this.contextSearch.current.editorState()
            state = SearcQueryManager.insertEntities([{type:SearchEntityType.ID_OBJECT, text:slug, data:{name:slug, id:parseInt(item.id), key:fn, title:item.title}, start, end, appendSpace:true}], state)
            this.contextSearch.current.applyState(state)
        }
        else
        {
            let state = this.contextSearch.current.editorState()
            state = SearcQueryManager.removeNonEntities(state)
            state = SearcQueryManager.appendText(" ", true, state)
            let focusOffset = state.getSelection().getFocusOffset()
            const entities:InsertEntity[] = []
            const filterName = fn + ":"
            entities.push({type:SearchEntityType.FILTER, text:filterName, data:{name:filterName, id:-1, key:fn, title:null}, start:focusOffset, end:focusOffset, appendSpace:false})
            //id
            const pos = focusOffset + filterName.length
            entities.push({type:SearchEntityType.ID_OBJECT, text:slug, data:{name:slug, id:parseInt(item.id), key:fn, title:item.title}, start:pos, end:pos, appendSpace:true})

            state = SearcQueryManager.insertEntities(entities, state)
            this.contextSearch.current.applyState(state)
        }
    }
    isSearchForbidden = (searchData:ContextSearchData) => {
        return !this.allowMultipleFilters && !!searchData.tokens.find(t => t.type == SearchEntityType.ID_OBJECT)
    }
    getAutocompleteSections = (searchData:ContextSearchData, focusOffset:number, searchResult:ElasticResult<any>) => {
        const sections:AutocompleteSection[] = []
        const autoFilters = this.getSearchFiltersAutocompleteSection(searchData, focusOffset)
        sections.push(...autoFilters)
        //add more filters
        const items = (searchResult && searchResult.results) || []
        const resultSections = SearcQueryManager.groupResultItems(items, this.onSearchResultItemSelected)
        sections.push(...resultSections)
        return sections
    }
    getSearchFiltersAutocompleteSection = (searchData:ContextSearchData, focusOffset:number) => {
        const searchQuery = SearcQueryManager.getActiveSearchQueryNotEntityConnected(searchData, focusOffset)
        if(!nullOrUndefined( searchQuery ))
        {
            const filters = this.getAllowedSearchOptions(searchData, allowedSearchOptions).filter(f => f.getName().indexOf(searchQuery.toLowerCase()) > -1)
            // allowedSearchOptions.filter(f => appliedFilters.indexOf(f.getName()) == -1 && f.getName().indexOf(searchQuery.toLowerCase()) > -1)
            let trans = translate("search.options.title")
            let items = filters.map(f => {
                const fn = f.getName()
                const filterName = fn + ":"
                return new AutocompleteSectionItem(fn, fn, filterName, f.description && translate( f.description ), 0, null, null,null, (e) => {
                    const start = Math.max(0 , focusOffset - searchQuery.length)

                    let state = this.contextSearch.current.editorState()
                    state = SearcQueryManager.insertEntities([{type:SearchEntityType.FILTER, text:filterName, data:{name:filterName, id:-1, key:filterName, title:null}, start, end:focusOffset, appendSpace:false}], state)
                    this.contextSearch.current.applyState(state)
                })
            })
            return [new AutocompleteSection("search_options", trans, items, false, true)]
        }
        return []
    }
    onAutocompleteToggle = (visible:boolean) => {

    }
    render() {
        const filter = this.state.filter
        return(
            <div className="newsfeed-menu">
                <ButtonGroup>
                    {this.props.availableFilters.map(f => {
                        return (<Button key={f} active={filter == f} onClick={this.filterButtonChanged(f)} color="light">
                                    <i className={ObjectAttributeType.iconForType(f)}></i>
                                </Button>)
                    })}
                </ButtonGroup>
                <FormGroup>
                    <Label>{translate("FeedContext")}</Label>
                    <ContextSearch
                        onAutocompleteToggle={this.onAutocompleteToggle}
                        searchData={this.props.selectedSearchContext}
                        allowedSearchOptions={allowedSearchOptions}
                        ref={this.contextSearch}
                        onSearchDataChanged={this.onSearchDataChanged}
                        placeholder="Search..."
                        sections={this.state.sections}
                        />
                </FormGroup>
                <FormGroup check={true}>
                    <Label check={true}>
                        <Input type="checkbox" onChange={this.includeSubContextChanged} checked={this.state.includeSubContext} />{" " + translate("IncludeSubContext")}
                    </Label>
                </FormGroup>
            </div>
        );
    }
}

