
import * as React from 'react';
import "./CalendarToolbar.scss"
import { ToolbarProps, View } from 'react-big-calendar';
import classnames = require('classnames');
import { translate } from '../../localization/AutoIntlProvider';
import ButtonGroup from 'reactstrap/lib/ButtonGroup';
type CalendarToolbarProps = {
    fullView:boolean
}
export class CalendarToolbar extends React.Component<ToolbarProps & CalendarToolbarProps, {}> {
    static defaultProps:CalendarToolbarProps = {
        fullView:false
    }
    buttonClass = (view:View) => {
        return classnames("btn btn-link", {active:view == this.props.view})
    }
    render() {
        const cn = classnames("calendar-toolbar", {full:this.props.fullView})
        return (
            <div className={cn}>
                <div className="left">
                    <button className="btn btn-link" onClick={() => this.props.onNavigate("PREV")}>
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <div className="calendar-toolbar-label flex-grow-1">{this.props.label}</div>
                    <button className="btn btn-link" onClick={() => this.props.onNavigate("NEXT")}>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
               {this.props.fullView && <div className="right">
                   <ButtonGroup>
                    <button className={this.buttonClass("day")} onClick={() => this.props.onView("day")}>
                        {translate("calendar.day")}
                    </button>
                    <button className={this.buttonClass("week")} onClick={() => this.props.onView("week")}>
                        {translate("calendar.week")}
                    </button>
                    <button className={this.buttonClass("month")} onClick={() => this.props.onView("month")}>
                        {translate("calendar.month")}
                    </button>
                    {<button className={this.buttonClass("agenda")} onClick={() => this.props.onView("agenda")}>
                        {translate("calendar.agenda")}
                    </button>/**/}
                    <button className="btn btn-link" onClick={() => this.props.onNavigate("TODAY")}>
                        {translate("calendar.today")}
                    </button>
                    </ButtonGroup>
                </div>} 
            </div>
        );
    }
}