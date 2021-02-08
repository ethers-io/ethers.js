"use strict";


if (document.getElementsByTagName("html")[0].classList.contains("single-page")) {
    const title = document.body.querySelector(".sidebar .link.title");
    const content = document.getElementsByClassName("content")[0];
    const toc = document.getElementsByClassName("toc")[0];
    const sidebar = document.getElementsByClassName("sidebar")[0];

    let height = 0;

    const anchors = Array.prototype.reduce.call(document.body.querySelectorAll(".content a"), function(accum, anchor) {
        const name = anchor.getAttribute("name");
        if (name && !accum[name]) {
            accum[name] = anchor;
        }
        return accum;
    }, { });

    const sidebarLinks = Array.prototype.map.call(document.body.querySelectorAll(".sidebar .toc .link a"), function(anchor, index) {
        const name = anchor.getAttribute("href").substring(1);
        const link = anchor.parentNode;

        // If the click, set the class directly, so it doesn't "jump"
        anchor.onclick = function() {
            const current = document.body.querySelector(".link.selected");
            if (current) { current.classList.remove("selected"); }

            link.classList.add("selected");
        };

        height += link.offsetHeight;

        // Get the offset in the content of the target
        let offset = 0;
        anchor = anchors[name];
        if (anchor) { offset = anchor.offsetTop; }

        return { index, link, name, offset };
    });
    sidebarLinks.forEach(function(link, index) {
        const next = sidebarLinks[index + 1];
        link.height = (next ? next.offset: content.offsetHeight) - link.offset;
    });

    function getScrollTop(link) {
        const maxScrollY = (toc.offsetHeight + 160 - window.innerHeight);
        if (link == null) { return maxScrollY; }

        const percentLinks = link.index / sidebarLinks.length;
        return percentLinks * maxScrollY;
    }

    function getTime() { return (new Date()).getTime(); }

    let scrollPaused = false;

    function highlightToc(scrollVisible, animate) {
        // What percent through the content are we?
        let percentContent = window.scrollY / (content.offsetHeight - window.innerHeight);
        if (percentContent < 0) {
            percentContent = 0;
        } else if (percentContent > 1) {
            percentContent = 1;
        }

        // Map to on-screen w/ a smooth gradient from [ 0, content.offsetHeight ]
        let y = window.scrollY + window.innerHeight * percentContent;
        if (y < 0) { y = 0; }

        // Find the link that is at before location y
        let last = null;
        for (let i = 0; i < sidebarLinks.length; i++) {
            const link = sidebarLinks[i];
            if (link.offset > y) { break; }
            last = link;
        }

        // If the link is not already selected...
        if (!last.link.classList.contains("selected")) {
            // ...unselcted the currently seclected link
            const current = document.body.querySelector(".link.selected");
            if (current) { current.classList.remove("selected"); }

            // ...select the new link
            last.link.classList.add("selected");
        }

        // ...and scroll it to be visible
        if (scrollVisible && !scrollPaused) {
            const scrollTarget = getScrollTop(last);
            const percentFragment = (last.offset - y) / last.height;
            const delta = (getScrollTop(sidebarLinks[last.index + 1]) - scrollTarget) * percentFragment;
            const scrollTop = scrollTarget - delta;

            if (animate) {
                const pi_2 = Math.PI / 2;
                const totalDuration = 200;
                const shift = scrollTop - sidebar.scrollTop;
                const start = getTime();
                const timer = setInterval(function() {
                    const duration = getTime() - start;
                    if (duration > totalDuration) {
                        clearInterval(timer);
                        sidebar.scrollTop = scrollTop;
                        return;
                    }
                    // linear: 0 -> 1
                    let i = duration / totalDuration;
                    // ease out: 1 -> 0
                    i = 1 - Math.sin(i * pi_2);
                    sidebar.scrollTop = scrollTop - i * shift;
                }, 5);
            } else {
                sidebar.scrollTop = scrollTop;
            }
        }
    }

    sidebar.onmouseenter = function() {
        scrollPaused = true;
    }

    sidebar.onmouseleave = function() {
        scrollPaused = false;
        highlightToc(true, true);
    }

    // Wehenver we scroll, highlight the TOC
    window.onscroll = function() { highlightToc(true); }

    // Poll occassionally to highlight the TOC (but don't auto-scroll)
    setInterval(function() { highlightToc(false); }, 1000);

    // Set up the initial TOC highlight
    highlightToc(true);
} else {
    const sidebar = document.getElementsByClassName("sidebar")[0];

    // Scroll to TOC to get the selected page visible
    setTimeout(function() {
        const selected = document.querySelector(".myself");
        if (selected) {
            sidebar.scrollTop = Math.max(selected.offsetTop - 230, 0);
        }
    }, 10);
}
