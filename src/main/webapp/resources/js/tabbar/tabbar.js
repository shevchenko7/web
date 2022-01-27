
var myTabbar = null;

/**
 * 페이지 탭 추가
 *
 * @param name
 * @param uri
 */
function addTab(id, name, uri, isHold, menuSeq) {

    if(myTabbar != null) {

        if(id == 'menu_home') {
            myTabbar.tabs('menu_home').setActive();
            closeAllMenu();
        }
        else {
            // 탭 갯수 제한 10개
            if(myTabbar.getAllTabs().length < 10) {
                // 탭 글자에 따라 길이 계산
                if($(".dhxtabbar_tab_text").text().indexOf(name) < 0) {
                    var tabSize = (name.length * 15) + 60;
                    myTabbar.addTab(id, name, tabSize, null, true, true);
                }

                if(isHold == 'y') {
                    myTabbar.tabs(id).attachURL(uri + '?RMS_MENU_SEQ=' + menuSeq, true);
                }
                else {
                    myTabbar.tabs(id).attachURL("/error/416", true);
                }
                myTabbar.tabs(id).setActive();
            }
            else {
                alert("더 이상 탭을 추가할 수 없습니다. 사용하지 않는 열려있는 탭을 닫은 후 사용해 주세요.");
            }
        }
    }
}

/**
 * 열린 LNB 닫기
 */
function closeAllMenu() {
    if($("#menu_home").parent().children().hasClass('active') == true) {
        $("#menu_home").parent().children("[class='active']").children('a').click();
    }
}
