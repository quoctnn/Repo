import * as React from 'react';
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import classnames from "classnames"
import "./NewsfeedModule.scss"
import ModuleMenu from '../ModuleMenu';
import ModuleMenuTrigger from '../ModuleMenuTrigger';
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import NewsfeedComponent from './NewsfeedComponent';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import NewsfeedMenu, { NewsfeedMenuData, allowedSearchOptions } from './NewsfeedMenu';
import { ObjectAttributeType, ContextNaturalKey } from '../../types/intrasocial_types';
import { ButtonGroup, Button } from 'reactstrap';
import { ContextSearchData } from '../../components/general/input/contextsearch/extensions';
import { translate } from '../../localization/AutoIntlProvider';
import ApiClient from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { convertElasticResultItem, ContextValue } from '../../components/general/input/ContextFilter';

interface OwnProps 
{
    className?:string
    breakpoint:ResponsiveBreakpoint
}
interface ReduxStateProps 
{
}
interface ReduxDispatchProps 
{
}
interface State 
{
    menuVisible:boolean
    isLoading:boolean
    selectedSearchContext:ContextSearchData
    includeSubContext:boolean
    filter:ObjectAttributeType

    contextNaturalKey:string,
    contextObjectId:number
    contextTitle:string
    contextResolveError:string
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class NewsfeedModule extends React.Component<Props, State> {     
    tempMenuData:NewsfeedMenuData = null
    availableFilters = [ObjectAttributeType.important, ObjectAttributeType.pinned, ObjectAttributeType.reminder, ObjectAttributeType.attention]
    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false,
            selectedSearchContext: new ContextSearchData({tokens:[], query:"", tags:[], filters:{}, stateTokens:[], originalText:""}),
            includeSubContext:true,
            filter:null,
            isLoading:false,
            contextNaturalKey:undefined,
            contextObjectId:undefined,
            contextTitle:undefined,
            contextResolveError:undefined
        }
    }
    componentDidUpdate = (prevProps:Props) => {
        //turn off loading spinner if feed is removed
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    headerClick = (e) => {
        const context = this.state.selectedSearchContext
        //NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    menuItemClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const visible = !this.state.menuVisible
        const newState:Partial<State> = {menuVisible:visible}
        if(!visible && this.tempMenuData)
        {
            newState.selectedSearchContext = this.tempMenuData.selectedSearchContext
            newState.includeSubContext = this.tempMenuData.includeSubContext
            newState.filter = this.tempMenuData.filter
            const contextObject = this.tempMenuData.selectedSearchContext.contextObject(allowedSearchOptions)
            this.tempMenuData = null

            newState.contextObjectId = undefined
            newState.contextTitle = undefined
            newState.contextNaturalKey = contextObject && contextObject.contextNaturalKey

            if(contextObject)
            {
                console.log("selectedSearchContext", contextObject)
                if(contextObject.id && contextObject.id > 0)
                {
                    newState.contextNaturalKey = contextObject.contextNaturalKey
                    newState.contextObjectId = contextObject.id
                    newState.contextTitle = contextObject.value
                }
                else {
                    //resolve if contextObject is uncomplete
                    const term = contextObject.value.isNumber() ? "django_id:" + contextObject.value : "slug:"+ contextObject.value.trimLeftCharacters("@")
                    ApiClient.search(1, 0, term, [ContextNaturalKey.elasticTypeForKey(contextObject.contextNaturalKey)],false, true,false,true,{}, [], (data, status, error) => {
                        let resolvedData:ContextValue = null
                        if(data && data.results && data.results.length > 0)
                        {
                            resolvedData = convertElasticResultItem( data.results[0] )
                        }
                        this.setState({contextNaturalKey:contextObject.contextNaturalKey, contextObjectId:resolvedData && resolvedData.id, contextTitle:resolvedData && resolvedData.label, contextResolveError:!resolvedData ? error || "Error": undefined})
                        ToastManager.showErrorToast(error)
                    })
                }
            }
        }
        this.setState(newState as State)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    renderLoading = () => {
        if (this.state.isLoading) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    menuDataUpdated = (data:NewsfeedMenuData) => {
        this.tempMenuData = data
    }
    filterButtonChanged = (filter:ObjectAttributeType) => (event) => {

        const currentFilter = this.state.filter
        const newFilter = filter == currentFilter ? null : filter
        this.setState({filter:newFilter})
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, className,  ...rest} = this.props
        const cn = classnames("newsfeed-module", className, {"menu-visible":this.state.menuVisible})
        const headerClick = breakpoint < ResponsiveBreakpoint.standard ? this.headerClick : undefined
        const {contextNaturalKey,contextObjectId, contextTitle}  = this.state
        const title = contextTitle ? contextTitle + " - " + translate("Feed") : translate("Newsfeed")
        const headerClass = classnames({link:headerClick})
        const filter = this.state.filter
        return (<Module {...rest} className={cn}>
                    <ModuleHeader className={headerClass} onClick={headerClick}>
                        <div className="flex-grow-1 text-truncate d-flex align-items-center">
                            <div className="text-truncate">{title}</div>
                            {this.renderLoading()}
                        </div>
                        {!this.state.menuVisible && 
                            <ButtonGroup>
                                {this.availableFilters.map(f => {
                                    return (<Button size="xs" key={f} active={filter == f} onClick={this.filterButtonChanged(f)} color="light">
                                                <i className={ObjectAttributeType.iconForType(f)}></i>
                                            </Button>)
                                })}
                            </ButtonGroup>
                        }
                        <ModuleMenuTrigger onClick={this.menuItemClick} />
                    </ModuleHeader>
                    {breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <>
                            <ModuleContent>
                                <NewsfeedComponent 
                                    onLoadingStateChanged={this.feedLoadingStateChanged} 
                                    includeSubContext={this.state.includeSubContext} 
                                    contextNaturalKey={contextNaturalKey} 
                                    contextObjectId={contextObjectId} 
                                    filter={this.state.filter}
                                    />
                            </ModuleContent>
                            <ModuleFooter>NewsFeed Footer</ModuleFooter>
                        </>
                    }
                    <ModuleMenu visible={this.state.menuVisible}>
                        <NewsfeedMenu 
                            onUpdate={this.menuDataUpdated} 
                            selectedSearchContext={this.state.selectedSearchContext} 
                            includeSubContext={this.state.includeSubContext} 
                            filter={this.state.filter}
                            availableFilters={this.availableFilters}
                            />
                    </ModuleMenu>
                </Module>)
    }
}
const mapStateToProps = (state:any, ownProps: OwnProps):ReduxStateProps => {
    return {
    }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(NewsfeedModule))