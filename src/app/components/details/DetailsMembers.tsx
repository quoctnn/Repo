import * as React from 'react';
import { translate } from '../../localization/AutoIntlProvider';
import { Link } from 'react-router-dom';
import StackedAvatars from '../general/StackedAvatars';
import "./DetailsMembers.scss"

type OwnProps = {
    members?:number[]
    truncate?:number
}
type State = {
}
type Props = OwnProps
export class DetailsMembers extends React.Component<Props, State> {
    static defaultProps:OwnProps = {
        members:[],
        truncate:5
    }
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    render()
    {
        const members = this.props.members
        return (
            <div className="details-module details-members">
                { members &&
                <div>
                    {members.length}&nbsp;
                    {(members.length > 1) ? translate("common.members") : translate("common.member")}&nbsp;-&nbsp;
                    <Link to="#">{translate("common.see.all")}</Link>
                    {/* TODO: Members page */}
                    <StackedAvatars userIds={members} />
                </div>
                }
            </div>
        )
    }
}