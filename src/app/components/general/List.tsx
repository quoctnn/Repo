import * as React from "react";
import classnames from 'classnames';
const ReactDOM = require("react-dom");
require("./List.scss");

export interface Props {
    className?: string,
    id?: string
    onScroll?: (event: React.UIEvent<any>) => void
    enableAnimation: boolean
    children: React.ReactNode
}
export interface State {

    items: React.ReactElement<any>[]
    rects: { [id: number]: DOMRect }
}
type ListItemProps = {
    hasAction: boolean
}

//WARNING:ANIMATION REMOVED
export class ListItem extends React.PureComponent<ListItemProps & React.HTMLAttributes<HTMLElement>, {}> {
    static defaultProps: ListItemProps = {
        hasAction: false
    }
    render() {
        const { className, hasAction, ...rest } = this.props
        const cn = classnames("list-item primary-text d-flex align-items-center", className, { "has-action": hasAction })
        return (
            <div {...rest} className={cn} >
                {this.props.children}
            </div>
        );
    }
}
type ListHeaderProps = {
}
export class ListHeader extends React.PureComponent<ListHeaderProps & React.HTMLAttributes<HTMLElement>, {}> {
    render() {
        const { className, ...rest } = this.props
        const cn = classnames("list-header secondary-text", className)
        return (
            <div {...rest} className={cn} >
                {this.props.children}
            </div>
        );
    }
}
export class List extends React.PureComponent<Props, State> {
    listRef = React.createRef<HTMLDivElement>()
    static defaultProps: Props = {
        className: null,
        id: null,
        onScroll: null,
        enableAnimation: true,
        children: []
    }
    constructor(props: Props) {
        super(props);
        this.state = { items: [], rects: {} }
    }
    scrollToTop = () => {
        this.listRef.current.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }
    componentWillUnmount = () => {
        this.listRef = null
    }
    UNSAFE_componentWillReceiveProps = (newProps:Props) =>  {
        if (this.props.enableAnimation) {
            let items = this.getChildren() as any[]
            if (items.length > 0) {
                let rects = {}
                items.forEach(child => {
                    if (!child.key) return;
                    var domNode = ReactDOM.findDOMNode(this.refs[child.key]);
                    var boundingBox = domNode.getBoundingClientRect();
                    rects[child.key] = boundingBox
                })
                this.setState({ rects: rects })
            }
        }
    }
    getChildren = () => {
        let items: React.ReactNode[] = []
        React.Children.map(this.props.children, (c, i) => {
            items.push(c)
        })
        return items.filter(i => i != null)
    }
    componentDidUpdate = (previousProps) => {
        if (this.props.enableAnimation) {
            var doNeedAnimation = [];
            this.getChildren().forEach((item) => {
                if (this.doesNeedAnimation(item) === 0) {
                    doNeedAnimation.push(item);
                }
            });
            doNeedAnimation.forEach(this.animateAndTransform);
        }
    }
    animateAndDestroy = (child, n) => {
        var domNode = ReactDOM.findDOMNode(this.refs[child.key]);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                domNode.style.opacity = "0";
                domNode.style.transform = "scale(2)"
            });
        });
    }
    animateAndTransform = (child, n) => {
        var domNode = ReactDOM.findDOMNode(this.refs[child.key]);

        var [dX, dY] = this.getPositionDelta(domNode, child.key);

        requestAnimationFrame(() => {
            domNode.style.transition = 'transform 0s';
            domNode.style.transform = 'translate(' + dX + 'px, ' + dY + 'px)';
            requestAnimationFrame(() => {
                domNode.style.transform = '';
                domNode.style.transition = 'transform 400ms';
            })
        });
    }
    doesNeedAnimation = (child) => {
        var isNotMovable = !child.key;
        var isNew = !this.state.rects[child.key];
        var isDestroyed = !this.refs[child.key];

        if (isDestroyed) return 2;
        if (isNotMovable || isNew) return;

        var domNode = ReactDOM.findDOMNode(this.refs[child.key]);
        var [dX, dY] = this.getPositionDelta(domNode, child.key);
        var isStationary = dX === 0 && dY === 0;

        return (isStationary === true) ? 1 : 0;
    }
    getPositionDelta = (domNode, key) => {
        var newBox = domNode.getBoundingClientRect();
        var oldBox = this.state.rects[key];

        return [
            oldBox.left - newBox.left,
            oldBox.top - newBox.top
        ];
    }
    render = () => {
        return (
            <div ref={this.listRef} onScroll={this.props.onScroll} className={"list" + (this.props.className ? " " + this.props.className : "")} >
                {this.props.children}
            </div>
        );
    }
}