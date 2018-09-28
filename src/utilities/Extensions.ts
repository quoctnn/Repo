

import * as Immutable from "immutable";
import { nullOrUndefined } from "./Utilities";
String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };
String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

Array.prototype.move = function(oldIndex, newIndex) {
  if (newIndex >= this.length) {
      newIndex = this.length - 1;
  }
  this.splice(newIndex, 0, this.splice(oldIndex, 1)[0]);
}
Array.prototype.distinct = function() {
  return Array.from(new Set(this))
}
Array.prototype.contains = function<T>(element:T): boolean {
  return this.indexOf(element) >= 0
}
Array.prototype.cloneArray = function() {
  return nullOrUndefined(this) ? this : Immutable.fromJS(this).toJS()
}
