/**
 * Created by KwakJaeeun on 2016. 10. 13..
 */
var userGrid = null;
var authorityGrid = null;
var deptGrid = null;

// 검색영역
var search = {
    // 검색 데이터
    data : {
        systemSeq : 0,
        departmentCd : "",
        searchType : "",
        searchText : ""
    },
    departmentNm : "",

    init : function() {
        // 부서 조회버튼 클릭
        $("#searchDeptBtn").click(function (){
            $("#dimmed").append($("#departmentSearchPopupWrap").show().html());
            openLayer('departmentSearchPopupWrap');
            popup.init();
        });

        // 검색버튼 클릭
        $("#searchUserBtn").click(function () {
            if ( search.checkValidation() ) {
                $("#userIsGrant").attr("checked", "");

                // 검색 데이터 셋팅
                search.data.systemSeq = $("#userSystemSeq").val();
                search.data.departmentCd = $("#userDepartmentCd").val();
                search.data.searchType = $("#userSearchType").val();
                search.data.searchText = $("#userSearchText").val();
                search.departmentNm = $("#userDepartmentNm").val();

                // 이전 검색 사용자 정보 데이터 초기화
                save.userSeq = null;
                save.userCd = null;
                save.userName = "";
                save.departmentCd = "";
                save.systemSeq = null;
                save.currentSystemSeq = null;

                search.searchUser();
            }
        });

        // 엔터 키 입력시 검색
        $("#userSearchText").keyup(function(e) {
            if ( e.keyCode == 13 ) {
                $("#searchUserBtn").trigger("click");
            }
        });

        // 초기화 버튼 클릭 이벤트
        $("#userResetBtn").click(function () {
            $("#userSystemSeq").val(0);
            $("#userSearchType").val("name");
            $("#userDepartmentNm").val("");
            $("#userDepartmentCd").val("");
            $("#userSearchText").val("");
        });
    },

    // 검색영역 validation 체크
    checkValidation : function () {
        var validation = true;
        if ( $("#userSystemSeq").val() == 0 ) {
            validation = false;
            alert("시스템명을 선택해 주세요.");
            $("#userSystemSeq").focus();
        }
        else if ( ($("#userDepartmentCd").val() == '' || $("#userDepartmentNm").val() == '') && $("#userSearchText").val() == '' ) {
            validation = false;
            alert("부서 또는 이름(사번) 검색어를 입력해 주세요.");
        }

        return validation;
    },

    // 사용자 목록 검색 AJAX
    searchUser : function () {
        var selSystemName = "";

        $.ajax({
            type: 'GET',
            url: '/v2.0/search/users',
            cache: false,
            data: search.data,
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
            },
            success: function (data, status, xhr) {
                // 그리드 초기화
                userGrid.clearAll();
                authorityGrid.clearAll();
                $("#checkAll").attr("checked", "");
                // userList.isSearch = false;

                selSystemName = $("#userSystemSeq > option[value='"+search.data.systemSeq+"']").text();
                $("#userSystemName").html("("+selSystemName+")");

                if ( xhr.status == 200 ) {
                    userList.setUserList(data);
                }
                else if ( xhr.status == 204 ) {
                    userGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
                    userGrid.setColspan(0, 0, 10);
                }
            },
            error: function (e) {
                console.log(e);
                errorMsg(e.status);
            }
        });
    }
};

// 부서검색 팝업
var popup = {
    departmentName : "",
    departmentCd : "",

    init : function () {
        popup.setDepartmentGrid();

        // 검색 버튼 클릭
        $("#popSearchBtn").click(function () {
            if ( popup.checkValidation() ) {
                popup.searchDepartmentList();
            }
        });

        // 엔터 키 입력시 검색
        $("input[name='searchDept']").keyup(function(e) {
            if ( e.keyCode == 13 ) {
                $("#popSearchBtn").trigger("click");
            }
        });

        // 선택 버튼 클릭
        $("#selectDeptBtn").click(function () {
            // 아무것도 안누르고 선택했을경우
            if ( popup.departmentCd == "" || popup.departmentName == "" ) {
                alert("부서를 다시 선택해 주세요.");
                return false;
            }

            $("#userDepartmentNm").val(popup.departmentName);
            $("#userDepartmentCd").val(popup.departmentCd);

            $("#deptartmentPopCancle").trigger('click');
        });

        // 취소버튼 클릭시 팝업 close (검색단어 초기화, 검색목록 초기화)
        $("#deptartmentPopCancle").click(function () {
            // 검색단어 초기화
            $("input[name='searchDept']").val('');
            // 검색목록 초기화
            deptGrid.clearAll();
            // 팝업 close
            closeLayer('departmentSearchPopupWrap');
            $("#dimmed").empty();
        });
    },

    // 부서검색 그리드 init
    setDepartmentGrid : function () {
        deptGrid = new dhtmlXGridObject('departmentListGrid');
        deptGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
        deptGrid.setHeader("레벨1,레벨2,레벨3,레벨4,레벨5,레벨6,");
        // deptGrid.setInitWidths("20,20,20,20,20,20,0");
        deptGrid.setColAlign("center,center,center,center,center,center,center");
        deptGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro");
        deptGrid.setColumnHidden(6, true);
        deptGrid.enableMultiline(true);
        deptGrid.enableColSpan(true);
        deptGrid.attachEvent("onRowSelect", function(id, ind) {
            // 선택한 부서의 최하위레벨의 이름, 부서코드 찾음
            for ( var i = 5; i > 0; i-- ) {
                if ( deptGrid.cells(id, i).getValue() != '' ) {
                    var departmentName = deptGrid.cells(id, i).getValue();
                    popup.departmentName = departmentName.replace(/&amp;/, "&");
                    break;
                }
            }
            popup.departmentCd = deptGrid.cells(id, 6).getValue();
        });
        deptGrid.init();
    },

    // 검색어 글자수 체크
    checkValidation : function () {
        var searchDeptInput = $("input[name='searchDept']");
        var validation = true;

        if ( searchDeptInput.val() == '' || searchDeptInput.val().length < 2 ) {
            validation = false;
            alert("검색어를 2자 이상 입력해주세요.");
            searchDeptInput.focus();
        }
        return validation;
    },

    // 부서 목록 검색 AJAX
    searchDepartmentList : function () {
        $.ajax({
            type: 'GET',
            url: '/v2.0/search/departments',
            cache: false,
            data: {
                searchDept: $("input[name='searchDept']").val()
            },
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
            },
            success: function (data, status, xhr) {
                // 그리드 초기화
                deptGrid.clearAll();
                popup.departmentName = "";
                popup.departmentCd = "";

                if ( xhr.status == 200 ) {
                    popup.setDeptList(data);
                }
                else if ( xhr.status == 204 ) {
                    deptGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
                    deptGrid.setColspan(0, 0, 6);
                }
            },
            error: function (e) {
                console.log(e);
                errorMsg(e.status);
            }
        });
    },

    // 부서 검색 결과 리스트 뿌림
    setDeptList : function (data) {
        var rid = deptGrid.uid();
        var index = 0;
        var codeList = [];
        $.each(data, function(i, dept) {
            codeList = deptGrid.collectValues(6);

            if(codeList.indexOf(dept.departmentCd1) < 0) {
                deptGrid.addRow(rid++, [dept.departmentName1, '', '', '', '', '', dept.departmentCd1], index++);
            }
            if(dept.departmentName2 != null && dept.departmentName2 != '' && codeList.indexOf(dept.departmentCd2) < 0) {
                deptGrid.addRow(rid++, [dept.departmentName1, dept.departmentName2, '', '', '', '', dept.departmentCd2], index++);
            }
            if(dept.departmentName3 != null && dept.departmentName3 != '' && codeList.indexOf(dept.departmentCd3) < 0) {
                deptGrid.addRow(rid++, [dept.departmentName1, dept.departmentName2, dept.departmentName3, '', '', '', dept.departmentCd3], index++);
            }
            if(dept.departmentName4 != null && dept.departmentName4 != '' && codeList.indexOf(dept.departmentCd4) < 0) {
                deptGrid.addRow(rid++, [dept.departmentName1, dept.departmentName2, dept.departmentName3, dept.departmentName4, '', '', dept.departmentCd4], index++);
            }
            if(dept.departmentName5 != null && dept.departmentName5 != '' && codeList.indexOf(dept.departmentCd5) < 0) {
                deptGrid.addRow(rid++, [dept.departmentName1, dept.departmentName2, dept.departmentName3, dept.departmentName4, dept.departmentName5, '', dept.departmentCd5], index++);
            }
            if(dept.departmentName6 != null && dept.departmentName6 != '' && codeList.indexOf(dept.departmentCd6) < 0) {
                deptGrid.addRow(rid++, [dept.departmentName1, dept.departmentName2, dept.departmentName3, dept.departmentName4, dept.departmentName5, dept.departmentName6, dept.departmentCd6], index++);
            }
        });
    }
};

// 사용자 조회
var userList = {
    userSeq : 0,
    // 조회 이력 여부 ( 권한 부여된 메뉴만 보기 flag )
    // isSearch : false,

    init : function () {
        userList.setUserGrid();
    },

    // 사용자 목록 그리드 init
    setUserGrid : function () {
        userGrid = new dhtmlXGridObject('userListGrid');
        userGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
        userGrid.setHeader("사번,,이름,,,부서명,등록자,등록일,수정자,수정일");
        userGrid.setInitWidths("230,0,115,0,0,230,115,170,115,170");
        userGrid.setStyle("text-align:center;","","","");
        userGrid.setColAlign("center,center,center,center,center,center,center,center,center,center");
        userGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
        userGrid.setColumnHidden(1, true);
        userGrid.setColumnHidden(3, true);
        userGrid.setColumnHidden(4, true);
        userGrid.enableMultiline(true);
        userGrid.enableColSpan(true);
        userGrid.attachEvent("onRowSelect", function(id, ind) {
            var userSeq = userGrid.cells(id, 1).getValue();
            // 사용자 권한 조회
            userList.getUserAuthorityList(userSeq);
            save.userSeq = userSeq;
            save.userCd = userGrid.cells(id, 0).getValue();
            save.userName = userGrid.cells(id, 2).getValue();
            save.departmentCd = userGrid.cells(id, 3).getValue();
            save.currentSystemSeq = userGrid.cells(id, 4).getValue();
        });
        userGrid.init();
    },

    // 검색 결과 리스트 뿌림
    setUserList : function (data) {
        var rid = userGrid.uid();
        $.each(data, function(i, users){
            userGrid.addRow(rid++, [users.userCd, users.userSeq, users.userName, users.departmentCd, users.systemSeq, users.departmentName, users.registeUserName, users.registeDate, users.modifyUserName, users.modifyDate], i);
        });
    },

    // 사용자별 권한 리스트 조회 AJAX
    getUserAuthorityList : function (userSeq) {
        $.ajax({
            type: 'GET',
            url: "/v2.0/users/authority",
            cache: false,
            data: {
                systemSeq: search.data.systemSeq,
                userSeq: userSeq
            },
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
            },
            success: function (data, status, xhr) {
                // 그리드 초기화
                authorityGrid.clearAll();
                userList.userSeq = userSeq;
                // userList.isSearch = true;

                if ( xhr.status == 200 ) {
                    authorityList.setAuthorityList(data);
                }
                else if ( xhr.status == 204 ) {
                    console.log('검색 결과가 존재하지 않습니다.');
                }
            },
            error: function (e) {
                console.log(e);
                errorMsg(e.status);
            }
        });
    }
};

// 사용자별 권한
var authorityList = {
    init : function () {
        authorityList.setAuthorityGrid();

        // 권한 부여된 메뉴만 보기 체크박스 이벤트
        $("#userIsGrant").click(function () {
            if ( $(this).is(":checked") ) {
                authorityList.getShowIdList();
            }
            else {
                // 체크박스 해제했을 경우 모든 row 보여줌
                authorityGrid.forEachRow(function(id) {
                    authorityGrid.setRowHidden(id, false);
                });
            }
        });

        // 권한부여 전체 체크박스 이벤트
        $("#checkAll").click(function() {
            // 권한 리스트 존재하지 않을경우
            if ( $(".chkAuthority").length > 0 ) {
                if( $(this).is(":checked") ){
                    $(".chkAuthority").attr("checked", "checked");
                }
                else {
                    $(".chkAuthority").attr("checked", "");
                }
            }

        });
    },

    // 권한부여된 메뉴만 보기 체크박스 선택했을 경우, 보여줄 리스트 가져옴
    getShowIdList : function () {
        var rowId;
        var showIdArr = [];
        authorityGrid.forEachRow(function(id) {
            // 기능인 경우
            if ( authorityGrid.cells(id, 5).getValue() != "" ) {
                // 체크되어있는경우
                if ( $("#chk"+id).is(":checked") ) {
                    rowId = id;
                    showIdArr.push(id);
                    // 체크된 기능의 상위 메뉴들을 중복제거하여 배열에 넣음
                    for ( var i=0; i<3; i++ ) {
                        rowId = authorityList.getParentId(rowId);
                        if ( showIdArr.indexOf(rowId) < 0 ) {
                            showIdArr.push(rowId);
                        }
                    }
                }
            }
        });
        authorityList.setCheckedMenusGrid(showIdArr);
    },

    // 상위 메뉴의 row id를 가져옴
    getParentId : function (id) {
        var parentId = authorityGrid.getParentId(id);
        return parentId;
    },

    // 보여줄 메뉴 리스트만 뿌려줌
    setCheckedMenusGrid : function (showIdArr) {
        authorityGrid.forEachRow(function(id) {
            if ( showIdArr.indexOf(id) < 0 ) {
                authorityGrid.setRowHidden(id, true);
            }
        });
    },

    // 권한 트리 그리드 init
    setAuthorityGrid : function () {
        authorityGrid = new dhtmlXGridObject('authorityListGrid');
        authorityGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
        authorityGrid.setHeader("메뉴명,기능키,기능명,기능설명,개인정보 포함,엑셀다운 기능,권한부여<br/><input type=\"checkbox\" id=\"checkAll\"> 전체");
        authorityGrid.setInitWidths("255,220,320,320,155,155,75");
        authorityGrid.setStyle("text-align:center;","","","");
        authorityGrid.setColAlign("left,center,center,center,center,center,center");
        authorityGrid.setColTypes("tree,ro,ro,ro,ro,ro,ro");
        authorityGrid.enableColSpan(true);
        authorityGrid.setEditable(false);
        authorityGrid.init();

        authorityGrid.setSkin("dhx_web");
    },

    // 사용자별 권한 리스트 뿌림
    setAuthorityList : function (data) {
        var rowId = authorityGrid.uid();

        // 1depth 메뉴 출력
        $.each(data, function(i, menu1){
            authorityGrid.addRow(rowId, [menu1.menuName, "", "", "", "-", "-", ""], i, 0, "blank.gif");

            // 2depth 메뉴 있을경우
            if ( !$.isEmptyObject(menu1.subMenus) ) {
                var _1depthId = rowId;

                // 2depth 메뉴 출력
                $.each(menu1.subMenus, function(j, menu2){
                    authorityGrid.addRow(++rowId, [menu2.menuName, "", "", "", "-", "-", ""], j, _1depthId, "blank.gif");

                    // 3depth 메뉴 있을경우
                    if ( !$.isEmptyObject(menu2.subMenus) ) {
                        var _2depthId = rowId;

                        // 3depth 메뉴 출력
                        $.each(menu2.subMenus, function(k, menu3){
                            authorityGrid.addRow(++rowId, [menu3.menuName, "", "", "",authorityList.convertTextYn(menu3.isPersonal), authorityList.convertTextYn(menu3.isExcel), ""], k, _2depthId, "blank.gif");

                            // 메뉴기능 있을경우
                            if ( !$.isEmptyObject(menu3.subRoles) ) {
                                var _3depthId = rowId;

                                // 메뉴기능 출력
                                $.each(menu3.subRoles, function(v, role){
                                    ++rowId;
                                    var inputCheckbox = '<input type="checkbox" class="chkAuthority" id="chk'+rowId+'" menu="'+role.menuSeq+'" role="'+role.roleSeq+'" '+( role.isAuthority == 'y' ? 'checked="checked" >' : ' >' );
                                    authorityGrid.addRow(rowId, ["", role.roleName, role.roleTitle, role.roleDescription, authorityList.convertTextYn(role.isPersonal), authorityList.convertTextYn(role.isExcel), inputCheckbox], v, _3depthId, "blank.gif");

                                });
                            }
                        });
                    }
                });
            }
            rowId++;
        });
        // 트리 확장해서 보여줌
        authorityGrid.expandAll();

        if ( $("#userIsGrant").is(":checked") ) {
            authorityList.getShowIdList();
        }
    },

    // 포함,미포함 텍스트 변환
    convertTextYn : function (text) {
        if ( text == "y" ) {
            return "포함";
        }
        else {
            return "미포함";
        }
    }
};

var save = {
    userSeq : null,
    userCd : null,
    currentSystemSeq : null,
    userName : "",
    departmentCd : "",
    authorityList : [],

    init : function () {
        $("#saveUserInfoBtn").click(function() {
            // 권한리스트 초기화
            save.authorityList = [];
            // 등록/수정할 사용자 데이터 validation 체크
            if ( search.data.systemSeq == 0 || save.userSeq == null || save.userCd == null || save.userName == "" || save.departmentCd == "" ) {
                alert("사용자를 선택해 주새요.");
                return false;
            }

            // 권한 리스트 있을경우
            if ( $(".chkAuthority").length > 0 ) {
                $(".chkAuthority").each(function(){
                    if ( $(this).is(':checked') ) {
                        save.authorityList.push({menuSeq: $(this).attr('menu'), roleSeq: $(this).attr('role')});
                    }
                });
            }

            // userSeq 0이거나 systemSeq == 0 이면 등록, 아니면 수정
            var data = null;
            if (save.userSeq == 0) {
                data = {
                    "systemSeq": search.data.systemSeq,
                    "userCd": save.userCd,
                    "userName": save.userName,
                    "departmentCd": save.departmentCd,
                    "authorityList": save.authorityList
                };
            } else {
                data = {
                    "currentSystemSeq": save.currentSystemSeq,
                    "systemSeq": search.data.systemSeq,
                    "userSeq": save.userSeq,
                    "userCd": save.userCd,
                    "authorityList": save.authorityList
                };
            }
            save.saveUserInfo(data);
        });
    },

    // 사용자 권한 정보 저장
    saveUserInfo : function (data) {
        $.ajax({
            type: 'POST',
            url: '/v2.0/users/saveUserInfo',
            cache: false,
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
            },
            success: function (data, status, xhr) {
                if ( xhr.status == 200 && data == true ) {
                    alert("저장이 완료되었습니다.");

                    // 이전 검색 사용자 정보 데이터 초기화
                    save.userSeq = null;
                    save.userCd = null;
                    save.userName = "";
                    save.departmentCd = "";
                    save.systemSeq = null;
                    save.currentSystemSeq = null;

                    search.searchUser();
                }
            },
            error: function (e) {
                console.log(e);
                errorMsg(e.status);
            }
        });
    }
};
//권한복사
var authCopu = {

    init : function () {
        // 권한복사 팝업 버튼 클릭 이벤트
        $("#authCopyBtn").click(function () {
            if(isEmpty(save.userSeq)) {
                alert("사용자 조회 영역에서 복사하려는 사용자를 선택해주세요.");
                return false;
            }

            var uri = "/pop/authCopyPop?userCd=" + save.userCd + "&userName=" + save.userName + "&systemSeq=" + search.data.systemSeq;
            return windowPopupOpen(uri, "authCopyPop", 575, 555);
        });
    },
};

/**
 * 강제로 팝업을 열기 위한 함수.
 * url - 팝업의 url
 * target - 이미 열려 있는 팝업일 경우 재사용.
 * w - width
 * h - height
 * s - scrollbars
 * r - resizeble
 */
function windowPopupOpen(url, target, w, h, s, r) {
    if (s) s = 'auto';
    else s = 'no';
    if (r) r = 'yes';
    else r = 'no'
    var newwin = window.open("about:blank", target, 'width=' + w + ',height=' + h + ',top=0,left=0,status=no,scrollbars=' + s + ',resizable=' + r);
    if (newwin == null) {
        alert("팝업 차단기능 혹은 팝업차단 프로그램이 동작중입니다. 팝업 차단 기능을 해제한 후 다시 시도하세요.");
    } else {
        newwin.location.replace(get_full_url(url));
        return newwin;
    }
}
/**
 * full url로 변경하는 function
 *
 * 팝업 오픈 시 firefox에서 location.replace 또는 location.href 사용시
 * NS_ERROR_MALFORMED_URI 에러가 발생되는 것을 해결하기 위해 사용
 *
 * @param url_path url
 * @returns {string} full url
 */
function get_full_url(url_path)
{
    var loc = window.location;
    var url = "" + loc.protocol + "//" + loc.host + url_path;
    return url;
}

/**
 * Util: Null체크 함수
 *
 * @param value
 * @return Boolean
 */
var isEmpty = function (value) {
    if (value == "" || value == null || value == undefined ||
        ( value != null && typeof value == "object" && !Object.keys(value).length )) {
        return true
    } else {
        return false
    }
};

$(document).ready(function () {
    search.init();
    userList.init();
    authorityList.init();
    save.init();
    authCopu.init();
});