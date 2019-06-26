import * as React from "react";
import classnames from 'classnames';
import isString from 'lodash/isString';
import "./ToggleSwitch.scss"
import { nullOrUndefined } from '../../utilities/Utilities';
type Props = {
    theme?:string
    active?: boolean
    onStateChanged?: (active:boolean) => void
} & React.HTMLAttributes<HTMLDivElement>
type State = {
    active: boolean
}
export default class ToggleSwitch extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            active: nullOrUndefined( props.active ) ? true : props.active
        }
    }
    toggleSwitch = (event) => {
        event.persist();
        event.preventDefault();

        const { onClick, onStateChanged } = this.props

        this.setState({ active: !this.state.active }, () => {
            const state = this.state;

            // Augument the event object with SWITCH_STATE
            const switchEvent = Object.assign(event, { SWITCH_STATE: state });

            // Execute the callback functions
            onClick && onClick(switchEvent)
            onStateChanged && onStateChanged(state.active)
        });
    }

    render() {
        const { active: enabled } = this.state;

        // Isolate special props and store the remaining as restProps
        const { active: _enabled, theme, onClick, className, onStateChanged, ...restProps } = this.props

        // Use default as a fallback theme if valid theme is not passed
        const switchTheme = (theme && isString(theme)) ? theme : 'default';

        const switchClasses = classnames(
            `switch switch--${switchTheme}`,
            className
        )

        const togglerClasses = classnames(
            'switch-toggle',
            `switch-toggle--${enabled ? 'on' : 'off'}`
        )
        return (
            <div className={switchClasses} onClick={this.toggleSwitch} {...restProps}>
                <div className={togglerClasses}></div>
            </div>
        )
    }

}