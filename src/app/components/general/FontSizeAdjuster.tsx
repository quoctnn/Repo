import * as React from 'react'
import { ReduxState } from '../../redux/index';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { ThemeManager } from '../../managers/ThemeManager';
type OwnProps = {

}
const fontSizes = [50, 75, 85, 100, 115, 125, 150, 175, 200, 250, 300]
const nextUp = (size:number) => {
    const index = fontSizes.indexOf(size)
    if(index > -1 && fontSizes.length > index + 1)
        return fontSizes[index + 1]
    return null
}
const nextDown = (size:number) => {
    const index = fontSizes.indexOf(size)
    if(index > -1 && index > 0)
        return fontSizes[index - 1]
    return null
}
type ReduxStateProps = {
    fontSize:number
}
type Props = ReduxStateProps & OwnProps

class FontSizeAdjusterComponent extends React.Component<Props, {}> {
    setSize = (size:number) => () => {
        ThemeManager.setFontSize(size)
    }
    render = () => {
        const increase = nextUp(this.props.fontSize)
        const decrease = nextDown(this.props.fontSize)
        const up = !!increase ? this.setSize(increase) : undefined
        const down = !!decrease ? this.setSize(decrease) : undefined
        return <div className="d-flex align-items-center">
                <Button disabled={!decrease} onClick={down} size="sm" color="link"><i className="fas fa-font"></i></Button>
                {this.props.fontSize}%
                <Button disabled={!increase} onClick={up} color="link"><i className="fas fa-font"></i></Button>
            </div>
    }
}
const mapStateToProps = (state:ReduxState, ownProps:OwnProps) => {
    const fontSize = state.theme.fontSize
    return {
        fontSize
    }
}
export const FontSizeAdjuster = connect(mapStateToProps, null)(FontSizeAdjusterComponent)