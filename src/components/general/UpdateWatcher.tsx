import * as React from 'react';
import * as OfflinePluginRuntime from 'offline-plugin/runtime';
import { History} from 'history'
import { withRouter} from 'react-router-dom'
import { Routes } from '../../utilities/Routes';
require("react-toastify/dist/ReactToastify.css");

export interface Props {
    history:History,
}
interface State {
}
class UpdateWatcher extends React.Component<Props, {}> {
  state:State
  constructor(props) {
    super(props);
    this.resetCachedDataAndReload = this.resetCachedDataAndReload.bind(this)
  }
  componentDidMount()
  {
      OfflinePluginRuntime.install({
        onUpdateReady: () => {
          //OfflinePluginRuntime.applyUpdate();
        },
        onUpdated: () => {
          //this.resetCachedDataAndReload();
        }
      })
      if(window.applicationCache && window.applicationCache.status == window.applicationCache.UPDATEREADY) {
          //this.resetCachedDataAndReload();
      }
  }
  resetCachedDataAndReload()
  {
        this.props.history.push(Routes.UPDATE_TOOL);
  }
  render() {
    return null
  }
}
export default  withRouter(UpdateWatcher);