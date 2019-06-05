
import * as React from 'react';
import 'react-moment-input/dist/css/style.css'
import * as moment from 'moment-timezone';
import { translate } from '../../../localization/AutoIntlProvider';
import { Popover, PopoverBody, Input, InputGroup, Button, InputGroupAddon, ButtonGroup } from 'reactstrap';
import { uniqueId } from '../../../utilities/Utilities';
import * as Slider from 'react-input-slider';
import "./DateTimePicker.scss"
type Props = {
    onChange?: (value:moment.Moment, name:string) => void,
    value?:moment.Moment,
    max?: moment.Moment,
    min?: moment.Moment,
}
export class DateTimePicker extends React.Component<Props, {}>{
    input = React.createRef<MomentInput>();
    constructor(props:Props)
    {
        super(props)
    }
    getValue = () => {
        return this.input.current.getValue()
    }
    componentWillUnmount() {
        this.input = null;
    }
    render(){
        const format = `YYYY-MM-DD H[${translate("date.format.hours")}] m[${translate("date.format.minutes")}]`
        return (<MomentInput
                    ref={this.input}
                    format={format}
                    options={true}
                    readOnly={true}
                    inputClassName=""
                    daysOfWeek={['Mon','Tue','Wed','Thu','Fri','Sat','Sun']}
                    icon={true}
                    onChange={this.props.onChange}
                    value={this.props.value}
                    max={this.props.max}
                    min={this.props.min}
                ></MomentInput>)
    }
}
type MomentInputOwnProps = {
    name?: string,
    min?: moment.Moment,
    max?: moment.Moment,
    onSave?: (value:moment.Moment, name:string) => void,
    onClose?: (value:moment.Moment, name:string) => void,
    onChange?: (value:moment.Moment, name:string) => void,
    value?:moment.Moment,
    defaultValue?:moment.Moment,
    defaultTime?:string,
    style?: object,
    className?: string,
    inputStyle?: object
}
type MomentInputDefaultProps = {
    tab: number
    isOpen: boolean
    options: boolean
    readOnly: boolean
    monthSelect: boolean
    position: string
    today: boolean
    icon: boolean
    format: string
    inputClassName: string
    daysOfWeek: string[]
    translations:object
}
type MomentInputState = {
    isOpen:boolean
    selected:moment.Moment
    activeTab:number
    date:moment.Moment
    textValue:string
    isValid:boolean
}
type MomentInputProps = MomentInputDefaultProps & MomentInputOwnProps
class MomentInput extends React.Component<MomentInputProps, MomentInputState> {
    _id = uniqueId()
    defaultTime:string = null
    node:any = null
    static defaultProps:MomentInputDefaultProps = {
        tab: 0,
        isOpen: false,
        options: true,
        readOnly:true,
        monthSelect:true,
        position:"bottom",
        today:false,
        icon:false,
        translations: {},
        format:"YYYY-MM-DD HH:mm",
        inputClassName:"",
        daysOfWeek:['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    }
    getValue = () => {
        return this.state.date
    }
    constructor(props:MomentInputProps) {
        super(props);
        this.state = {
            selected: (props.value || moment()).clone(),
            activeTab: props.tab,
            date:props.value.clone(),
            textValue: "",
            isValid: true,
            isOpen:props.isOpen
        };
    }
    componentDidMount = () => {
        this.defaultTime = this.props.defaultTime;
        let date = this.props.defaultValue;
        if (this.props.defaultTime && date)
            date = moment(date.format("YYYY-MM-DD ") + this.defaultTime);

        if (date)
            this.setState({date: date, selected: date});
    }

    add = (next, type) => {
        const self = this;
        return function () {
            self.setState({selected: self.state.selected.add(type, next)});
        }
    }

    onDayClick = (date:moment.Moment) => {
        const {min, max, format} = this.props;

        if(this.defaultTime)
            date = moment(date.format("YYYY-MM-DD ") + this.defaultTime);

        if (!this.isValid(min,max, date, date.format(format), false, "day"))
            return;

        this.setState({date, selected: date, isValid: true});
        if (this.props.onChange)
            this.props.onChange(date, this.props.name);
    }

    onActiveTab = (tab) => {
        this.setState({activeTab: tab});
    }

    onSetTime = (type) => {
        const self = this;
        return function ({x}) {
            self.state.selected.set(type, x);
            self.defaultTime = null;
           /* const {min, max, format} = self.props;
            if (!self.isValid(min,max, self.state.selected, self.state.selected.format(format), false, "minutes"))
                return self.setState({isValid: false});*/

            if (self.state.date) {
                self.state.date.set(type, x);

                if (self.props.onChange)
                    self.props.onChange(self.state.date, self.props.name);
            }

            self.setState({
                selected: self.state.selected,
                date: self.state.date,
                isValid: self.state.date ? true : self.state.isValid
            });
        }
    }

    isDisabled = (min, max, selected, date, value, isYear) => {
        const k = max && selected.diff(max, "day")
        if (!this.isValid(min,max, selected, value, isYear, "day"))
            return "disabled-day";
        else if (date && (selected.format("YYYY-MM-DD") === date.format("YYYY-MM-DD") ||
            (isYear && selected.format("YYYY") === date.format("YYYY"))))
            return "selected-day";
        else
            return "";
    }

    isValid = (min, max, selected, value, isYear, type = "day") => {
        return !(!isYear && (value==="" || (min && selected.diff(min, type) < 0) || (max && selected.diff(max, type)>0)))
    }

    inputClick = (e) => {
        if(!this.state.isOpen)
            this.toggleIsOpen()
    }
    toggleIsOpen = () => {

        const {isOpen} = this.state;
        this.setState({isOpen: !isOpen});
        /*
        if (isOpen)
            return window.removeEventListener('click', this.onClose);

        const {onChange, onClose} = this.props;
        if (onChange || onClose)
            window.addEventListener('click', this.onClose);
        */
    }

    onClose = (e)  => {
        if (this.node.contains(e.target))
            return;

        const {onClose, name} = this.props;
        this.setState({isOpen: false});
        window.removeEventListener('click', this.onClose);

        const {date} = this.state;
        if (onClose)
            onClose(date, name);
    }

    Years = () => {
        const {selected} = this.state;
        let year = Number(selected.format("YYYY"));
        let items = [];

        let i=0;
        do {
            if ((i) % 3 === 0)
                items.push([]);

            items[items.length - 1].push(year++);
            i++;
        } while (i < 12);

        return items;
    }

    Days = () => {
        const {daysOfWeek} = this.props;
        const {selected} = this.state;
        const first = selected.clone().date(1);

        const days = first.daysInMonth();
        const index = daysOfWeek.findIndex(x=> x === first.format('ddd'));

        let items = [];
        let nextDay = 1;
        let i = 0;
        do {
            if ((i) % 7 === 0)
                items.push([]);

            items[items.length - 1].push(i < index ? "" : nextDay++);
            i++;
        } while (nextDay <= days);

        const length = items[items.length - 1].length;
        for (let i = length; i < 7; i++)
            items[items.length - 1].push("");

        return items;
    }

    onTextChange = (e) => {
        let val = e.target.value;

        const {onChange, name, min, max, format} = this.props;

        let nFormat;
        if(format[format.length -1].toUpperCase()==="A")
            nFormat = format.replace("A","").replace("a","");
        else
            nFormat = format;


        let item = moment(val, nFormat, true);

        if (!item.isValid() || !this.isValid(min, max, item, val, false, "minutes"))
            return this.setState({textValue: val, date: null, isValid: false});

        if (onChange)
            onChange(item, name);

        this.setState({selected: item, date: item, textValue: val, isValid: true});
    }

    renderTab = () => {
        const {min, max, translations, daysOfWeek, format, monthSelect} = this.props;
        const {selected, activeTab, date} = this.state;
        switch (activeTab){
            case 1:
                return (<TimePicker
                    selected={selected}
                    onSetTime={this.onSetTime}
                    translations={translations}
                    minuteSteps={15}
                    isAM={format.indexOf("hh")!==-1}
                />);
            case 2:
                return (<YearPicker
                    defaults={{selected, min, max, date, years: this.Years()}}
                    add={this.add}
                    onActiveTab={this.onActiveTab}
                    onClick={this.onDayClick}
                    isDisabled={this.isDisabled}
                    translations={translations}
                />);
            default:
                return (<DatePicker
                    defaults={{selected, min, max, date, monthSelect, days: this.Days(), months: daysOfWeek}}
                    add={this.add}
                    onActiveTab={this.onActiveTab}
                    onClick={this.onDayClick}
                    isDisabled={this.isDisabled}
                    translations={translations}
                />)
        }
    }
    render = () => {
        const { options, onSave, today, value, style, className, inputClassName, inputStyle, name, readOnly, format, icon, translations, position} = this.props;
        const {selected, activeTab, date, isOpen, textValue, isValid} = this.state;
        let inputValue = value ? value.format(format) : (date ? date.format(format): "");
        const id = "momentinput_" + this._id
        return (
            <div style={style} className={className} ref={node => this.node = node}>
                <InputGroup id={id} className={inputClassName} >
                    <Input className="btn-rounded"
                            value={inputValue || textValue}
                            readOnly={readOnly}
                            onClick={this.inputClick}
                            onChange={this.onTextChange}
                            style={inputStyle}/>
                    <InputGroupAddon addonType="append">
                        <Button className="btn-rounded" onClick={this.inputClick}><i className="far fa-calendar-alt"></i></Button>
                    </InputGroupAddon>
                </InputGroup>
                {isOpen &&
                    <Popover className="date-time-picker" trigger="legacy" placement="bottom" isOpen={isOpen} target={id} toggle={this.toggleIsOpen}>
                        <PopoverBody>
                            {options &&
                                <ButtonGroup className="options d-flex">
                                    <Button className={"flex-grow-1" +((activeTab===0 || activeTab===2) ? " active" : "")}
                                        onClick={()=> {this.onActiveTab(0)}}><i className="far fa-calendar-alt"></i>&nbsp;{translate("Date")}
                                    </Button>
                                    <Button
                                        className={"flex-grow-1" + (activeTab===1 ? " active" : "")}
                                        onClick={()=> {this.onActiveTab(1)}}><i className="far fa-clock"></i>&nbsp;{translate("Hours")}
                                    </Button>
                                </ButtonGroup>
                            }
                            <div className="tabs">
                                {this.renderTab()}
                            </div>
                            {today && <button className="im-btn btn-save ion-checkmark" onClick={()=> {this.onDayClick(moment())}}>{translate("Today")}</button>}
                            {onSave && <button className="im-btn btn-save ion-checkmark" onClick={()=> {this.setState({isOpen:false}); onSave(date || selected, name)}}>{translate("Save")}</button>}
                        </PopoverBody>
                    </Popover>
                }
            </div>
        );
    }
}

function replaceMonths(value, translation) {
    const values = value.split(" ");
    const tValue = translation["MONTHS_" + values[0].toUpperCase()];
    return tValue ? tValue + (values[1] ? (" " + values[1]) : "")  : value;
}

function replaceDays(value, translation) {
    return translation["DAYS_" + value.toUpperCase()] || value;
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DatePicker = ({defaults, add, onActiveTab, onClick, isDisabled, translations}) => (
    <div className="r-calendar tab-m is-active">
        <div className="toolbar">
            <button className="prev-month" onClick={add(-1, 'month')}>
                <i className="fas fa-chevron-left"></i>
            </button>
            <span className="current-date react-textselect" style={{marginRight:"-5px"}}>
                {replaceMonths(defaults.selected.format("MMMM YYYY"), translations)}
                {defaults.monthSelect && (<select className='react-textselect-input'
                        onChange={({target})=>{ onClick(defaults.selected.clone().month(target.value))}}
                        value={Number(defaults.selected.format("MM")) -1 }>
                {MONTHS.map((x, index)=> (<option value={index}
                                                  disabled={isDisabled(defaults.min, defaults.max, defaults.selected.clone().month(x), defaults.date, x)}
                                                  key={index}>{replaceMonths(x, translations)}
                                                  </option>))}
                </select>)}
            </span>
            <button className="next-month" onClick={add(1, 'month')}>
                <i className="fas fa-chevron-right"></i>
            </button>
            <button className="next-month" style={{marginRight:"5px"}} onClick={(e)=> {onActiveTab(2); e.stopPropagation();}}>
                <i className="fas fa-level-down-alt" aria-hidden="true"></i>
            </button>
        </div>
        <table>
            <thead>
            <tr>
                {defaults.months.map((x, i)=> (
                    <td key={i}>{replaceDays(x, translations)}</td>
                ))}
            </tr>
            </thead>
            <tbody>
            {defaults.days.map((items, index) => (<tr key={index}>
                {items.map((x, iIndex)=> (<td key={index + "" + iIndex}
                                              className={isDisabled(defaults.min, defaults.max, defaults.selected.clone().date(x), defaults.date, x)}
                                              onClick={()=> x!=="" && onClick(defaults.selected.clone().date(x))}>{x}</td>))}
            </tr>))}
            </tbody>
        </table>
    </div>
)
const YearPicker = ({defaults, add, onActiveTab, onClick, isDisabled, translations}) => (
    <div className="r-calendar tab-m is-active">
        <div className="toolbar">
            <button className="prev-month" onClick={add(-12,'year')}>
                <i className="fas fa-chevron-left"></i>
            </button>
            <span className="current-date" style={{marginRight:"-5px"}}>
                {translations.YEARS || "Years"}
                        </span>
            <button className="next-month" onClick={add(12,'year')}>
                <i className="fas fa-chevron-right"></i>
            </button>
            <button className="next-month" style={{marginRight:"5px"}} onClick={(e)=> {onActiveTab(0); e.stopPropagation();}}>
                <i className="fas fa-level-up-alt"></i>
            </button>
        </div>
        <table>
            <tbody>
            {defaults.years.map((items, index) => (<tr key={index}>
                {items.map((x, iIndex)=> (<td key={index + "" + iIndex}
                                              className={isDisabled(defaults.min, defaults.max, defaults.selected.clone().year(x), defaults.date, x, false)}
                                              onClick={()=> onClick(defaults.selected.clone().year(x))}
                >{x}</td>))}
            </tr>))}
            </tbody>
        </table>
    </div>
)
type TimePickerProps = {selected:moment.Moment, onSetTime:(key:string) => void, translations:any, minuteSteps?:number, isAM:boolean}
const TimePicker = ({selected, onSetTime, translations, minuteSteps, isAM}:TimePickerProps) => (
    <div className="r-time tab-m is-active" style={{paddingBottom:"10px"}}>
        <div className="showtime">
            <span className="time">{selected.format(isAM ? "hh" :"HH")}</span>
            <span className="separater">:</span>
            <span className="time">{selected.format("mm")}</span>
            { isAM && (<span className="separater"></span>) }
            { isAM && (<span className="time">{Number(selected.format("HH"))>= 12 ? "PM" : "AM"}</span>) }

        </div>
        <div className="sliders">
            <div className="time-text">
                {translations.HOURS || "Hours"}:
            </div>
            <Slider
                className="u-slider u-slider-x u-slider-time"
                axis="x"
                x={Number(selected.format('HH'))}
                xmax={23}
                onChange={onSetTime('hours')}
            />
            <div className="time-text">
                {translations.MINUTES || "Minutes"}:
            </div>
            <Slider
                className="u-slider u-slider-x u-slider-time"
                axis="x"
                xstep={minuteSteps || 1}
                x={Number(selected.format('mm'))}
                xmax={59}
                onChange={onSetTime('minutes')}
            />
        </div>
    </div>
)