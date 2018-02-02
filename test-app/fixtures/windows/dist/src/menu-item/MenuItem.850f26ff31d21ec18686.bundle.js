/*!
 * 
 * [Dojo](https://dojo.io/)
 * Copyright [JS Foundation](https://js.foundation/) & contributors
 * [New BSD license](https://github.com/dojo/meta/blob/master/LICENSE)
 * All rights reserved
 * 
 */
dojoWebpackJsonptest_app(["src/menu-item/MenuItem"],{"./node_modules/imports-loader/index.js?widgetFactory=src/menu-item/MenuItem!./node_modules/@dojo/cli-build-widget/template/custom-element.js":function(e,t,o){var s,n=o("./src/menu-item/MenuItem.ts"),i=o("./node_modules/@dojo/widget-core/registerCustomElement.js").default,d=n.default;d&&d.prototype&&d.prototype.__customElementDescriptor&&(s=function(){return d.prototype.__customElementDescriptor}),s&&i(s)},"./src/menu-item/MenuItem.ts":function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var s=o("./node_modules/tslib/tslib.es6.js"),n=o("./node_modules/@dojo/widget-core/d.js"),i=o("./node_modules/@dojo/widget-core/decorators/customElement.js"),d=o("./node_modules/@dojo/widget-core/mixins/Themed.js"),m=o("./node_modules/@dojo/widget-core/WidgetBase.js"),r=o("./src/menu-item/menuItem.m.css"),u=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return s.__extends(t,e),t.prototype._onClick=function(){this.properties.onSelected&&this.properties.onSelected(this.properties.data)},t.prototype.render=function(){var e=this.properties,t=e.title,o=e.selected;return n.v("li",{classes:this.theme(r.root)},[n.v("span",{classes:this.theme([r.item,o?r.selected:null]),onclick:this._onClick},[t])])},t=s.__decorate([i.customElement({tag:"demo-menu-item",attributes:["title","selected"],events:["onSelected"],properties:["data","selected"]}),d.theme(r)],t)}(d.ThemedMixin(m.WidgetBase));t.MenuItem=u,t.default=u},"./src/menu-item/menuItem.m.css":function(e,t){e.exports={" _key":"menuItem",root:"sUmUi4Sh",item:"_2Mk6Rdqa",selected:"_1-f3ItOh"}}},["./node_modules/imports-loader/index.js?widgetFactory=src/menu-item/MenuItem!./node_modules/@dojo/cli-build-widget/template/custom-element.js"]);
//# sourceMappingURL=MenuItem.850f26ff31d21ec18686.bundle.js.map