import * as React from 'react'
import { Link } from "react-router-dom";
import {  MentionData, truncate } from '../../utilities/Utilities';
import { IntraSocialLink } from './IntraSocialLink';
import { Settings } from '../../utilities/Settings';
import { ContextManager } from '../../managers/ContextManager';
import { ReduxState } from '../../redux';
import { connect, DispatchProp } from 'react-redux';
import { Linkable, IdentifiableObject, Permissible } from '../../types/intrasocial_types';
type ReduxStateProps = {
    object:Permissible & IdentifiableObject & Linkable
}
type OwnProps = {
    data:MentionData
}
type Props = {
} & React.AnchorHTMLAttributes<HTMLAnchorElement> & React.ClassAttributes<Link> & ReduxStateProps & OwnProps

class IntraSocialMention extends React.Component<Props, {}> {
    constructor(props:Props){
        super(props)
    }
    componentDidMount = () => {
        const {object, data} = this.props
        if(!object)
        {
            ContextManager.ensureObjectExists(data.contextNaturalKey, data.contextId)
        }
    }
    render = () => {
        const {data, object} = this.props
        const name = data.getName()
        return <IntraSocialLink name={name} to={object} type={data.contextNaturalKey}>{truncate(name, Settings.mentionTruncationLength)}</IntraSocialLink>
    }
}
const mapStateToProps = (state:ReduxState, ownProps:OwnProps):ReduxStateProps => {
    let object = ownProps.data.getContextObject()
    if(!object)
        object = ContextManager.getStoreObject(ownProps.data.contextNaturalKey, ownProps.data.contextId)
    return {
        object
    };
}
export default connect<ReduxStateProps,DispatchProp>(mapStateToProps, null)(IntraSocialMention);