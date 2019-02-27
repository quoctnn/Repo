import * as React from 'react';
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from "react-router-dom";
import Module from './Module';
import ModuleHeader from './ModuleHeader';
import ModuleContent from './ModuleContent';
import ModuleFooter from './ModuleFooter';
import classnames from "classnames"
import "./NewsfeedModule.scss"
import ModuleMenu from './ModuleMenu';
import ModuleMenuTrigger from './ModuleMenuTrigger';
import { ResponsiveBreakpoint } from '../components/ResponsiveComponent';
import NewsfeedComponent from '../components/NewsfeedComponent';
import { NavigationUtilities } from '../utilities/NavigationUtilities';
import { ContextFilter, ContextValue } from '../components/general/input/ContextFilter';
import { ContextNaturalKey } from '../types/intrasocial_types';

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
    selectedContext:ContextValue
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class NewsfeedModule extends React.Component<Props, State> {     
    defaultContext:ContextValue = {label:ContextNaturalKey.NEWSFEED, type:ContextNaturalKey.NEWSFEED, id:0, value:"0"}
    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false,
            selectedContext:null,
        }
    }
    headerClick = (e) => {
        NavigationUtilities.navigateToNewsfeed(this.props.history)
    }
    menuItemClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.setState({menuVisible:!this.state.menuVisible})
    }
    onContextChange = (context:ContextValue) => {
        this.setState({selectedContext:context})
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, className,  ...rest} = this.props
        const cn = classnames("newsfeed-module", className, {"menu-visible":this.state.menuVisible})
        const headerClick = breakpoint < ResponsiveBreakpoint.Standard ? this.headerClick : undefined
        const contextNaturalKey = this.state.selectedContext && this.state.selectedContext.type
        const contextObjectId = this.state.selectedContext && this.state.selectedContext.id
        return (<Module {...rest} className={cn}>
                    <ModuleHeader onClick={headerClick}>
                        <div className="flex-grow-1 text-truncate">NewsFeed Header</div>
                        <ModuleMenuTrigger onClick={this.menuItemClick} />
                    </ModuleHeader>
                    {breakpoint >= ResponsiveBreakpoint.Standard && 
                        <>
                            <ModuleContent>
                                <NewsfeedComponent contextNaturalKey={contextNaturalKey} contextObjectId={contextObjectId} />
                            </ModuleContent>
                            <ModuleFooter>NewsFeed Footer</ModuleFooter>
                        </>
                    }
                    <ModuleMenu visible={this.state.menuVisible}>
                        <ContextFilter onValueChange={this.onContextChange} value={this.state.selectedContext} />
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