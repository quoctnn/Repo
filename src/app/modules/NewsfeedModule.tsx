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
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class NewsfeedModule extends React.Component<Props, State> {     

    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false
        }
    }
    menuItemClick = (e) => {
        this.setState({menuVisible:!this.state.menuVisible})
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, className,  ...rest} = this.props
        const cn = classnames("newsfeed-module", className, {"menu-visible":this.state.menuVisible})
        return (<Module {...rest} className={cn}>
                    <ModuleHeader >
                        <div className="flex-grow-1 text-truncate">NewsFeed Header</div>
                        <ModuleMenuTrigger onClick={this.menuItemClick} />
                    </ModuleHeader>
                    {breakpoint >= ResponsiveBreakpoint.Standard && 
                        <>
                            <ModuleContent>
                                <NewsfeedComponent />
                            </ModuleContent>
                            <ModuleFooter>NewsFeed Footer</ModuleFooter>
                        </>
                    }
                    <ModuleMenu visible={this.state.menuVisible}>
                        Menu
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