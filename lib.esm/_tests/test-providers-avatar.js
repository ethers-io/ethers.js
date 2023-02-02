import assert from "assert";
import { connect, setupProviders } from "./create-provider.js";
setupProviders();
describe("Resolve ENS avatar", function () {
    [
        { title: "data", name: "data-avatar.tests.ethers.eth", value: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAMAAACeL25MAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyVpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDAyIDc5LjE2NDQ4OCwgMjAyMC8wNy8xMC0yMjowNjo1MyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIyLjAgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NUQ4NTEyNUIyOEIwMTFFQzg0NTBDNTU2RDk1NTA5NzgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NUQ4NTEyNUMyOEIwMTFFQzg0NTBDNTU2RDk1NTA5NzgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1RDg1MTI1OTI4QjAxMUVDODQ1MEM1NTZEOTU1MDk3OCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1RDg1MTI1QTI4QjAxMUVDODQ1MEM1NTZEOTU1MDk3OCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PkbM0uMAAAAGUExURQAA/wAAAHtivz4AAAAOSURBVHjaYmDABAABBgAAFAABaEkyYwAAAABJRU5ErkJggg==" },
        { title: "ipfs", name: "ipfs-avatar.tests.ethers.eth", value: "https:/\/gateway.ipfs.io/ipfs/QmQsQgpda6JAYkFoeVcj5iPbwV3xRcvaiXv3bhp1VuYUqw" },
        { title: "url", name: "url-avatar.tests.ethers.eth", value: "https:/\/ethers.org/static/logo.png" },
    ].forEach((test) => {
        it(`Resolves avatar for ${test.title}`, async function () {
            this.timeout(60000);
            const provider = connect("goerli");
            const avatar = await provider.getAvatar(test.name);
            assert.equal(test.value, avatar, "avatar url");
        });
    });
    /*
    // @TODO: Set up some examples on goerli
        [
            { title: "ERC-1155", name: "nick.eth", value: "https:/\/lh3.googleusercontent.com/hKHZTZSTmcznonu8I6xcVZio1IF76fq0XmcxnvUykC-FGuVJ75UPdLDlKJsfgVXH9wOSmkyHw0C39VAYtsGyxT7WNybjQ6s3fM3macE" },
    //        { title: "ERC-721", name: "brantly.eth", value: "https:/\/api.wrappedpunks.com/images/punks/2430.png" }
        ].forEach((test) => {
            it(`Resolves avatar for ${ test.title }`, async function() {
                this.timeout(60000);
                const provider = connect("mainnet");
                const avatar = await provider.getAvatar(test.name);
                assert.equal(avatar, test.value, "avatar url");
            });
        });
    */
});
//# sourceMappingURL=test-providers-avatar.js.map