import * as React from 'react';
import classNames from "classnames";
import { StatusInteractionDialog } from './dialogs/StatusInteractionDialog';
import { ProfileManager } from '../../../managers/ProfileManager';
import { UserProfile } from '../../../types/intrasocial_types2';
require("./ReactionStats.scss");

export interface ReactionStatsProps
{
    reactionsCount:number
    reactions:{[id:string]:number[]}
}
interface ReactionStatsState
{
    showInteractionsDialog:boolean
    reactors:UserProfile[]
    loading:boolean
}
export default class ReactionStats extends React.Component<ReactionStatsProps,ReactionStatsState> {
    constructor(props) {
        super(props);

        this.state = {reactors: [], showInteractionsDialog: false, loading: false}
        this.handleShowReactions = this.handleShowReactions.bind(this)
        this.handleHideReactions = this.handleHideReactions.bind(this)
        this.loadReactedUsersFromServer = this.loadReactedUsersFromServer.bind(this);
    }

    shouldComponentUpdate(nextProps:ReactionStatsProps, nextState) {
        return (nextProps.reactionsCount != this.props.reactionsCount) ||
            (this.state.showInteractionsDialog != nextState.nextState)
    }

    loadReactedUsersFromServer() 
    {
        let keys = Object.keys(this.props.reactions)
        if (keys.length > 0) 
        {
            let users = keys.map(k => this.props.reactions[k]).reduce((result, val) => result.concat(val),[])
            ProfileManager.ensureProfilesExists(users, () => {
                this.setState({
                    reactors: ProfileManager.getProfiles(users),
                    loading: false
                });
            })
        }
    }
    handleHideReactions() {
        this.setState({showInteractionsDialog: false});
    }
    handleShowReactions() {
        if (this.props.reactionsCount > 0) {
            this.setState({showInteractionsDialog: true, loading: true},
                this.loadReactedUsersFromServer);
        }
    }
    renderReactionsModal() {
        return (
            <StatusInteractionDialog didClose={this.handleHideReactions} reactions={this.props.reactions} loading={this.state.loading}
                        reactors={this.state.reactors} visible={this.state.showInteractionsDialog}/>
        )
    }
    render() {
        let classes = classNames("btn reactions-count", {"active": this.props.reactionsCount > 0})

        return (
            <>
                <button className={classes} onClick={this.handleShowReactions}>
                    <span>{this.props.reactionsCount}</span>
                </button>
                {this.renderReactionsModal()}
            </>
        )
    }
}
