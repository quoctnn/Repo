import * as React from "react";
import { translate } from '../../../../localization/AutoIntlProvider';
import { FontSizeAdjuster } from "../../../general/FontSizeAdjuster";

type Props = {}

export default class FontSizeSelector extends React.PureComponent<Props, {}> {
    constructor(props: Props) {
        super(props)
    }

    render() {
        return (
            <div className={"d-flex settings-item font-size-selector"}>
                <div className="settings-item-title flex-grow-1">{translate("sidebar.settings.font")}</div>
                <FontSizeAdjuster/>
            </div>
        )
    }
}
