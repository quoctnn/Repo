import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./CommunitiesModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import { ContextNaturalKey, Community } from '../../types/intrasocial_types';
import CommunitiesMenu, { CommunitiesMenuData } from './CommunitiesMenu';
import ListComponent from '../../components/general/ListComponent';
import {ApiClient,  PaginationResult, ListOrdering } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import CommunityListItem from './CommunityListItem';
import SimpleModule from '../SimpleModule';
import { CommonModuleProps } from '../Module';

type OwnProps = {
    breakpoint: ResponsiveBreakpoint
    isMember?: boolean
} & CommonModuleProps
type State = {
    isLoading: boolean
    menuData: CommunitiesMenuData
}
type ReduxStateProps = {
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class CommunitiesModule extends React.Component<Props, State> {
    tempMenuData: CommunitiesMenuData = null
    communitiesList = React.createRef<ListComponent<Community>>()
    static defaultProps: CommonModuleProps = {
        pageSize: 15,
    }
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: true,
            menuData: {
            }
        }
    }
    componentWillUnmount = () => {
        this.tempMenuData = null
        this.communitiesList = null
    }
    componentDidUpdate = (prevProps: Props) => {
        if (prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading) {
            this.setState({ isLoading: false })
        }
    }
    headerClick = (e) => {
        const context = this.state.menuData
    }
    feedLoadingStateChanged = (isLoading: boolean) => {
        this.setState({ isLoading })
    }
    renderLoading = () => {
        if (this.state.isLoading) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading" />)
        }
    }
    menuDataUpdated = (data: CommunitiesMenuData) => {
        this.tempMenuData = data
    }
    fetchCommunities = (offset: number, completion: (items: PaginationResult<Community>) => void) => {
        const isMember = this.props.isMember || true
        ApiClient.getCommunities(isMember, ListOrdering.MOST_USED, this.props.pageSize, offset, (data, status, error) => {
            completion(data)
            ToastManager.showRequestErrorToast(error)
        })
    }
    renderCommunity = (community: Community) => {
        return <CommunityListItem key={community.id} community={community} />
    }
    renderContent = () => {
        return <>
            <ListComponent<Community>
                loadMoreOnScroll={!this.props.showLoadMore}
                ref={this.communitiesList}
                onLoadingStateChanged={this.feedLoadingStateChanged}
                fetchData={this.fetchCommunities}
                renderItem={this.renderCommunity} />
        </>
    }
    onMenuToggle = (visible: boolean) => {
        const newState: Partial<State> = {}
        if (!visible && this.tempMenuData) // update menudata
        {
            newState.menuData = this.tempMenuData
            this.tempMenuData = null
        }
        this.setState(newState as State)
    }
    renderModalContent = () => {
        return <CommunitiesModule {...this.props} pageSize={50} style={{height:undefined, maxHeight:undefined}} showLoadMore={false} showInModal={false} isModal={true}/>
    }
    render() {
        const { history, match, location, staticContext, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, ...rest } = this.props
        const { breakpoint, className } = this.props
        const cn = classnames("communities-module", className)
        const menu = <CommunitiesMenu data={this.state.menuData} onUpdate={this.menuDataUpdated} />
        const renderModalContent = !showInModal || isModal ? undefined : this.renderModalContent
        return (<SimpleModule {...rest}
            showHeader={!isModal}
            renderModalContent={renderModalContent}
            className={cn}
            headerClick={this.headerClick}
            breakpoint={breakpoint}
            isLoading={this.state.isLoading}
            onMenuToggle={this.onMenuToggle}
            menu={menu}
            headerTitle={translate("communities.module.title")}>
            {this.renderContent()}
        </SimpleModule>)
    }
}
const mapStateToProps = (state: ReduxState, ownProps: OwnProps): ReduxStateProps => {
    return {
    }
}
const mapDispatchToProps = (dispatch: ReduxState, ownProps: OwnProps): ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(CommunitiesModule))