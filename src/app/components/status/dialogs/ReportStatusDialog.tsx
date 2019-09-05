import * as React from 'react';
import { ModalBody, Modal, ModalHeader, ModalFooter } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
import { Status, ReportTag, ReportResult } from '../../../types/intrasocial_types';

import "./ReportStatusDialog.scss"
import {ApiClient} from '../../../network/ApiClient';
import { ToastManager } from '../../../managers/ToastManager';
import Select from 'react-select';

type Props =
{
    visible:boolean
    status:Status
    didCancel:() => void
}
type State =
{
    availableTags: ReportTag[],
    value:ReportTag[]
    result: ReportResult
}

export default class ReportStatusDialog extends React.Component<Props, State> {  
    constructor(props) {
        super(props);
        this.state = {
            availableTags: [],
            value: [],
            result: null,
        }
    }
    componentDidMount = () => {
        this.loadTagsFromServer()
    }
    loadTagsFromServer = () => {
        ApiClient.getReportTags((tags, status, error) => {
            if(tags)
            {
                this.setState({availableTags:tags})
            }
            ToastManager.showErrorToast(error)
        })
    }
    submit = (e:any) => {
        e.preventDefault()

        let tags = this.state.value.map(function (obj, index) {
            return obj.value
        })
        ApiClient.reportObject("status",this.props.status.id, tags, null, (data, status, error) => {
            if(data)
            {
                this.setState({ result: data });
            }
            ToastManager.showErrorToast(error, "Your report could not be sent. Please try again later.")
        })
    }
    handleSelectChange = (value:ReportTag[]) => {
        this.setState({ value });
    }
    tagTitleForKey = (key) => 
    {
        let t = this.state.availableTags.find(t => t.value == key)
        if(t)
        {
            return t.label
        }
        return key
    }
    renderContent() {
        if(this.state.result){
            let report = this.state.result
            return (<div className="text-center">
                        <h2>
                            <i className="fa fa-exclamation-triangle"></i>
                        </h2>
                        <p className="description">
                            {translate("status.dialog.report.success")}
                        </p>
                        <ul className="tag-list">
                            {report.tags.map( (tag, index) => {
                                return (<li key={index} className="tag"><i className="fa fa-check"></i> {this.tagTitleForKey(tag)}</li>)
                            })}
                        </ul>
                    </div>)
        }
        return (<div>
                    <p className="description">
                        {translate("status.dialog.report.info")}
                    </p>
                    <div className="">
                        <Select 
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        isMulti={true}
                        name="tags"
                        value={this.state.value}
                        menuPortalTarget={document.body} 
                        onChange={this.handleSelectChange}
                        placeholder={translate("status.dialog.report.placeholder")}
                        closeMenuOnSelect={false}
                        options={this.state.availableTags} />
                    </div>
            </div>)
    }
    renderHeader = () => {
        return (<>
                    <button type="button" className="close" onClick={this.props.didCancel} >
                        <span aria-hidden="true">&times;</span>
                        <span className="sr-only">{translate("common.close")}</span>
                    </button>
                    <span>{translate("status.dialog.report.title")}</span>
                </>)
    }
    renderFooter = () => {
        if(this.state.result){
                return (<button type="button" className="btn btn-default" onClick={this.props.didCancel}>
                            {translate("common.close")}
                        </button>)
        }
        const buttonDisabled = this.state.value.length == 0
        return (<button onClick={this.submit} type="submit" className="btn btn-success pull-right" disabled={buttonDisabled}>
                    {translate("status.dialog.report.report")}
                </button>)
    }
    render()
    {
        return (<Modal toggle={this.props.didCancel} id="report-status-dialog" zIndex={1070} isOpen={this.props.visible} className="full-height">
                {!this.state.result && <ModalHeader>
                    {this.renderHeader()}
                </ModalHeader>}
                <ModalBody className="vertical-scroll">
                    {this.renderContent()}
                </ModalBody>
                <ModalFooter>
                    {this.renderFooter()}
                </ModalFooter>
            </Modal>)
    }
}