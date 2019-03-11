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
import { NavigationUtilities } from '../../utilities/NavigationUtilities';
import { ContextValue } from '../../components/general/input/ContextFilter';
import { ContextNaturalKey } from '../../types/intrasocial_types';
import { translate } from '../../localization/AutoIntlProvider';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import NewsfeedMenu, { NewsfeedMenuData } from './NewsfeedMenu';

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
    selectedContext:ContextValue
    includeSubContext:boolean
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class NewsfeedModule extends React.Component<Props, State> {     
    tempMenuData:NewsfeedMenuData = null
    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false,
            selectedContext:null,
            includeSubContext:true,
            isLoading:false,
        }
    }
    headerClick = (e) => {
        const context = this.state.selectedContext
        NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    menuItemClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const visible = !this.state.menuVisible
        const newState:any = {menuVisible:visible}
        if(!visible && this.tempMenuData)
        {
            newState.selectedContext = this.tempMenuData.selectedContext
            newState.includeSubContext = this.tempMenuData.includeSubContext
            this.tempMenuData = null
        }
        this.setState(newState)
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
    render()
    {
        const {breakpoint, history, match, location, staticContext, className,  ...rest} = this.props
        const cn = classnames("newsfeed-module", className, {"menu-visible":this.state.menuVisible})
        const headerClick = breakpoint < ResponsiveBreakpoint.standard ? this.headerClick : undefined
        const contextNaturalKey = this.state.selectedContext && this.state.selectedContext.type
        const contextObjectId = this.state.selectedContext && this.state.selectedContext.id
        const title = this.state.selectedContext ? this.state.selectedContext.label + " - " + translate("Feed") : translate("Newsfeed")
        const headerClass = classnames({link:headerClick})
        return (<Module {...rest} className={cn}>
                    <ModuleHeader className={headerClass} onClick={headerClick}>
                        <div className="flex-grow-1 text-truncate d-flex align-items-center">
                            <div className="text-truncate">{title}</div>
                            {this.renderLoading()}
                        </div>
                        <ModuleMenuTrigger onClick={this.menuItemClick} />
                    </ModuleHeader>
                    {breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <>
                            <ModuleContent>
                                <NewsfeedComponent 
                                    onLoadingStateChanged={this.feedLoadingStateChanged} 
                                    includeSubContext={this.state.includeSubContext} 
                                    contextNaturalKey={contextNaturalKey} 
                                    contextObjectId={contextObjectId} />
                            </ModuleContent>
                            <ModuleFooter>NewsFeed Footer</ModuleFooter>
                        </>
                    }
                    <ModuleMenu visible={this.state.menuVisible}>
                        <NewsfeedMenu 
                            onUpdate={this.menuDataUpdated} 
                            selectedContext={this.state.selectedContext} 
                            includeSubContext={this.state.includeSubContext} />
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