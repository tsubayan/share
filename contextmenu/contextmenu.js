// findDeepestLevel&レベル自動化

"use strict";

function contextMenu(target, _items, operation, options) {
    let callback = options.callback;
    // let event_preShow = options.events.preShow
    let event_show = options.events.show || function() {}
    let event_hide = options.events.hide || function() {}
    let event_activated = options.events.activated || function() {}
    const MAX_LEVEL = 4;
    const LIST_MAX_HEIGHT = 300;
    const LIST_MAX_WIDTH = 1920;
    const SCROLLBAR_SIZE = 25;
    const ANGLE_SIZE = 20;
    const BORDER_SIZE = 4;
    const IndexArray = [];
    let idCounter = 0;

    let ITEMS = {
        // "idname":{name:"name",items:{name,items}}
    };

    if (operation === "destoy") {
        $(".listroot").html("")
        return
    }

    const menuCover = "<div id='divContextMenuCover'></div>";
    const menuElements =
        '<div class="listroot" tabIndex="0">' +
        '<div class="list l1" level="1" tabIndex="0"> </div>' +
        '<div class="list l2" level="2" tabIndex="0"> </div>' +
        '<div class="list l3" level="3" tabIndex="0"> </div>' +
        '<div class="list l4" level="4" tabIndex="0"> </div>' +
        "</div>";

    $("body").append(menuCover).append(menuElements);

    function createMenu(parent, items, level) {
        let counter = 0;
        if (items == null || typeof items !== "object") {
            return;
        }
        Object.keys(items).forEach(function(key) {
            if (typeof items[key] !== "object") {
                // ------が入る可能性がある
                return;
            }
            parent[counter] = items[key];
            const tmpItems = items[key].items;
            IndexArray[idCounter] = items[key];
            items[key].uniqueID = idCounter++;
            items[key].level = level; ///使ってない
            parent[counter].items = {};
            createMenu(parent[counter].items, tmpItems, level + 1);
            counter++;
        });
    }
    createMenu(ITEMS, _items, 1);
    event_activated.apply($(".listroot"), [options]);

    let IsCurrentShow = false;

    let handle;
    const listFrameByLevel = [];
    const showFlag = {
        /*lv:t|f*/
    };

    for (let i = 1; i < MAX_LEVEL + 1; i++) {
        listFrameByLevel[i] = ".list.l" + i;
    }

    $("#divContextMenuCover").hide();
    $(".listroot").hide();
    for (let i = 1; i < MAX_LEVEL + 1; i++) {
        $(listFrameByLevel[i]).hide();
    }

    function closeMeIfAllChildrenNotDisplayed(itemElement) {
        const level = Number($(itemElement).closest(".list").attr("level"));
        setTimeout(function() {
            let hideFlag = true;
            for (let i = level + 1; i <= MAX_LEVEL; i++) {
                if (showFlag[i]) {
                    hideFlag = false;
                    break;
                }
            }
            if (hideFlag) {
                //子供が表示していない限り自分を消す
                $(listFrameByLevel[level]).hide();
                //自分のレベルのフラグを落とす
                showFlag[level] = false;
            }
        }, 1);
    }

    // 孫ひ孫...を閉じる
    function closeAllMago(level) {
        const magoLevel = level + 2;
        for (let i = magoLevel; i <= MAX_LEVEL; i++) {
            $(listFrameByLevel[i]).hide();
            $(listFrameByLevel[i] + " .item").removeClass("selected");
            showFlag[i] = false;
        }
    }

    function hasVerticalScrollBar(element) {
        return $(element).get(0) ?
            parseInt($(element).get(0).scrollHeight) >
            parseInt($(element).innerHeight()) :
            false;
    }

    $(".listroot")
        .on("mouseenter", ".item", function(e) {
            $(this).closest(".list").find(".item").removeClass("selected"); //同一レベルすべてからクラスを消す
            if ($(this).is(".disabled")) {
                preCloseNext(this);
            } else {
                $(this).addClass("selected");
                if ($(this).is(".haveChild")) {
                    preShowNext(this);
                } else {
                    preCloseNext(this);
                }
            }
        })
        .on("mouseleave", function(e) {
            closeMeIfAllChildrenNotDisplayed(this);
        });

    function findDeepestLevel() {
        let level = 4;
        let elm = $(".list.l4 .selected");
        if (elm.length === 0) {
            elm = $(".list.l3 .selected");
            level = 3;
            if (elm.length === 0) {
                elm = $(".list.l2 .selected");
                level = 2;
                if (elm.length === 0) {
                    elm = $(".list.l1 .selected");
                    level = 1;
                    if (elm.length === 0) {
                        $(".list.l1 .item:first-child").addClass("selected");
                        // ここがdisabledやセパレータだったら？
                        elm = $(".list.l1 .selected");
                        level = 0;
                    }
                }
            }
        }
        return { level: level, element: elm };
    }

    $(".list")
        .on("click", ".item", function() {
            if ($(this).is(".disabled") || $(this).is(".haveChild")) {
                return;
            }
            IsCurrentShow = false;
            $("#divContextMenuCover").trigger("click");
            const uniqueid = $(this).attr("uniqueid");
            callback(uniqueid, IndexArray[uniqueid]);
        })
        .on("keydown", function(event) {
            const obj = findDeepestLevel();
            const level = obj.level
            const element = obj.element

            if (level === 0) {
                return;
            }
            if (event.keyCode == 38) {
                // ArrowUp
                let prev = $(element).prev();
                while (prev.is(".itemSeparator") || prev.is(".disabled")) {
                    prev = $(prev).prev();
                }
                if (prev.length > 0) {
                    $(element).trigger("mouseleave");
                    $(prev).trigger("mouseenter")[0].scrollIntoViewIfNeeded()
                }
            }
            if (event.keyCode == 40) {
                // ArrowDown
                let next = $(element).next();
                while (next.is(".itemSeparator") || next.is(".disabled")) {
                    next = $(next).next();
                }
                if (next.length > 0) {
                    $(element).trigger("mouseleave");
                    $(next).trigger("mouseenter")[0].scrollIntoViewIfNeeded()
                }
            }
            if (event.keyCode == 39) {
                // ArrowRight 深いほうに移動
                if ($(listFrameByLevel[level + 1]).css("display") == "none") {
                    return;
                }

                $(listFrameByLevel[level] + " .item").trigger("mouseleave");
                $(listFrameByLevel[level + 1] + " .item:first-child").trigger(
                    "mouseenter"
                );
            }
            if (event.keyCode == 37) {
                // ArrowLeft 浅いほうに移動
                $(listFrameByLevel[level] + " .item").trigger("mouseleave");
                $(listFrameByLevel[level - 1] + " .item.selected").trigger(
                    "mouseenter"
                );
            }
            if (event.keyCode == 13) {
                // enter
                $(element).trigger("click");
            }
            event.preventDefault();
            return false;
        });

    function makeElement(elemName, elemName2, content, obj) {
        let html = "<" + elemName;
        Object.keys(obj).forEach(function(key) {
            html += " " + key + "='" + obj[key] + "' ";
        });
        html += ">";
        html += "<div class='content'>" + content + "</div>";
        html += "<div class='angle'></div>";
        if (elemName2) {
            html += "</" + elemName2 + ">";
        }
        return html;
    }

    // 指定されたレベルの項目を追加する
    // 最大幅になりえるIDを返す
    function appendItem(level, uniqueid) {
        let max = -1;
        let uniq = -1;
        let html = "";
        const items = level === 1 ? ITEMS : IndexArray[uniqueid].items;

        Object.keys(items).forEach(function(idname, idx) {
            const data = items[idname];
            if (data && typeof data === "object") {
                const haveChild = Object.keys(data.items).length > 0;
                const classStr =
                    "item " +
                    (data.disabled ? " disabled" : "") +
                    (haveChild ? " haveChild" : "");

                html += makeElement("div", "div", data.name, {
                    class: classStr,
                    index: idx,
                    uniqueID: data.uniqueID,
                });
                if (data.name.length > max) {
                    // 子なしの場合
                    max = data.name.length;
                    uniq = data.uniqueID;
                }
            } else {
                // セパレータ
                html += "<div class='itemSeparator' index='" + idx + "'></div>";
            }
        });

        $(listFrameByLevel[level]).html("").append(html);
        return uniq;
    }

    // 一定時間後に開くための関数
    function preShowNext(itemElement) {
        const level = Number($(itemElement).closest(".list").attr("level"));
        if (level >= MAX_LEVEL) {
            return;
        }
        clearTimeout(handle);
        handle = setTimeout(function() {
            if ($(itemElement).is(".selected")) {
                showNext.call(itemElement);
            }
        }, 200);
    }

    // 一定時間後に閉じるための関数
    function preCloseNext(itemElement) {
        const level = Number($(itemElement).closest(".list").attr("level"));
        const nextLevel = level + 1;
        clearTimeout(handle);
        handle = setTimeout(function() {
            $(listFrameByLevel[nextLevel]).hide();
            closeAllMago(level);
        }, 200);
    }

    function showNext() {
        // thisは親のitemを指す
        const windowWidth = document.documentElement.clientWidth;
        const windowHeight = document.documentElement.clientHeight;

        const thisListFrame = $(this).closest(".list"); //注:親のフレーム
        const uniqueid = $(this).attr("uniqueid");
        const level = Number(thisListFrame.attr("level"));
        const itemWidth = $(this).outerWidth(true); //親item
        const nextLevel = level + 1;
        const unique = appendItem(nextLevel, uniqueid);

        $(listFrameByLevel[nextLevel]).show();

        // ポップアップの高さがウインドウ高さを超えるのを防ぐ
        // ポップアップの幅がウインドウ幅を超えるのを防ぐ
        // スクロールバーの位置を初期化
        // 横幅にスクロール分を考慮する(スクロールはエレメントの内側に作られるとitemの幅が削られるのでその分を増やす)
        const elementWidth = $("div[uniqueid=" + unique + "]").width();
        const maxElementHeight = Math.min(LIST_MAX_HEIGHT, windowHeight);
        const maxElementWidth = Math.min(LIST_MAX_WIDTH, windowWidth);
        $(listFrameByLevel[nextLevel])
            .scrollTop(0)
            .scrollLeft(0)
            .css({
                width: elementWidth + ANGLE_SIZE + SCROLLBAR_SIZE + BORDER_SIZE,
                "max-width": maxElementWidth,
                "max-height": maxElementHeight,
            })
            .find(".item")
            .css({
                width: elementWidth + ANGLE_SIZE,
            });

        $(listFrameByLevel[nextLevel]).find(".content").css({
            width: elementWidth,
        });

        if (!hasVerticalScrollBar($(listFrameByLevel[nextLevel]))) {
            $(listFrameByLevel[nextLevel]).css({
                width: elementWidth + ANGLE_SIZE + BORDER_SIZE,
            });
        }

        const listWidth = $(listFrameByLevel[nextLevel]).outerWidth(true);
        const listHeight = Math.min(
            LIST_MAX_HEIGHT,
            windowHeight,
            $(listFrameByLevel[nextLevel]).outerHeight(true)
        );
        let displayPosX = $(this).offset().left + itemWidth;
        let displayPosY = $(this).offset().top;

        if (displayPosX + listWidth > windowWidth) {
            displayPosX =
                windowWidth - listWidth - $(thisListFrame).outerWidth(true);
        }
        if (displayPosX < 0) {
            displayPosX = 0;
        }
        if (displayPosY + listHeight > windowHeight) {
            displayPosY = windowHeight - listHeight;
        }
        if (displayPosY < 0) {
            displayPosY = 0;
        }
        $(listFrameByLevel[nextLevel]).css({
            top: displayPosY, //親の今選んでいるitemの高さ
            left: displayPosX, //親の今選んでいるitemの幅
        });

        showFlag[nextLevel] = true;
        closeAllMago(level);
        $(listFrameByLevel[nextLevel] + " .item").removeClass("selected");
    }

    function showFirstLevel(x, y) {
        const windowWidth = document.documentElement.clientWidth;
        const windowHeight = document.documentElement.clientHeight;

        const thisListFrame = $(listFrameByLevel[1]);
        const unique = appendItem(1, 1);
        //ちらつくようなら要対策
        thisListFrame.show(); //listWidth取得のため
        $(".listroot").show(); //listWidth取得のため

        // ポップアップの高さがウインドウ高さを超えるのを防ぐ
        // スクロールバーの位置を初期化
        // 横幅にスクロール分を考慮する(スクロールはエレメントの内側に作られるとitemの幅が削られるのでその分を増やす)
        const elementWidth = $("div[uniqueid=" + unique + "]").width();
        const maxElementWidth = Math.min(LIST_MAX_WIDTH, windowWidth);
        const maxElementHeight = Math.min(LIST_MAX_HEIGHT, windowHeight);
        thisListFrame
            .css({
                width: elementWidth + ANGLE_SIZE + SCROLLBAR_SIZE + BORDER_SIZE,
                "max-width": maxElementWidth,
                "max-height": maxElementHeight,
            })
            .show()
            .scrollTop(0)
            .scrollLeft(0)
            .find(".item")
            .css({
                width: elementWidth + ANGLE_SIZE,
            });

        if (!hasVerticalScrollBar(thisListFrame)) {
            thisListFrame.css({
                width: elementWidth + ANGLE_SIZE + BORDER_SIZE,
            });
        }

        thisListFrame.find(".content").css({
            width: elementWidth,
        });

        ////////////////////////////////

        const listWidth = thisListFrame.outerWidth(true);
        const listHeight = Math.min(
            LIST_MAX_HEIGHT,
            windowHeight,
            $(thisListFrame).outerHeight(true)
        );
        let displayPosX = x; //mouse.x
        let displayPosY = y; //mouse.y

        if (displayPosX + listWidth > windowWidth) {
            displayPosX = windowWidth - listWidth;
        }
        if (displayPosX < 0) {
            displayPosX = 0;
        }
        if (displayPosY + listHeight > windowHeight) {
            displayPosY = windowHeight - listHeight;
        }
        if (displayPosY < 0) {
            displayPosY = 0;
        }

        $(".listroot").show();
        thisListFrame.css({
            left: displayPosX,
            top: displayPosY,
        });

        $("#divContextMenuCover").show();

        // キーボード操作のため
        setTimeout(function() {
            $(thisListFrame).trigger("focus");
        }, 100);
    }

    // 位置ずれの原因だから閉じる
    $(window)
        .off("resize.contextMenu")
        .on("resize.contextMenu", function(e) {
            $("#divContextMenuCover").trigger("click");
        });

    $("#divContextMenuCover")
        .off("click.contextMenu")
        .on("click.contextMenu", function() {
            IsCurrentShow = false;
            $(this).hide();
            for (let i = 1; i < MAX_LEVEL + 1; i++) {
                $(listFrameByLevel[i]).hide();
            }
            $(".selected").removeClass("selected");
            event_hide.apply($(".listroot"), [options])
        });

    // $(window)
    //     .off("dblclick.contextMenu")
    //     .on("dblclick.contextMenu", function(e) {
    //         event_show.apply($(".listroot"), [options]);
    //         if ($(e.originalEvent.target).closest(".listroot").length > 0) {
    //             return;
    //         }
    //         if (!IsCurrentShow) {
    //             IsCurrentShow = true;
    //             showFirstLevel(e.originalEvent.clientX, e.originalEvent.clientY);
    //         }
    //     });

    event_show.apply($(".listroot"), [options]);
    if (!IsCurrentShow) {
        IsCurrentShow = true;
        const x = target.offset.left
        const y = target.offset.top
        showFirstLevel(x, y);
    }

}

(function() {
    function _interface(operation, options) {
        const defaults = {};
        if (typeof operation !== "string") {
            options = operation;
            operation = "create";
        }
        if (typeof options === "string") {
            options = { selector: options };
        } else if (typeof options === "undefined") {
            options = {};
        }
        var o = $.extend(true, {}, defaults, options || {});



        // $() -> {}
        // $. -> Jquery
        // $("xxx") -> xxx

        if (Object.keys(this).length === 0) {
            // $() -> {}
            if ($(options.selector).length === 0) {
                console.error("there is no selector element($())", options.selector)
                return
            }
        } else {
            // $. -> Jquery
            // $("xxx") -> xxx
            if (this instanceof jQuery) {
                // $("xxx") -> xxx
                if (this.length === 0) {
                    console.error("there is no exists element($('xxx')))", this)
                    return
                }
                if (!$(this).is(options.selector)) {
                    console.error("this element is not selector", this, options.selector)
                    return
                }
            } else {
                // $. -> Jquery
                if ($(options.selector).length === 0) {
                    console.error("there is no selector element($.)", options.selector)
                    return
                }
            }
        }

        const target = $(options.selector)
        if (target.length > 1) {
            console.error("there is multi elements", target)
        }
        new contextMenu(target, o.items, operation, options);
    }

    $.fn.contextMenu = _interface;
    $.contextMenu = _interface;
})()