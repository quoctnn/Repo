import * as React from "react";
import { Transition } from "react-transition-group";

export type Props = 
{
    visible:boolean
}

export default class ModuleMenu extends React.Component<Props, {}> {

    render() {
        const duration = 200
        const style = {
            transition: `transform ${duration}ms ease-in-out`
        }
        return(
            <Transition appear={true} unmountOnExit={true} mountOnEnter={true} in={this.props.visible} timeout={{enter:0, exit:duration}}>
                {(status) => (
                <div className={`module-menu module-menu-${status} main-content-background`} style={style} >
                    {status != "exited" && this.props.children}
                </div>
                )}
            </Transition>
        );
    }
}
