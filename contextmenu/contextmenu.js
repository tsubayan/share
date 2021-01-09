/*********************************************
 *    contextMenu Correspondence Overflow  
 ********************************************/
(function() {
    "use strict";

    function contextMenu(target, _items, operation, options) {
        let maxLevel = 0;

        function createMenu(parent, items, level) {
            let counter = 0;
            if (items == null || typeof items !== "object") {
                return;
            }
            if (maxLevel < level) {
                maxLevel = level;
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
                items[key].originalKey = key
                items[key].level = level; ///使ってない
                parent[counter].items = {};
                createMenu(parent[counter].items, tmpItems, level + 1);
                counter++;
            });
        }

        let callback = options.callback;
        // let event_preShow = options.events.preShow
        let event_show = options.events.show || function() {};
        let event_hide = options.events.hide || function() {};
        let event_activated = options.events.activated || function() {};
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
            // $("#divContextMenuCover").trigger("click");
            $("#contextMenuRoot").html("");
            return;
        }

        createMenu(ITEMS, _items, 1);
        const MAX_LEVEL = maxLevel;
        console.log(ITEMS)

        event_activated.apply($("#contextMenuRoot"), [options]);

        let IsCurrentShow = false;

        let handle;
        const listFrameByLevel = [];
        const showFlag = {
            /*lv:t|f*/
        };

        // html生成
        const menuCover = '<div id="divContextMenuCover" hidden></div>';
        const menuRootElement = '<div id="contextMenuRoot" tabIndex="0" hidden>'; //</div>はcontextMenuListのあと

        let html = "";
        for (let i = 1; i < MAX_LEVEL + 1; i++) {
            // '<div class="contextMenuList l1" level="1" tabIndex="0" hidden></div>'
            html += '<div class="contextMenuList l' + i + '" level="' + i + '" tabIndex="0" hidden></div>';
        }
        html = menuCover + menuRootElement + html + "</div>";
        $("body").append(html);

        // アクセス用配列作成
        for (let i = 1; i < MAX_LEVEL + 1; i++) {
            listFrameByLevel[i] = ".contextMenuList.l" + i;
        }

        function closeMeIfAllChildrenNotDisplayed(itemElement) {
            const level = Number(
                $(itemElement).closest(".contextMenuList").attr("level")
            );
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
                $(listFrameByLevel[i] + " .contextMenuItem").removeClass(
                    "contextMenuItemSelected"
                );
                showFlag[i] = false;
            }
        }

        function hasVerticalScrollBar($element) {
            const elem = $element.get(0);
            return elem ?
                parseInt(elem.scrollHeight) > parseInt($element.innerHeight()) :
                false;
        }

        $("#contextMenuRoot")
            .on("mouseenter", ".contextMenuItem", function(e) {
                const $this = $(this);
                $this
                    .closest(".contextMenuList")
                    .find(".contextMenuItem")
                    .removeClass("contextMenuItemSelected"); //同一レベルすべてからクラスを消す
                if ($this.is(".contextMenuItemDisabled")) {
                    preCloseNext(this);
                } else {
                    $this.addClass("contextMenuItemSelected");
                    if ($this.is(".contextMenuHaveItems")) {
                        preShowNext(this);
                    } else {
                        preCloseNext(this);
                    }
                }
            })
            .on("mouseleave", function(e) {
                closeMeIfAllChildrenNotDisplayed(this);
            });

        $(".contextMenuList")
            .on("click", ".contextMenuItem", function() {
                const tmp = $(this);
                if (
                    tmp.is(".contextMenuItemDisabled") ||
                    tmp.is(".contextMenuHaveItems")
                ) {
                    return;
                }
                IsCurrentShow = false;
                $("#divContextMenuCover").trigger("click");
                const uniqueid = tmp.attr("uniqueid");
                callback(IndexArray[uniqueid].originalKey, IndexArray[uniqueid]);
            })
            .on("keydown", function(event) {
                function getFirstSelectableItemByLevel(lv) {
                    // すべてdisabledパターンを考慮する
                    const $firstItem = $(
                        listFrameByLevel[lv] +
                        " .contextMenuItem:not(.contextMenuItemDisabled)"
                    );
                    if ($firstItem.length > 0) {
                        return $($firstItem[0]);
                    }
                    return $firstItem; //length=0
                }

                let level;
                let element;

                // 一番深い選択済みアイテムを探す
                for (level = MAX_LEVEL; level > 0; level--) {
                    element = $(listFrameByLevel[level] + " .contextMenuItemSelected");
                    if (element.length === 1) {
                        break;
                    }
                }

                if (element.length === 0) {
                    // 誰も選ばれていない
                    const firstItem = getFirstSelectableItemByLevel(1);
                    if (firstItem.length === 0) {
                        // すべてdisabledパターンを考慮する
                        event.preventDefault();
                        return false;
                    }
                    firstItem.addClass("contextMenuItemSelected");
                    level = 1;
                }

                if (event.keyCode == 38) {
                    // ArrowUp
                    let prev = $(element).prev();
                    while (
                        prev.is(".contextMenuItemSeparator") ||
                        prev.is(".contextMenuItemDisabled")
                    ) {
                        prev = $(prev).prev();
                    }
                    if (prev.length > 0) {
                        $(element).trigger("mouseleave");
                        $(prev).trigger("mouseenter")[0].scrollIntoViewIfNeeded();
                    }
                }
                if (event.keyCode == 40) {
                    // ArrowDown
                    let next = $(element).next();
                    while (
                        next.is(".contextMenuItemSeparator") ||
                        next.is(".contextMenuItemDisabled")
                    ) {
                        next = $(next).next();
                    }
                    if (next.length > 0) {
                        $(element).trigger("mouseleave");
                        $(next).trigger("mouseenter")[0].scrollIntoViewIfNeeded();
                    }
                }
                if (event.keyCode == 39) {
                    // ArrowRight 深いほうに移動
                    if ($(listFrameByLevel[level + 1]).css("display") == "none") {
                        // 表示してなければやりなおし
                        return;
                    }

                    const $firstItem = getFirstSelectableItemByLevel(level + 1);
                    if ($firstItem.length > 0) {
                        $(listFrameByLevel[level] + " .contextMenuItem").trigger(
                            "mouseleave"
                        );
                        $firstItem.trigger("mouseenter");
                    }
                }
                if (event.keyCode == 37) {
                    // ArrowLeft 浅いほうに移動
                    $(listFrameByLevel[level] + " .contextMenuItem").trigger(
                        "mouseleave"
                    );
                    $(
                        listFrameByLevel[level - 1] +
                        " .contextMenuItem.contextMenuItemSelected"
                    ).trigger("mouseenter");
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
            html += "<div class='contextMenuItemContent'>" + content + "</div>";
            html += "<div class='contextMenuAngle'></div>";
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
                        "contextMenuItem " +
                        (data.disabled ? " contextMenuItemDisabled" : "") +
                        (haveChild ? " contextMenuHaveItems" : "");

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
                    html +=
                        "<div class='contextMenuItemSeparator' index='" + idx + "'></div>";
                }
            });

            $(listFrameByLevel[level]).html("").append(html);
            return uniq;
        }

        // 一定時間後に開くための関数
        function preShowNext(itemElement) {
            const level = Number(
                $(itemElement).closest(".contextMenuList").attr("level")
            );
            if (level >= MAX_LEVEL) {
                return;
            }
            clearTimeout(handle);
            handle = setTimeout(function() {
                if ($(itemElement).is(".contextMenuItemSelected")) {
                    showNext.call(itemElement);
                }
            }, 200);
        }

        // 一定時間後に閉じるための関数
        function preCloseNext(itemElement) {
            const level = Number(
                $(itemElement).closest(".contextMenuList").attr("level")
            );
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

            const $this = $(this);
            const thisListFrame = $this.closest(".contextMenuList"); //注:親のフレーム
            const uniqueid = $this.attr("uniqueid");
            const level = Number(thisListFrame.attr("level"));
            const itemWidth = $this.outerWidth(true); //親item
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
                .find(".contextMenuItem")
                .css({
                    width: elementWidth + ANGLE_SIZE,
                });

            $(listFrameByLevel[nextLevel]).find(".contextMenuItemContent").css({
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
            let displayPosX = $this.offset().left + itemWidth;
            let displayPosY = $this.offset().top;

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
            $(listFrameByLevel[nextLevel] + " .contextMenuItem").removeClass(
                "contextMenuItemSelected"
            );
        }

        function showFirstLevel(x, y) {
            const windowWidth = document.documentElement.clientWidth;
            const windowHeight = document.documentElement.clientHeight;

            const thisListFrame = $(listFrameByLevel[1]);
            const unique = appendItem(1, 1);
            //ちらつくようなら要対策
            thisListFrame.show(); //listWidth取得のため
            $("#contextMenuRoot").show(); //listWidth取得のため

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
                .find(".contextMenuItem")
                .css({
                    width: elementWidth + ANGLE_SIZE,
                });

            if (!hasVerticalScrollBar(thisListFrame)) {
                thisListFrame.css({
                    width: elementWidth + ANGLE_SIZE + BORDER_SIZE,
                });
            }

            thisListFrame.find(".contextMenuItemContent").css({
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

            $("#contextMenuRoot").show();
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
                $(".contextMenuItemSelected").removeClass("contextMenuItemSelected");
                event_hide.apply($("#contextMenuRoot"), [options]);
            });

        if (options.trigger === "any") {
            $(window)
                .off("dblclick.contextMenu")
                .on("dblclick.contextMenu", function(e) {
                    event_show.apply($("#contextMenuRoot"), [options]);
                    if (
                        $(e.originalEvent.target).closest("#contextMenuRoot").length > 0
                    ) {
                        return;
                    }
                    if (!IsCurrentShow) {
                        IsCurrentShow = true;
                        showFirstLevel(e.originalEvent.clientX, e.originalEvent.clientY);
                    }
                });
        }

        event_show.apply($("#contextMenuRoot"), [options]);
        if (!IsCurrentShow) {
            IsCurrentShow = true;
            const x = target.offset.left;
            const y = target.offset.top;
            showFirstLevel(x, y);
        }
    }

    function _interface(operation, options) {
        const defaults = {};
        if (typeof operation !== "string") {
            options = operation;
            operation = "create";
        }
        if (typeof options === "string") {
            options = {
                selector: options,
            };
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
                console.error("there is no selector element($())", options.selector);
                return;
            }
        } else {
            // $. -> Jquery
            // $("xxx") -> xxx
            if (this instanceof jQuery) {
                // $("xxx") -> xxx
                if (this.length === 0) {
                    console.error("there is no exists element($('xxx')))", this);
                    return;
                }
                if (!$(this).is(options.selector)) {
                    console.error("this element is not selector", this, options.selector);
                    return;
                }
            } else {
                // $. -> Jquery
                if ($(options.selector).length === 0) {
                    console.error("there is no selector element($.)", options.selector);
                    return;
                }
            }
        }

        const target = $(options.selector);
        if (target.length > 1) {
            console.error("there is multi elements", target);
            return;
        }
        new contextMenu(target, o.items, operation, options);
    }

    $.fn.contextMenu = _interface;
    $.contextMenu = _interface;
})();