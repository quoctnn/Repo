import * as React from 'react';
import { translate } from '../../localization/AutoIntlProvider';
import { Link } from 'react-router-dom';
import StackedAvatars from '../general/StackedAvatars';
import "./DetailsMembers.scss"
import classnames = require('classnames');

export enum HorisontalLayoutPosition{ left = "left", right = "right" }
type OwnProps = {
    members?:number[]
    truncate?:number
    title?:string
    showSeeAll?:boolean
    position?:HorisontalLayoutPosition
}
type State = {
}
type Props = OwnProps
export class DetailsMembers extends React.Component<Props, State> {
    static defaultProps:OwnProps = {
        members:[],
        truncate:5,
        showSeeAll:true,
        position:HorisontalLayoutPosition.right
    }
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    renderTitle = () => {

    }
    renderHeader = () => {
        const members = this.props.members && this.props.members.length > 0 ? this.props.members : null
        return <div>
                {this.props.title && this.props.title
                || <>{members.length}&nbsp;{(members.length > 1) ? translate("common.members") : translate("common.member")}&nbsp;-&nbsp;</>
                }
                {this.props.showSeeAll && <Link to="#">{translate("common.see.all")}</Link>}
                </div>
    }
    render()
    {
        const members = this.props.members && this.props.members.length > 0 ? this.props.members : null
        const cn = classnames("details-members", this.props.position, {"d-flex flex-grow-1 flex-column align-items-start":this.props.position == HorisontalLayoutPosition.left})
        return (
            <div className="details-module">
                { members &&
                    <div className={cn}>
                        {this.renderHeader()}
                        {this.renderTitle()}
                        {/* TODO: Members page */}
                        <StackedAvatars userIds={members} />
                    </div>
                }
                { this.props.children }
            </div>
        )
    }
}