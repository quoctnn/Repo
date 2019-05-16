import * as React from 'react';
import { Community } from '../../types/intrasocial_types';
import { translate } from '../../localization/AutoIntlProvider';
import { Link } from 'react-router-dom';
import { IntraSocialUtilities } from '../../utilities/IntraSocialUtilities';
import "./DetailsContent.scss"

type OwnProps = {
    community?:Community
    description?:string
}
type State = {
}
type Props = OwnProps
export class DetailsContent extends React.Component<Props, State> {
    static defaultProps:OwnProps = {
    }
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    render()
    {
        return (
            <div className="details-content">
                { this.props.community &&
                    <div className="text-truncate">
                        <div className="details-field-name">{translate("common.community")}</div>
                        <div title={this.props.community.name} className="details-field-value"><Link to={this.props.community.uri}>{this.props.community.name}</Link></div>
                    </div>
                }
                {this.props.children}
                { this.props.description &&
                    <div title={IntraSocialUtilities.htmlToText(this.props.description)} className="details-description">
                        {IntraSocialUtilities.htmlToText(this.props.description)}
                    </div>
                }
            </div>
        )
    }
}