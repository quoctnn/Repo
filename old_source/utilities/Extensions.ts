

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
function isNumber(value: string | number): boolean
{
   return !isNaN(Number(value.toString()));
}
String.prototype.isNumber = function(): boolean
{
   return !isNaN(Number(this.toString()));
}
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
Array.prototype.isEqual = function<T>(arr2:T[]) 
{
  if(!this  || !arr2) 
            return false
        let result;
        this.forEach((e1,i)=>arr2.forEach(e2=>{
            
                if(Array.isArray(e1) && Array.isArray(e2) && e1.length > 1 && e2.length)
                {
                    result = this.arrayEqual(e1,e2)
                }
                else if(e1 !== e2 )
                {
                    result = false
                }
                else
                {
                    result = true
                }
            })
        )
        return result
}
Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
};
Number.prototype.isNumber = function(): boolean
{
   return !isNaN(Number(this.toString()));
}