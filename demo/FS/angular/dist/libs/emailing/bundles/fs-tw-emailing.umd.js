(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define('@fs-tw/emailing', ['exports', '@angular/core', '@angular/common'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global['fs-tw'] = global['fs-tw'] || {}, global['fs-tw'].emailing = {}), global.ng.core, global.ng.common));
}(this, (function (exports, core, common) { 'use strict';

    var EmailingModule = /** @class */ (function () {
        function EmailingModule() {
        }
        return EmailingModule;
    }());
    EmailingModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [common.CommonModule],
                },] }
    ];

    /**
     * Generated bundle index. Do not edit.
     */

    exports.EmailingModule = EmailingModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=fs-tw-emailing.umd.js.map
