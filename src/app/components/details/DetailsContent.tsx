import * as React from 'react';
import { Community } from '../../types/intrasocial_types';
import { translate } from '../../localization/AutoIntlProvider';
import { Link } from 'react-router-dom';
import { IntraSocialUtilities } from '../../utilities/IntraSocialUtilities';
import "./DetailsContent.scss"

type OwnProps = {
    community?:Community
    description?:string
    truncate?:number
}
type State = {
}
type Props = OwnProps
export class DetailsContent extends React.Component<Props, State> {
    static defaultProps:OwnProps = {
        truncate:200
    }
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    render()
    {
        return (
            <div className="details-module details-content">
                { this.props.community &&
                    <div className="text-truncate">
                        <span className="details-field-name">{translate("common.community")}: </span>
                        <span className="details-field-value"><Link to={this.props.community.uri}>{this.props.community.name}</Link></span>
                    </div>
                }
                { this.props.description &&
                    <div className="details-description">
                        <span className="details-field-value">{IntraSocialUtilities.truncateText(IntraSocialUtilities.htmlToText(this.props.description), this.props.truncate)}</span>
                    </div>
                }
            </div>
        )
    }
}