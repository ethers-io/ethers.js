"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var web3_provider_1 = require("./web3-provider");
var IFrameEthereumProvider = /** @class */ (function () {
    function IFrameEthereumProvider(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.timeoutMs, timeoutMs = _c === void 0 ? 60000 : _c, _d = _b.targetOrigin, targetOrigin = _d === void 0 ? '*' : _d;
        this.listenerAttached = false;
        this.callbackMap = {};
        this.targetOrigin = targetOrigin;
        this.timeoutMs = timeoutMs;
    }
    /**
     * Return true if the current context is a window within an iframe.
     */
    IFrameEthereumProvider.isWithinIframe = function () {
        return window && window.parent && window.parent !== window.self;
    };
    /**
     * Handles events from the parent window
     * @param event received from the parent window
     */
    IFrameEthereumProvider.prototype.handleEvents = function (event) {
        if (event.origin === this.targetOrigin) {
            if (event.data && this.callbackMap[event.data.id]) {
                this.callbackMap[event.data.id](null, event.data);
                // Remove the resolver from the map so it is not rejected.
                delete this.callbackMap[event.data.id];
            }
        }
    };
    /**
     * Attach the message listener only once for this provider.
     */
    IFrameEthereumProvider.prototype.attachListenerOnce = function () {
        if (this.listenerAttached) {
            return;
        }
        this.listenerAttached = true;
        window.addEventListener('message', this.handleEvents);
    };
    /**
     * Send a JSON RPC to the parent window.
     */
    IFrameEthereumProvider.prototype.sendAsync = function (request, callback) {
        var _this = this;
        if (!IFrameEthereumProvider.isWithinIframe()) {
            throw new Error('Not embedded in an iframe.');
        }
        var parentWindow = window && window.parent;
        this.attachListenerOnce();
        var id = request.id;
        this.callbackMap[id] = callback;
        parentWindow.postMessage(request, this.targetOrigin);
        setTimeout(function () {
            if (_this.callbackMap[id]) {
                callback(new Error("The RPC to the parent iframe has timed out after " + _this.timeoutMs + "ms"), null);
            }
            // We no longer care about the result of the RPC after the time out.
            delete _this.callbackMap[id];
        }, this.timeoutMs);
    };
    return IFrameEthereumProvider;
}());
var IFrameProvider = /** @class */ (function (_super) {
    __extends(IFrameProvider, _super);
    function IFrameProvider(options, network) {
        var _this = this;
        var executor = new IFrameEthereumProvider(options);
        _this = _super.call(this, executor, network) || this;
        return _this;
    }
    return IFrameProvider;
}(web3_provider_1.Web3Provider));
exports.default = IFrameProvider;
