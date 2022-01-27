var pauseUserGrid = null;

// 검색영역
var search = {
    // 검색 데이터
    data : {
        userName : "",
        userCd : "",
    },

    init : function() {
        // 검색버튼 클릭
        $("#searchPauseUserBtn").click(function () {
            if ( search.checkValidation() ) {
                // 검색 데이터 셋팅
                if($("#userSearchType").val() == 'name') {
                    search.data.userName = $("#userSearchText").val();
                } else {
                    search.data.userCd = $("#userSearchText").val();
                }

                // 이전 검색 사용자 정보 데이터 초기화
                // save.userSeq = null;
                // save.userCd = null;
                // save.userName = "";
                // save.departmentCd = "";
                // save.systemSeq = null;
                // save.currentSystemSeq = null;

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
            $("#userSearchType").val("name");
            $("#userSearchText").val("");
        });
    },

    // 검색영역 validation 체크
    checkValidation : function () {
        var validation = true;
        if ( $("#userSearchText").val() == '' ) {
            validation = false;
            alert("이름(사번) 검색어를 입력해 주세요.");
        }

        return validation;
    },

    // 사용자 목록 검색 AJAX
    searchUser : function () {
        $.ajax({
            type: 'GET',
            url: '/v2.0/search/users/pause',
            cache: false,
            data: search.data,
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
            },
            success: function (data, status, xhr) {
                // 그리드 초기화
                pauseUserGrid.clearAll();
                // $("#checkAll").attr("checked", "");

                if ( xhr.status == 200 ) {
                    userList.setUserList(data);
                }
                else if ( xhr.status == 204 ) {
                    pauseUserGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
                    pauseUserGrid.setColspan(0, 0, 10);
                }
            },
            error: function (e) {
                console.log(e);
                errorMsg(e.status);
            }
        });
    }
};

// 사용자 조회
var userList = {
    init : function () {
        userList.setUserGrid();
    },

    // 사용자 목록 그리드 init
    setUserGrid : function () {
        pauseUserGrid = new dhtmlXGridObject('pauseUserListGrid');
        pauseUserGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
        pauseUserGrid.setHeader("사번,이름,유저상태,최종접속일,권한중지일시,권한중지자,권한해제일시,권한해제자");
        pauseUserGrid.setInitWidths("170,170,170,170,170,170,170,170");
        pauseUserGrid.setStyle("text-align:center;","","","");
        pauseUserGrid.setColAlign("center,center,center,center,center,center,center,center");
        pauseUserGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro");
        pauseUserGrid.enableMultiline(true);
        pauseUserGrid.enableColSpan(true);
        pauseUserGrid.attachEvent("onRowSelect", function(id, ind) {
            save.userCd = pauseUserGrid.cells(id, 0).getValue();
        });
        pauseUserGrid.init();
    },

    // 검색 결과 리스트 뿌림
    setUserList : function (data) {
        var rid = pauseUserGrid.uid();
        $.each(data, function(i, users){
            pauseUserGrid.addRow(rid++, [users.userCd, users.userName, users.userStatus, users.loginDate, users.pauseDate, users.pauseUserName, users.normalDate, users.normalUserName], i);
        });
    },

};

var save = {
    userCd : null,

    init : function () {
        $("#setLoginUserStatus").click(function() {
            // 등록/수정할 사용자 데이터 validation 체크
            if ( save.userCd == null ) {
                alert("사용자를 선택해 주새요.");
                return false;
            }
            var data  = {
                "userCd": save.userCd
            };

            save.saveUserInfo(data);
        });
    },

    // 사용자 권한 정보 저장
    saveUserInfo : function (data) {
        $.ajax({
            type: 'POST',
            url: '/v2.0/users/setUserLoginStatus',
            cache: false,
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
            },
            success: function (data, status, xhr) {
                if ( xhr.status == 200 && data == true ) {
                    alert("권한중지 해제 완료되었습니다.");

                    // 이전 검색 사용자 정보 데이터 초기화
                    save.userCd = null;

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
    save.init();
});