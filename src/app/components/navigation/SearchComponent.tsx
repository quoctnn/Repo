import * as React from "react";
import classnames from 'classnames';
import "./SearchComponent.scss"
import { ContextSearchData, SearchOption, SearcQueryManager, SearchEntityType } from "../general/input/contextsearch/extensions";
import { ElasticSearchType, SearchHistory, ContextNaturalKey, GenericElasticResult, ElasticResultCommunity, ElasticResultStatus, ElasticResultEvent, ElasticResultTask, ElasticResultProject, ElasticResultUser, ElasticResultGroup, ElasticResultFile, Event, UploadedFile } from '../../types/intrasocial_types';
import ApiClient, { ElasticResult, SearchArguments } from "../../network/ApiClient";
import { Avatar } from '../general/Avatar';
import { SearchBox } from "../general/input/contextsearch/SearchBox";
import { EditorState } from "draft-js";
import { nullOrUndefined, truncate, userFullName } from "../../utilities/Utilities";
import { FormGroup, Label, Input, Button } from "reactstrap";
import { translate } from "../../localization/AutoIntlProvider";
import CursorList from "../general/input/contextsearch/CursorList";
import { CursorListItem } from '../general/input/contextsearch/CursorList';
import { ProjectManager } from '../../managers/ProjectManager';
import { CommunityManager } from '../../managers/CommunityManager';
import { LinkObject } from "./BreadcrumbNavigation";
import { Link } from "react-router-dom";
import { GroupManager } from '../../managers/GroupManager';
import { EventManager } from "../../managers/EventManager";
import { TaskManager } from "../../managers/TaskManager";
import { TimeComponent } from "../general/TimeComponent";
import { ProfileManager } from "../../managers/ProfileManager";
import FileListItem from "../../modules/files/FileListItem";
import LoadingSpinner from "../LoadingSpinner";
import { InsertEntity } from '../general/input/contextsearch/extensions/index';
import { OverflowMenuItem, OverflowMenuItemType } from "../general/OverflowMenu";
import { DropDownMenu } from "../general/DropDownMenu";
import { DateTimePicker } from "../general/input/DateTimePicker";
import { Moment } from "moment";
import * as moment from "moment-timezone";
let timezone = moment.tz.guess()

type BreadcrumbData = {community?:number, group?:number, event?:number, project?:number, task?:number, profile?:number}
export enum SearchSortOptions {
    relevance = "relevance",
    date = "date"
}
export interface Props {
    onClose:() => void
}
export interface State {

    searchActive:boolean
    activeSearchType:ElasticSearchType
    searchData:ContextSearchData
    searchResult:ElasticResult<GenericElasticResult>
    searchHistory:SearchHistory[]
    searchTypeFilters:ElasticSearchType[]
    requestId:number
    hasMore:boolean
    isLoading:boolean
    searchSortValue:SearchSortOptions
    fromDate:Moment
    toDate:Moment
}
const allowedSearchContextFilters:SearchOption[] = []
allowedSearchContextFilters.push(new SearchOption("community", null, 2,  ElasticSearchType.COMMUNITY, ["user", "group", "event", "project", "task", ], "newsfeed.menu.filter.community.description"))
allowedSearchContextFilters.push(new SearchOption("group", null, 1, ElasticSearchType.GROUP, [], "newsfeed.menu.filter.group.description"))
allowedSearchContextFilters.push(new SearchOption("from", "user", 2, ElasticSearchType.USER, ["community", "group", "event", "project", "task", ], "newsfeed.menu.filter.user.description"))
allowedSearchContextFilters.push(new SearchOption("project", null, 1, ElasticSearchType.PROJECT, ["task", ], "newsfeed.menu.filter.project.description"))
allowedSearchContextFilters.push(new SearchOption("task", null, 1, ElasticSearchType.TASK, [], "newsfeed.menu.filter.task.description"))
allowedSearchContextFilters.push(new SearchOption("event", null, 1,  ElasticSearchType.EVENT, [], "newsfeed.menu.filter.event.description"))

const allowedSearchTypeFilters:ElasticSearchType[] = [
    ElasticSearchType.COMMUNITY,
    ElasticSearchType.GROUP,
    ElasticSearchType.USER,
    ElasticSearchType.PROJECT,
    ElasticSearchType.TASK,
    ElasticSearchType.EVENT,
    ElasticSearchType.STATUS,
    ElasticSearchType.UPLOADED_FILE,
]
const SearchResultItem = (props: {className?:string, left?:React.ReactNode, header?:React.ReactNode, description?:React.ReactNode, footer?:React.ReactNode, right?:React.ReactNode} ) => {
    const {className,left, header, description,footer, right, ...rest} = props
    const cn = classnames("result-item border-1", className)
    return (<div className={cn} {...rest}>
                {left && <div className="left">{left}</div>}
                <div className="content">
                    {header && <div className="header primary-text">{header}</div>}
                    {description && <div className="description secondary-text medium-small-text">{description}</div>}
                    {footer && <div className="footer secondary-text medium-small-text">{footer}</div>}
                </div>
                {right && <div className="right">{right}</div>}
            </div>)
}
export class SearchComponent extends React.Component<Props, State> {
    
    searchTextInput = React.createRef<SearchBox>()
    fromDatimepicker = React.createRef<DateTimePicker>()
    toDatimepicker = React.createRef<DateTimePicker>()
    allowMultipleFilters = true
    delayTimer:NodeJS.Timer = null
    pageSize:number = 30
    serializedDateFormat = "YYYY-MM-DDTHH:mm"
    constructor(props:Props) {
        super(props)
        this.state = {
            searchActive:false,
            activeSearchType:null,
            searchData:new ContextSearchData({tokens:[], query:"", tags:[], filters:{}, stateTokens:[], originalText:""}),
            searchResult:null,
            searchHistory:[],
            searchTypeFilters:[],
            requestId:0,
            hasMore:false,
            isLoading:false,
            searchSortValue:SearchSortOptions.relevance,
            fromDate:null,
            toDate:null,
        }
    }
    onDidScroll = (event: React.UIEvent<any>) => {
        let isAtBottom = event.currentTarget.scrollTop + event.currentTarget.offsetHeight >= event.currentTarget.scrollHeight
        if(isAtBottom)
        {
            this.handleLoadMore()
        }
    }
    handleLoadMore = () =>
    {
        if(!this.state.hasMore || this.state.isLoading)
        {
            return
        }
        this.setState((prevState:State) => ({
            isLoading: true,
            requestId:prevState.requestId + 1
        }), this.onSearchDataChanged)
    }
    componentDidMount = () => {
        this.loadSearchHistory()
    }
    loadSearchHistory()
    {
        ApiClient.getSearchHistory((response, status, error) => {
            if(response)
            {
                let history = response.results || []
                this.setState((prevState) => {
                    return {searchHistory:history}
                })
            }
        })
    }
    isEmptySearchQuery = () => {
        const query = this.state.searchData.originalText
        return query.length == 0 && this.state.searchTypeFilters.length == 0
    }
    onSearchFocus = (event:React.SyntheticEvent<any>) => {
        //this.changeActiveState(true)
    }
    onSearchBlur = (event:React.SyntheticEvent<any>) => {
        //this.changeActiveState(false)

    }
    onSearchQueryChange = (editorState:EditorState) => {
        const searchData = SearcQueryManager.getContextSearchData(editorState, allowedSearchContextFilters)
        if(this.state.searchData && this.state.searchData.originalText == searchData.originalText)
            return

        const activeSearchType = SearcQueryManager.getActiveSearchType(searchData, editorState.getSelection().getFocusOffset(), allowedSearchContextFilters)
        this.setState((prevState:State) => {
            return { activeSearchType , searchData, requestId:prevState.requestId + 1, isLoading:true, searchResult:null}
        }, this.reloadDataDelayed)
    }
    toggleTypeFilter = (type:ElasticSearchType) => () => {

        this.setState((prevState) => {
            const types = [...prevState.searchTypeFilters]
            const index = types.indexOf(type)
            if(index > -1)
                types.splice(index, 1)
            else 
                types.push(type)
            return {searchTypeFilters:types, requestId:prevState.requestId + 1, isLoading:true, searchResult:null}
        },this.onSearchDataChanged)
    }
    reloadDataDelayed() {
        clearTimeout(this.delayTimer)
        this.delayTimer = setTimeout(() =>
        {
            this.onSearchDataChanged()
        }, 500)
    }
    getSearchFieldFocusOffset = () => {
        return (this.searchTextInput.current &&  this.searchTextInput.current.getFocusOffset()) || 0
    }
    isSearchForbidden = (searchData:ContextSearchData) => {
        return !this.allowMultipleFilters && !!searchData.tokens.find(t => t.type == SearchEntityType.ID_OBJECT)
    }
    getRealFilters = (filters:{[key:string]:string}) => {
        const clone = {...filters}
        const keysToAlter = allowedSearchContextFilters.filter(f => !nullOrUndefined( f.name ))
        keysToAlter.forEach(k => {
            const val = clone[k.name]
            if(val)
                delete Object.assign(clone, {[k.key]: val })[k.name]
        })
        return clone
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
    onSearchDataChanged = () => {

        const isEmptySearch = this.isEmptySearchQuery()
        if(isEmptySearch)
        {
            if(this.state.searchResult != null)
            {
                this.setState((prevState) => {
                    return {searchResult:null}
                }, this.loadSearchHistory)
            }
            return
        }
        const requestId = this.state.requestId
        const data = this.state.searchData
        const activeSearchTypes = !!this.state.activeSearchType ? [this.state.activeSearchType] : []//this.state.searchTypeFilters
        const hasActiveSearchType = activeSearchTypes.length > 0
        let types = hasActiveSearchType ? activeSearchTypes : allowedSearchTypeFilters
        const currentFilters = data.filters
        if(!hasActiveSearchType && this.state.searchTypeFilters.length > 0)
        {
            types = this.state.searchTypeFilters
            /*
            this.state.searchTypeFilters.forEach(f => {
                const st = allowedSearchOptions.find(so => so.value == f)
                currentFilters[st.getName()] = "*" + data.query + "*"
            })*/
        }
        const q = hasActiveSearchType ? "" : data.query
        const searchForbidden = types.length == 0 || this.isSearchForbidden(data)
        if(searchForbidden)
        {
            console.log("searchForbidden")
            return;
        }
        const items = this.state.searchResult && this.state.searchResult.results || []
        const offset = items.length
        const sortOnDate = this.state.searchSortValue == SearchSortOptions.date
        let fromDate = this.state.fromDate && this.state.fromDate.format(this.serializedDateFormat)
        let toDate = this.state.toDate && this.state.toDate.format(this.serializedDateFormat)

        const args:SearchArguments = {
            term:q,
            types,
            include_results:true,
            include_aggregations:true,
            filters:this.getRealFilters(currentFilters),
            tags:data.tags,
            date_sort:sortOnDate,
            from_date:fromDate || undefined,
            to_date:toDate || undefined
        }
        ApiClient.search2(this.pageSize, offset, args,(searchResult, status, error) => {
            this.setState((prevState) => {
                if(requestId == prevState.requestId)
                {
                    if(offset > 0)
                    {
                        searchResult.results = [...items, ...searchResult.results]
                    }
                    else {
                        this.logSearch(data.originalText)
                    }
                    return {searchResult, hasMore:searchResult.next != null, isLoading:false}
                }
                return null
            })
        })
    }
    logSearch = (term:string) => {
        if(!term || term.length == 0)
            return
        ApiClient.createSearchHistory(term, (data, status, error) => {
            if(data && data.results)
            {
                this.setState((prevState:State) => {
                    return {searchHistory:data.results}
                })
            }
        })
    }
    renderSearchBox = () => {
        const cn = classnames("border-1",{"active":this.state.searchActive})
        return <SearchBox id="global_search" className={cn}
                onFocus={this.onSearchFocus}
                onBlur={this.onSearchBlur}
                ref={this.searchTextInput}
                {...this.props}
                onChange={this.onSearchQueryChange}
                placeholder={"Search"}
                data={this.state.searchData}
                multiline={false}
                allowedSearchOptions={allowedSearchContextFilters}
                
        />
    }
    setSearchQuery = (text:string) => () =>  {
        let state = this.editorState()
        state = SearcQueryManager.clearState(state)
        state = SearcQueryManager.appendText(text, true, state)
        state = SearcQueryManager.appendText(" ", true, state)
        this.applyState(state)
    }
    editorState = () => {
        return this.searchTextInput.current.editorState()
    }
    applyState = (editorState:EditorState) => {
        this.searchTextInput.current.applyState(editorState)
    }
    
    deleteHistoryItem = (id:number) => (event:React.SyntheticEvent) => {
        event.preventDefault()
        event.stopPropagation()
        ApiClient.deleteSearchHistory(id, () => {
            this.setState((prevState:State) => {
                let history = this.state.searchHistory
                let elementIndex = history.findIndex((item) => {
                    return item.id === id
                })
                if(elementIndex >= 0)
                {
                    history.splice(elementIndex, 1)
                }
                return {searchHistory:history}
            })
            
        })
    }
    renderSearchHistory = () => {
        
        const isEmptySearch = this.isEmptySearchQuery()
        if(!isEmptySearch)
            return null
        const history = this.state.searchHistory
        return <div className="search-history">
                {history.map(h => {
                        return <div key={h.id} className="history-item" onClick={this.setSearchQuery(h.term)}>
                        {h.term} 
                        <Button size="xs" className="history-item-clear" onClick={this.deleteHistoryItem(h.id)}>
                            <i className="fa fa-times-circle"  />
                        </Button>
                        </div>
                    })}
                </div>
    }
    renderSearchTypeFiltersList = () => {
        
        const isEmptySearch = this.isEmptySearchQuery()
        if(!isEmptySearch)
            return null
        return <div className="search-filters">
                    <div className="type-filter">
                    {allowedSearchTypeFilters.map(st => {
                        return <div className="filter-item" key={st} onClick={this.toggleTypeFilter(st)}>
                            <i className={ElasticSearchType.iconClassForKey(st)}></i>
                            {ElasticSearchType.nameForKey(st)}
                        </div>
                    })}
                    </div>
                </div>
    }
    onFromTimeChanged = (value: Moment, name: string) => {
        this.setState((prevState:State) => {
            return {fromDate:value, requestId:prevState.requestId + 1, isLoading:true, searchResult:null}
        }, this.onSearchDataChanged)
    }
    onToTimeChanged = (value: Moment, name: string) => {
        this.setState((prevState:State) => {
            return {toDate:value, requestId:prevState.requestId + 1, isLoading:true, searchResult:null}
        }, this.onSearchDataChanged)
    }
    renderSearchDateFilter = () => {
        return <div>
                    <div className="filter-header">{translate("search.filter.date.title")}</div>
                    <DateTimePicker 
                        ref={this.fromDatimepicker} 
                        onChange={this.onFromTimeChanged} 
                        value={this.state.fromDate}
                        max={this.state.toDate}
                        format="YYYY-MM-DD HH:mm"
                        allowHoursPicker={true}
                        placeholder={translate("search.filter.date_start.title")}
                    />
                    <DateTimePicker 
                        ref={this.toDatimepicker} 
                        onChange={this.onToTimeChanged} 
                        value={this.state.toDate}
                        max={moment().tz(timezone)}
                        min={this.state.fromDate}
                        format="YYYY-MM-DD HH:mm"
                        allowHoursPicker={true}
                        placeholder={translate("search.filter.date_end.title")}
                    />
                </div>
    }
    getTextForField(object:GenericElasticResult, field:string, maxTextLength:number)
    {
        var origFieldVal = object[field] || ""
        if (object.highlights)
        {
            var higlightValues = object.highlights[field]
            if(higlightValues && higlightValues.length > 0)
            {
                let highlight = higlightValues[0]
                let start = origFieldVal.substring(0, Math.min(10, origFieldVal.length))
                let preEndPos = Math.min(10, origFieldVal.length)
                let end = origFieldVal.substring(origFieldVal.length - preEndPos)
                if(!highlight.startsWith(start))
                {
                    highlight = "&hellip; " + highlight
                }
                if(!highlight.endsWith(end))
                {
                    highlight = highlight +  " &hellip;"
                }
                return highlight
            }
        }
        if( maxTextLength )
        {
            origFieldVal = this.truncate(origFieldVal, maxTextLength, true)
        }
        return origFieldVal
    }
    truncate(value:string, n:number, useWordBoundary:boolean)
    {
        if (value.length <= n) { return value; }
        var subString = value.substr(0, n-1);
        return (useWordBoundary
           ? subString.substr(0, subString.lastIndexOf(' '))
           : subString) + "&hellip;";
    }
    renderCommunityItem = (item:ElasticResultCommunity) => {
        const avatar = item.avatar || ContextNaturalKey.defaultAvatarForKey(ElasticSearchType.contextNaturalKeyForType(item.object_type))
        const left = <Avatar image={avatar} size={36} />
        const members = item.members || []
        const footer = <div className="text-bolder">{`${members.length} ${members.length > 1 ? translate("Members") : translate("Member")}`}</div>
        const d = this.getTextForField(item, "description", 300)
        const description = <span dangerouslySetInnerHTML={{__html: d}}></span>
        const right = ElasticSearchType.nameForKey( item.object_type )
        const n = this.getTextForField(item, "name", 150)
        const name = <span dangerouslySetInnerHTML={{__html: n}}></span>
        return <SearchResultItem className={item.object_type.toLowerCase()} header={name} description={description} footer={footer} left={left} right={right} />
    }
    renderGroupItem = (item:ElasticResultGroup) => {
        const avatar = item.avatar || ContextNaturalKey.defaultAvatarForKey(ElasticSearchType.contextNaturalKeyForType(item.object_type))
        const left = <Avatar image={avatar} size={36} />
        const members = item.members || []
        const breadcrumbs = this.breadcrumbs({community:item.community, group:item.parent_id})
        const footer = <div className="text-bolder">{`${members.length} ${members.length > 1 ? translate("Members") : translate("Member")}`}{" "}{breadcrumbs}</div>
        const d = this.getTextForField(item, "description", 300)
        const description = <span dangerouslySetInnerHTML={{__html: d}}></span>
        const right = ElasticSearchType.nameForKey( item.object_type )
        const n = this.getTextForField(item, "name", 150)
        const name = <span dangerouslySetInnerHTML={{__html: n}}></span>
        return <SearchResultItem className={item.object_type.toLowerCase()} header={name} description={description} footer={footer} left={left} right={right} />
    }
    renderUserItem = (item:ElasticResultUser) => {
        const avatar = item.avatar || ContextNaturalKey.defaultAvatarForKey(ElasticSearchType.contextNaturalKeyForType(item.object_type))
        const left = <Avatar image={avatar} size={36} style={{borderRadius:"6px"}} />
        const d = this.getTextForField(item, "biography", 300)
        const description = <span dangerouslySetInnerHTML={{__html: d}}></span>
        const right = ElasticSearchType.nameForKey( item.object_type )
        const n = this.getTextForField(item, "user_name", 150)
        const name = <span dangerouslySetInnerHTML={{__html: n}}></span>
        return <SearchResultItem className={item.object_type.toLowerCase()} header={name} description={description} left={left} right={right} />
    }
    renderProjectItem = (item:ElasticResultProject) => {
        const avatar = item.avatar || ContextNaturalKey.defaultAvatarForKey(ElasticSearchType.contextNaturalKeyForType(item.object_type))
        const left = <Avatar image={avatar} size={36} />
        const members = item.members || []
        const breadcrumbs = this.breadcrumbs({community:item.community})
        const footer = <div className="text-bolder">{`${members.length} ${members.length > 1 ? translate("Members") : translate("Member")}`}{" "}{breadcrumbs}</div>
        const d = this.getTextForField(item, "description", 300)
        const description = <span dangerouslySetInnerHTML={{__html: d}}></span>
        const right = ElasticSearchType.nameForKey( item.object_type )
        const n = this.getTextForField(item, "name", 150)
        const name = <span dangerouslySetInnerHTML={{__html: n}}></span>
        return <SearchResultItem className={item.object_type.toLowerCase()} header={name} description={description} footer={footer} left={left} right={right} />
    }
    navigateToLocation = (url:string) => (e:React.SyntheticEvent) => {
        e.stopPropagation()
        window.app.navigateToRoute(url)
        this.props.onClose()
    }
    breadcrumbsFromContext = (contextNaturalKey:ContextNaturalKey, contextObjectId:number, breadcrumbData?:BreadcrumbData) => {
        const data:BreadcrumbData = breadcrumbData || {}
        switch (contextNaturalKey) {
            case ContextNaturalKey.COMMUNITY:
                data.community = contextObjectId
                break;
            case ContextNaturalKey.GROUP:
                data.group = contextObjectId
                break;
            case ContextNaturalKey.EVENT:
                data.event = contextObjectId
                break;
            case ContextNaturalKey.PROJECT:
                data.project = contextObjectId
                break;
            case ContextNaturalKey.TASK:
                data.task = contextObjectId
                break;
            case ContextNaturalKey.USER:
                data.profile = contextObjectId
                break;
            default:
                break;
        }
        return this.breadcrumbs(data)
    }
    breadcrumbs = (data:BreadcrumbData) => {
        const {community, group, event, project, task, profile} = data
        let breadcrumbs:LinkObject[] = []
        if(community)
        {
            const communityObject = CommunityManager.getCommunityById(community)
            if(communityObject)
                breadcrumbs.push({uri:communityObject.uri, title:communityObject.name})
        }
        if(group)
        {
            const groupObject = GroupManager.getGroupById(group)
            if(groupObject)
                breadcrumbs.push({uri:groupObject.uri, title:groupObject.name})
        }
        if(event)
        {
            const eventObject = EventManager.getEventById(event)
            if(eventObject)
                breadcrumbs.push({uri:eventObject.uri, title:eventObject.name})
        }
        if(project)
        {
            const projectObject = ProjectManager.getProjectById(project)
            if(projectObject)
                breadcrumbs.push({uri:projectObject.uri, title:projectObject.name})
        }
        if(task)
        {
            const taskObject = TaskManager.getTask(task)
            if(taskObject)
                breadcrumbs.push({uri:taskObject.uri, title:taskObject.title})
        }
        if(profile)
        {
            const profileObject = ProfileManager.getProfileById(profile)
            if(profileObject)
                breadcrumbs.push({uri:profileObject.uri, title:userFullName(profileObject)})
        }
        breadcrumbs = breadcrumbs.filter(e => !nullOrUndefined(e))
        const arr:JSX.Element[] = []
        breadcrumbs.forEach((s,i) => {
            arr.push(<Link className="primary-theme-color medium-text" key={"link_" + i} to={s.uri}>{truncate(s.title, 20)}</Link>)
            if(i < breadcrumbs.length - 1)
                arr.push(<i key={"sep_" + i} className="fas fa-caret-right mx-1"></i>)
        })
        return arr
    }
    renderTaskItem = (item:ElasticResultTask) => {
        const breadcrumbs = this.breadcrumbs({community:item.community, project:item.project_id, task:item.parent_id    })
        const left = <i className={ElasticSearchType.iconClassForKey(item.object_type)}></i>
        const footer = <div className="text-bolder">{breadcrumbs}</div>
        const d = this.getTextForField(item, "description", 300)
        const description = <span dangerouslySetInnerHTML={{__html: d}}></span>
        const right = ElasticSearchType.nameForKey( item.object_type )
        const t = this.getTextForField(item, "title", 150)
        const title = <span dangerouslySetInnerHTML={{__html: t}}></span>
        return <SearchResultItem className={item.object_type.toLowerCase()} header={title} description={description} footer={footer} left={left} right={right} />
    }
    renderEventItem = (item:ElasticResultEvent) => {
        const avatar = item.avatar || ContextNaturalKey.defaultAvatarForKey(ElasticSearchType.contextNaturalKeyForType(item.object_type))
        const left = <Avatar image={avatar} size={36} />
        const members = item.members || []
        const breadcrumbs = this.breadcrumbs({community:item.community, event:item.parent_id})
        const footer = <div className="text-bolder">{`${members.length} ${translate("Going")}`}{" "}{breadcrumbs}</div>
        const d = this.getTextForField(item, "description", 300)
        const description = <span dangerouslySetInnerHTML={{__html: d}}></span>
        const right = ElasticSearchType.nameForKey( item.object_type )
        const n = this.getTextForField(item, "name", 150)
        const name = <span dangerouslySetInnerHTML={{__html: n}}></span>
        return <SearchResultItem className={item.object_type.toLowerCase()} header={name} description={description} footer={footer} left={left} right={right} />
    }
    renderStatusItem = (item:ElasticResultStatus) => {
        const avatar = item.profile_avatar || ContextNaturalKey.defaultAvatarForKey(ElasticSearchType.contextNaturalKeyForType(ElasticSearchType.USER))
        const left = <Avatar image={avatar} size={36} />
        const breadcrumbs = this.breadcrumbsFromContext(item.context_natural_key, item.context_object_id)
        const footer = <div className="text-bolder">{breadcrumbs}{" "}<TimeComponent date={item.created_at} /> </div>
        const text = this.getTextForField(item, "text", 300)//item.text && truncate( IntraSocialUtilities.htmlToText(item.text), 300)
        const description = <span dangerouslySetInnerHTML={{__html: text}}></span>
        const right = ElasticSearchType.nameForKey( item.object_type )
        const un = this.getTextForField(item, "user_name", 150)
        const user_name = <span dangerouslySetInnerHTML={{__html: un}}></span>
        return <SearchResultItem className={item.object_type.toLowerCase()} header={user_name} description={description} footer={footer} left={left} right={right} />
    }
    renderFileItem = (item:ElasticResultFile) => {

        const left = <FileListItem dropShadow={false} showImageOnly={true} file={item as any as UploadedFile} />
        const creatorLink = this.breadcrumbs({profile:item.user_id})
        const breadcrumbs = this.breadcrumbsFromContext(item.context_natural_key, item.context_object_id)
        const hasBreadcrumbs = breadcrumbs.length > 0
        const footer = <div className="text-bolder">{creatorLink}{hasBreadcrumbs ? " " + translate("in_context") + " ": ""}{breadcrumbs}{" "}<TimeComponent date={item.created_at} /> </div>
        const right = ElasticSearchType.nameForKey( item.object_type )
        const fn = this.getTextForField(item, "filename", 150)
        const filename = <span dangerouslySetInnerHTML={{__html: fn}}></span>
        return <SearchResultItem className={item.object_type.toLowerCase()} header={filename} footer={footer} left={left} right={right} />
    }
    renderResultItem = (item:GenericElasticResult) => {
        switch (item.object_type) {
            case ElasticSearchType.COMMUNITY: return this.renderCommunityItem(item as ElasticResultCommunity)
            case ElasticSearchType.GROUP: return this.renderGroupItem(item as ElasticResultGroup)
            case ElasticSearchType.USER: return this.renderUserItem(item as ElasticResultUser)
            case ElasticSearchType.PROJECT: return this.renderProjectItem(item as ElasticResultProject)
            case ElasticSearchType.TASK: return this.renderTaskItem(item as ElasticResultTask)
            case ElasticSearchType.EVENT: return this.renderEventItem(item as ElasticResultEvent)
            case ElasticSearchType.STATUS: return this.renderStatusItem(item as ElasticResultStatus)
            case ElasticSearchType.UPLOADED_FILE: return this.renderFileItem(item as ElasticResultFile)
            default:return <div>{item.object_type + " " + item.django_id}</div>
        }
    }
    toggleSortOption = () => {
        this.setState((prevState:State) => {
            const so = prevState.searchSortValue == SearchSortOptions.date ? SearchSortOptions.relevance : SearchSortOptions.date
            return {searchSortValue:so, requestId:prevState.requestId + 1, isLoading:true, searchResult:null}
        }, this.onSearchDataChanged)
    }
    renderSortOptions = () => {
        const arr = Object.keys(SearchSortOptions).map(k => {
            return {id:k, type:OverflowMenuItemType.option, title:translate("search.sort." + k), onPress:this.toggleSortOption}
        })
        const title = this.state.searchSortValue
        return (
            <div style={{zIndex:1080}}>
                <DropDownMenu triggerTitle={title} className="sort-option-dropdown" triggerClass="fas fa-caret-down mx-1" items={arr}></DropDownMenu>
            </div>
        )
    }
    renderSearchResult = () => {
        
        const isEmptySearch = this.isEmptySearchQuery()
        if(isEmptySearch)
            return null
        const isLoading = this.state.isLoading
        const count = this.state.searchResult && this.state.searchResult.count || 0
        const result = this.state.searchResult && this.state.searchResult.results || []
        const aggregations = this.state.searchResult && this.state.searchResult.stats && this.state.searchResult.stats.aggregations || {}
        const hasActiveContextSearchType = !!this.state.activeSearchType
        const items = result.map(r => {
            
            return <CursorListItem key={r.object_type + "_" + r.django_id } onSelect={() => {
                            const object = r as any
                            const slug = object.slug || ""
                            if(hasActiveContextSearchType)
                            {
                                this.searchTextInput.current
                                const fn = allowedSearchContextFilters.find(so => so.value == r.object_type).getName()
                                let state = this.editorState()
                                const title = object.name || object.title || object.user_name
                                let start = 0
                                let end = 0
                                const focusOffset = state.getSelection().getFocusOffset()
                                const activeToken = SearcQueryManager.getActiveSearchToken(this.state.searchData.tokens, focusOffset)
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
                                const ent:InsertEntity = {type:SearchEntityType.ID_OBJECT, text: "@"+slug, data:{name:slug, id:r.django_id, key:fn, title:title}, start, end, appendSpace:true}
                                state = SearcQueryManager.insertEntities([ent], state)
                                this.applyState(state)
                            }
                            else //navigate to item
                            {
                                window.app.navigateToRoute(r.uri)
                                this.props.onClose()
                            }
                        }}>
                        {this.renderResultItem(r)}
                    </CursorListItem>
        })
        const resultCountStyle:React.CSSProperties = {}
        if(isLoading)
            resultCountStyle.visibility = "hidden"
        return (<>

                    <div className="search-result-header">
                        <div style={resultCountStyle} className="search-result-count">{count + " " + translate("results")}</div>
                        <div className="sorting">
                            {this.renderSortOptions()}
                        </div>
                    </div>
                    <div className="search-results">
                    <div className="left">
                        <CursorList items={items} />
                        {isLoading && <LoadingSpinner />}
                    </div>
                    <div className="right">
                        <div className="filter-header">{translate("search.filter.types.title")}</div>
                        {allowedSearchTypeFilters.map(tf => {
                            const checked = this.state.searchTypeFilters.contains(tf)
                            const aggr = aggregations[tf] 
                            const count = aggr && aggr.doc_count || -1
                            const filterName = ElasticSearchType.nameForKey(tf)
                            const text = count > -1 ? `${filterName}(${count})` : filterName
                            return <FormGroup className="type-filter" key={tf} check={true}>
                                <Label check={true}>
                                    <Input type="checkbox" onChange={this.toggleTypeFilter(tf)} checked={checked} />{text}
                                </Label>
                            </FormGroup>
                        })}
                        {this.renderSearchDateFilter()}
                    </div>
                </div></>)
    }
    renderDebug = () => {
        console.log("SearchData:", this.state.searchData)
        return <div>{this.state.searchData.query}</div>
    }
    render = () => {
        return (
            <div className="search-component">
                {this.renderSearchBox()}
                {/*this.renderDebug()*/}
                {this.renderSearchHistory()}
                {this.renderSearchTypeFiltersList()}
                {this.renderSearchResult()}

            </div>
        );
    }
}