import * as React from "react";
import { DispatchProp } from 'react-redux'
import "./ContactsModule.scss"
import { UserStatus } from '../../types/intrasocial_types';
import { translate } from "../../localization/AutoIntlProvider";
import SimpleModule from "../SimpleModule";
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../components/general/observers/ResponsiveComponent";
import { CommonModuleProps } from "../Module";
import ContactsGroup from "./ContactsGroup";

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps & DispatchProp
type ReduxDispatchProps ={
}
type State = {
}
type Props = ReduxDispatchProps & OwnProps
export default class ContactsModule extends React.PureComponent<Props, State> {
    constructor(props:Props) {
        super(props)
        this.state = {}
    }
    render = () =>
    {
        const {className, breakpoint, isModal, dispatch, ...rest} = this.props
        const cn = classnames("contacts-module", className)
        return <SimpleModule {...rest}
                showHeader={!isModal}
                className={cn}
                breakpoint={breakpoint}
                isLoading={false}
                headerTitle={translate("contacts.module.title")}>
                <div className="vertical-scroll">
                    <ContactsGroup openOnLoad={true} filters={[UserStatus.active]} title={translate("user.status.active")}/>
                    <ContactsGroup openOnLoad={true} filters={[UserStatus.away]} title={translate("user.status.away")}/>
                    <ContactsGroup openOnLoad={true} filters={[UserStatus.dnd]} title={translate("user.status.dnd")}/>
                    <ContactsGroup openOnLoad={false} filters={[UserStatus.invisible, UserStatus.unavailable, UserStatus.vacation]} title={translate("user.status.unavailable")}/>
                </div>
            </SimpleModule>
    }
}