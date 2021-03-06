import * as React from "react";
import { connect } from 'react-redux'
import "./StatusModule.scss"
import { Status, StatusActions, ContextNaturalKey } from '../../types/intrasocial_types';
import { ReduxState } from "../../redux";
import {ApiClient} from "../../network/ApiClient";
import LoadingSpinner from "../../components/LoadingSpinner";
import { withRouter, RouteComponentProps } from "react-router";
import NewsfeedComponentRouted, { NewsfeedComponent } from '../newsfeed/NewsfeedComponent';
type OwnProps = {
}
type ReduxStateProps = {
    statusId:number
}
type ReduxDispatchProps = {
}
type State = {
    isLoading:boolean
    loadedStatusId:number
    status:Status
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class StatusModule extends React.Component<Props, State>
{
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            loadedStatusId:null,
            status:null
        }
    }
    componentDidMount = () => {
        this.fetchData()
    }
    componentDidUpdate = () => {
        this.fetchData()
    }
    highlightStatus = (parent:Status, statusId:number) => {
        if(parent.id == statusId)
        {
            parent.highlightMode = true
            return
        }
        const c = parent.children || []
        c.forEach(child => {
            this.highlightStatus(child, statusId)
        })
    }
    fetchData = () => {
        const {loadedStatusId, isLoading} = this.state
        const {statusId} = this.props
        if(!statusId || loadedStatusId == statusId || isLoading)
            return
        this.setState((prevState:State) => {
            return {isLoading:true}
        }, () => {
            ApiClient.statusSingle(statusId,(data, status, error) => {
                const parent = data && data.parent
                if(parent)
                {
                    parent.children = (data.results || [])//.sort((a, b) => b.position - a.position)
                    parent.comments = data.count
                }
                parent && this.highlightStatus(parent, statusId)
                this.setState((prevState:State) => {
                    return {status:parent, isLoading:false, loadedStatusId:statusId}
                })
            })
        })
    }
    renderLoading = () =>
    {
        return (<LoadingSpinner />)
    }
    renderError = () => {
        return <div>Error</div>
    }
    renderStatus = () => {
        const {status} = this.state
        return <NewsfeedComponentRouted rootStatus={status} highlightStatusId={this.props.statusId}/>
    }
    render() {
        const {isLoading, loadedStatusId: hasLoaded, status} = this.state
        if(isLoading || !hasLoaded)
            return this.renderLoading()
        if(status)
        {
            return this.renderStatus()
        }
        return this.renderError()
    }
}
const mapStateToProps = (state:ReduxState, ownProps:OwnProps & RouteComponentProps<any>) => {
    const statusId = parseInt(ownProps.match.params.statusid)
    return {
        statusId,
    }
}
export default withRouter(connect<ReduxStateProps, null, OwnProps>(mapStateToProps, null)(StatusModule));