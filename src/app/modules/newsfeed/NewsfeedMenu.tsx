import * as React from "react";
import { ContextFilter, ContextValue } from "../../components/general/input/ContextFilter";
import { translate } from "../../localization/AutoIntlProvider";
import { Label, Input, FormGroup, Button, ButtonGroup } from 'reactstrap';
import { ObjectAttributeType, ElasticSearchType, ContextNaturalKey } from "../../types/intrasocial_types";
import { SearchData, SearcQueryManager, SearchEntityType, SearchOption } from "../../components/general/input/contextsearch/extensions";
import { ContextSearch } from "../../components/general/input/contextsearch/ContextSearch";
import { AutocompleteSection, AutocompleteSectionItem } from "../../components/general/input/contextsearch/Autocomplete";
import ApiClient, { ElasticResult } from "../../network/ApiClient";
import { nullOrUndefined } from "../../utilities/Utilities";
import { InsertEntity } from "../../components/general/input/contextsearch/SearchBox";

type Props = 
{
    selectedContext:ContextValue
    includeSubContext:boolean
    filter:ObjectAttributeType
    onUpdate:(data:NewsfeedMenuData) => void
    availableFilters:ObjectAttributeType[]
}
type State = {
    selectedContext:ContextValue
    includeSubContext:boolean
    filter:ObjectAttributeType
    selectedSearchContext:SearchData
    sections:AutocompleteSection[]
    focusOffset:number
    activeSearchType:ElasticSearchType
    searchResult:ElasticResult<any>
}
export type NewsfeedMenuData = {
    selectedContext:ContextValue
    includeSubContext:boolean
    filter:ObjectAttributeType
}
const allowedSearchOptions:SearchOption[] = [
    {name: "community", value:ElasticSearchType.COMMUNITY},
    {name: "group", value:ElasticSearchType.GROUP},
    {name: "user", value:ElasticSearchType.USER},
    {name: "project", value:ElasticSearchType.PROJECT},
    {name: "task", value:ElasticSearchType.TASK},
    {name: "event", value:ElasticSearchType.EVENT},
]
const allowedSearchTypes = allowedSearchOptions.map(k => k.value)
export default class NewsfeedMenu extends React.Component<Props, State> {
    contextSearch = React.createRef<ContextSearch>()
    allowMultipleFilters = false
    constructor(props:Props) {
        super(props);
        const searchContext = SearcQueryManager.parse("", allowedSearchOptions)
        this.state = {
            selectedContext: this.props.selectedContext,
            includeSubContext:this.props.includeSubContext,
            filter:this.props.filter,
            selectedSearchContext:searchContext,
            sections:[],
            focusOffset:0,
            activeSearchType:null,
            searchResult:null,
        }
    }
    componentDidMount = () => {
        this.onSearchDataChanged(this.state.selectedSearchContext, this.state.focusOffset, this.state.activeSearchType)
    }
    onContextChange = (context:ContextValue) => {
        this.setState({selectedContext:context}, this.sendUpdate)
    }
    includeSubContextChanged = (event:any) => {
        this.setState({includeSubContext:event.target.checked}, this.sendUpdate)
    }
    sendUpdate = () => {
        this.props.onUpdate({selectedContext:this.state.selectedContext, includeSubContext:this.state.includeSubContext, filter:this.state.filter})
    }
    filterButtonChanged = (filter:ObjectAttributeType) => (event) => {

        const currentFilter = this.state.filter
        const newFilter = filter == currentFilter ? null : filter
        this.setState({filter:newFilter}, this.sendUpdate)
    }
    onSearchDataChanged = (data:SearchData, focusOffset:number, activeSearchType:ElasticSearchType) => {
        console.log("data",data, focusOffset, activeSearchType)
        const types = !!activeSearchType ? [activeSearchType] : allowedSearchTypes
        const q = data.query.length > 0 ? "*" + data.query + "*" : data.query
        const searchForbidden = this.searchForbidden(data)
        const sections = searchForbidden ? [] : this.getAutocompleteSections(data, focusOffset, this.state.searchResult)
        this.setState({selectedSearchContext:data, sections, focusOffset, activeSearchType})
        if(searchForbidden)
            return;
        ApiClient.search(10, 0, q, types, false, true, false, true, data.filters, data.tags,(searchResult, status, error) => {
            console.log("got res", searchResult)
            const sections = this.getAutocompleteSections(data, focusOffset, searchResult)
            this.setState({selectedSearchContext:data, sections, focusOffset, activeSearchType, searchResult})
        })
    }
    onSearchResultItemSelected = (event: React.SyntheticEvent<any>, item: AutocompleteSectionItem) => {
        const focusOffset = this.state.focusOffset
        const searchData = this.state.selectedSearchContext
        const slug = item.slug || item.id
        if(this.state.activeSearchType)
        {
            const activeToken = SearcQueryManager.getActiveSearchToken(this.state.selectedSearchContext, focusOffset)
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
            this.contextSearch.current.insertAutocompleteEntity(SearchEntityType.ID_OBJECT, "@"+slug, {slug:slug, id:item.id}, start, end, true)
        }
        else 
        {
            const entities:InsertEntity[] = []
            //create both filter and id_object
            const searchQuery = SearcQueryManager.getActiveSearchQueryNotEntityConnected(searchData, focusOffset)
            const start = Math.max(0 , focusOffset - searchQuery.length)
            const filterName = allowedSearchOptions.find(so => so.value == item.type).name + ":"
            entities.push({type:SearchEntityType.FILTER, text:filterName, data:{name:filterName}, start, end:focusOffset, appendSpace:false})
            //id
            const pos = focusOffset + filterName.length
            const text = "@"+slug
            entities.push({type:SearchEntityType.ID_OBJECT, text:text, data:{slug:slug, id:item.id}, start:pos, end:pos, appendSpace:true})

            this.contextSearch.current.insertAutocompleteEntities(entities)
        }
    }
    searchForbidden = (searchData:SearchData) => {
        return !this.allowMultipleFilters && !!searchData.tokens.find(t => t.type == SearchEntityType.ID_OBJECT)
    }
    getAutocompleteSections = (searchData:SearchData, focusOffset:number, searchResult:ElasticResult<any>) => {
        const sections:AutocompleteSection[] = []
        const autoFilters = this.getSearchFiltersAutocompleteSection(searchData, focusOffset)
        sections.push(...autoFilters)
        //add more filters
        const items = (searchResult && searchResult.results) || []
        const resultSections = SearcQueryManager.groupResultItems(items, this.onSearchResultItemSelected)
        sections.push(...resultSections)
        return sections
    }
    getSearchFiltersAutocompleteSection = (searchData:SearchData, focusOffset:number) => {
        const searchQuery = SearcQueryManager.getActiveSearchQueryNotEntityConnected(searchData, focusOffset)
        console.log("searchQuery", searchQuery)
        if(!nullOrUndefined( searchQuery ))
        {
            const appliedFilters = Object.keys( searchData.filters )
            const filters = allowedSearchOptions.filter(f => appliedFilters.indexOf(f.name) == -1 && f.name.indexOf(searchQuery.toLowerCase()) > -1)
            let trans = translate("search.options.title")
            let items = filters.map(f => {
                const filterName = f.name + ":"
                return new AutocompleteSectionItem(f.name, f.name, filterName, null, 0, null, null,null, (e) => {
                    const start = Math.max(0 , focusOffset - searchQuery.length)
                    this.contextSearch.current.insertAutocompleteEntity(SearchEntityType.FILTER, filterName, {name:filterName}, start, focusOffset, false)
                })
            })
            return [new AutocompleteSection("search_options", trans, items, false, true)]
        }
        return []
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
                    <ContextSearch allowedSearchOptions={allowedSearchOptions} ref={this.contextSearch} onSearchDataChanged={this.onSearchDataChanged} placeholder="Search..." sections={this.state.sections}/>
                </FormGroup>
                <FormGroup>
                    <Label>{translate("FeedContext")}</Label>
                    <ContextFilter onValueChange={this.onContextChange} value={this.state.selectedContext} />
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
