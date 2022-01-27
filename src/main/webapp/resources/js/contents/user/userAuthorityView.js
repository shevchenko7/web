var menuRoleListGrid = null;
var authorityUserGrid = null;

var menuSelect = {
    systemSeq : 0,
    menuData : {
        menuDepth : 1,
        parentsMenuSeq : 0
    },

    init : function () {
        // 시스템명 selectbox 변경 이벤트
        $("#authSystemSeq").change(function() {
            // 메뉴/기능 selectbox 초기화
            $("select[id^='authSt']").each(function() {
                $(this).html('<option value="0">선택</option>');
            });
            menuSelect.systemSeq = $(this).val();
            menuSelect.menuData.menuDepth = 1;
            menuSelect.menuData.parentsMenuSeq = 0;

            if ( $(this).val() != 0 ) {
                menuSelect.getMenuRoleList('authSt1');
            }
        });

        // 메뉴/기능 selectbox 변경 이벤트
        $(".menuSel").change(function() {
            var depth = $(this).attr("id").substring(6);
            var nextDepth = parseInt(depth)+1;

            // 하위depth selectbox 초기화
            for ( var i = nextDepth; i < 5; i++ ) {
                $("#authSt"+i).html('<option value="0">선택</option>');
            }

            menuSelect.menuData.menuDepth = nextDepth;
            menuSelect.menuData.parentsMenuSeq = $(this).val();

            menuSelect.getMenuRoleList('authSt'+nextDepth);
        });
    },

    // 하위 메뉴/기능 조회 AJAX
    getMenuRoleList : function (selectId) {
        $.ajax({
            type: 'GET',
            url: '/v2.0/search/'+menuSelect.systemSeq+'/menutabs',
            cache: false,
            data: menuSelect.menuData,
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
            },
            success: function (data, status, xhr) {
                if ( xhr.status == 200 ) {
                    // 하위depth selectbox 셋팅
                    $("#"+selectId).html('<option value="0">선택</option>');

                    if ( !$.isEmptyObject(data) ) {
                        $.each(data, function(i, item) {
                            if ( selectId != 'authSt4' ) {
                                $("#"+selectId).append('<option value="'+item.menuSeq+'">'+item.menuName+'</option>');
                            }
                            else {
                                $("#"+selectId).append('<option value="'+item.roleSeq+'">'+item.roleName +'('+item.roleTitle +')'+'</option>');
                            }
                        });
                    }
                }
            },
            error: function (e) {
                console.log(e);
                errorMsg(e.status);
            }
        });
    }
};

var userAuthoritySearch = {
    isSearch : false,
    systemSeq : 0,
    menuRoleData : {
        isPersonal : 0,
        isExcel : 0,
        st1 : 0,
        st2 : 0,
        st3 : 0,
        st4 : 0
    },

    init : function () {
        // 검색 버튼 클릭 이벤트
        $("#menuRoleSearchBtn").click(function() {
            if ( $("#authSystemSeq").val() == 0 ) {
                alert("시스템명을 선택해주세요.");
                return false;
            }
            if ( $("#authSt1").val() == 0 ) {
                alert("1뎁스 메뉴 선택을 먼저 진행해 주세요.");
                return false;
            }

            userAuthoritySearch.isSearch = true;

            userAuthoritySearch.menuRoleData.isPersonal = $("#authIsPersonal").val();
            userAuthoritySearch.menuRoleData.isExcel = $("#authIsExcel").val();
            userAuthoritySearch.menuRoleData.st1 = $("#authSt1").val();
            userAuthoritySearch.menuRoleData.st2 = $("#authSt2").val();
            userAuthoritySearch.menuRoleData.st3 = $("#authSt3").val();
            userAuthoritySearch.menuRoleData.st4 = $("#authSt4").val();

            userAuthoritySearch.searchMenuRoleList();
        });

        // 초기화버튼 클릭 이벤트
        $("#authResetBtn").click(function () {
            $("#authSystemSeq").val(0);
            $("#authSystemSeq").trigger('change');
            $("#authIsPersonal").val(0);
            $("#authIsExcel").val(0);
            $("#authSt1").val(0);
            $("#authSt2").val(0);
            $("#authSt3").val(0);
            $("#authSt4").val(0);
        });

        // EXCEL버튼 클릭 이벤트
        $("#authExcelBtn").click(function () {
            if ( !userAuthoritySearch.isSearch ) {
                alert("검색을 먼저 진행해 주세요.");
                return false;
            }
            var actionLink = "/v2.0/search/" + userAuthoritySearch.systemSeq + "/excelmenus";

            $("#rmsMenuSeq").val($(".last-menu.selected").attr('seq'));
            $("#isPersonalVal").val(userAuthoritySearch.menuRoleData.isPersonal);
            $("#isExcelVal").val(userAuthoritySearch.menuRoleData.isExcel);
            $("#st1Val").val(userAuthoritySearch.menuRoleData.st1);
            $("#st2Val").val(userAuthoritySearch.menuRoleData.st2);
            $("#st3Val").val(userAuthoritySearch.menuRoleData.st3);
            $("#st4Val").val(userAuthoritySearch.menuRoleData.st4);

            $("#authExcelForm").attr('action', actionLink);
            $("#authExcelForm").attr('target', "userAuthorityExcel");
            $("#authExcelForm").submit();
        })
    },

    // 메뉴/기능 조회 AJAX
    searchMenuRoleList : function () {
        $.ajax({
            type: 'GET',
            url: '/v2.0/search/'+menuSelect.systemSeq+'/menus',
            cache: false,
            data: userAuthoritySearch.menuRoleData,
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
            },
            success: function (data, status, xhr) {
                menuRoleListGrid.clearAll();
                authorityUserGrid.clearAll();
                $("#menuRoleNm").html("");
                userAuthoritySearch.systemSeq = menuSelect.systemSeq;
                if ( xhr.status == 200 ) {
                    menuRoleList.setMenuRoleList(data);
                }
            },
            error: function (e) {
                console.log(e);
                errorMsg(e.status);
            }
        });
    },

    // 권한 보유 사용자 조회 AJAX
    getAuthorityUserList : function (searchType, data) {
        $.ajax({
            type: 'GET',
            url: '/v2.0/search/'+searchType+'/users',
            cache: false,
            data: data,
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
            },
            success: function (data, status, xhr) {
                authorityUserGrid.clearAll();
                if ( xhr.status == 200 ) {
                    authorityUserList.setAuthorityUserList(data);
                }
            },
            error: function (e) {
                console.log(e);
                errorMsg(e.status);
            }
        });
    }
};

var menuRoleList = {
    init : function () {
        menuRoleList.setMenuRoleGrid();
    },

    // 메뉴/기능 목록 그리드 init
    setMenuRoleGrid : function () {
        menuRoleListGrid = new dhtmlXGridObject('menuRoleGrid');
        menuRoleListGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
        menuRoleListGrid.setHeader("시스템명,1depth 메뉴명,2depth 메뉴명,3depth 메뉴명,기능키,기능명,기능설명,개인정보 포함,엑셀다운 기능,menuSeq,roleSeq,selectName");
        menuRoleListGrid.setInitWidths("90,140,140,180,180,140,230,90,90,0,0,0");
        menuRoleListGrid.setStyle("text-align:center;","","","");
        menuRoleListGrid.setColAlign("center,center,center,center,center,center,center,center,center,center,center,center");
        menuRoleListGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
        menuRoleListGrid.setColumnHidden(9, true);
        menuRoleListGrid.setColumnHidden(10, true);
        menuRoleListGrid.setColumnHidden(11, true);
        menuRoleListGrid.enableColSpan(true);

        // 클릭했을 경우 해당 메뉴/기능 권한 보유 사용자 조회 이벤트
        menuRoleListGrid.attachEvent("onRowSelect", function(id, ind) {
            var searchType = '';
            var menuSeq = menuRoleListGrid.cells(id, 9).getValue();
            var roleSeq = menuRoleListGrid.cells(id, 10).getValue();
            var selectName = menuRoleListGrid.cells(id, 11).getValue();

            $("#menuRoleNm").html("( "+selectName+" )");

            // 메뉴/기능 조회 데이터 셋팅
            if ( menuSeq != "" && roleSeq == "" ) {
                searchType = 'menu';
                var userSearchData = {
                    menuSeq : menuSeq
                };
            }
            else  if ( menuSeq != "" && roleSeq != "" ) {
                searchType = 'role';
                var userSearchData = {
                    menuSeq : menuSeq,
                    roleSeq : roleSeq
                };
            }

            // 사용자 권한 조회
            userAuthoritySearch.getAuthorityUserList(searchType, userSearchData);
        });

        menuRoleListGrid.init();
    },

    // 메뉴/기능 리스트 그리드에 뿌려줌
    setMenuRoleList : function (data) {
        if ( !$.isEmptyObject(data) ) {
            var selSystemName = $("#authSystemSeq > option[value='"+menuSelect.systemSeq+"']").text();
            var rowId = menuRoleListGrid.uid();
            var idx = 0;

            // 1depth 메뉴 출력
            $.each(data, function(i, menu1){
                menuRoleListGrid.addRow(rowId++, [selSystemName, menu1.menuName, "", "", "", "", "", "-", "-", menu1.menuSeq, "", menu1.menuName], idx++);

                // 2depth 메뉴 있을경우
                if ( !$.isEmptyObject(menu1.hasChild) ) {

                    // 2depth 메뉴 출력
                    $.each(menu1.hasChild, function(j, menu2){
                        menuRoleListGrid.addRow(rowId++, [selSystemName, menu1.menuName, menu2.menuName, "", "", "", "", "-", "-", menu2.menuSeq, "", menu2.menuName], idx++);

                        // 3depth 메뉴 있을경우
                        if ( !$.isEmptyObject(menu2.hasChild) ) {

                            // 3depth 메뉴 출력
                            $.each(menu2.hasChild, function(k, menu3){
                                menuRoleListGrid.addRow(rowId++, [selSystemName, menu1.menuName, menu2.menuName, menu3.menuName, "", "", "", menuRoleList.convertTextYn(menu3.isPersonal), menuRoleList.convertTextYn(menu3.isExcel), menu3.menuSeq, "", menu3.menuName], idx++);

                                // 메뉴기능 있을경우
                                if ( !$.isEmptyObject(menu3.hasRole) ) {

                                    // 메뉴기능 출력
                                    $.each(menu3.hasRole, function(v, role){
                                        menuRoleListGrid.addRow(rowId++, [selSystemName, menu1.menuName, menu2.menuName, menu3.menuName, role.roleName, role.roleTitle, role.roleDescription, menuRoleList.convertTextYn(role.isPersonal), menuRoleList.convertTextYn(role.isExcel), menu3.menuSeq, role.roleSeq, role.roleName], idx++);

                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
        else {
            menuRoleListGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
            menuRoleListGrid.setColspan(0, 0, 11);
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

var authorityUserList = {
    init: function () {
        authorityUserList.setAuthorityUserGrid();
    },

    // 권한 보유 사용자 목록 그리드 init
    setAuthorityUserGrid : function () {
        authorityUserGrid = new dhtmlXGridObject('hasAuthUserListGrid');
        authorityUserGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
        authorityUserGrid.setHeader("사번,이름,부서명,권한구분");
        authorityUserGrid.setInitWidths("280,280,280,280");
        authorityUserGrid.setStyle("text-align:center;","","","");
        authorityUserGrid.setColAlign("center,center,center,center");
        authorityUserGrid.setColTypes("ro,ro,ro,ro");
        authorityUserGrid.enableColSpan(true);

        authorityUserGrid.init();
    },

    // 권한 보유 사용자 조회 결과 뿌려줌
    setAuthorityUserList : function (data) {
        var rowId = authorityUserGrid.uid();

        if ( !$.isEmptyObject(data) ) {
            $.each(data, function(i, user) {
                authorityUserGrid.addRow(rowId++, [user.userCd, user.userName, user.departmentName, user.authorityType], i);
            });
        }
        else {
            authorityUserGrid.addRow(0, "권한 보유 사용자가 존재하지 않습니다.");
            authorityUserGrid.setColspan(0, 0, 4);
        }
    }
};

$(document).ready(function(){
    menuSelect.init();
    userAuthoritySearch.init();
    menuRoleList.init();
    authorityUserList.init();
});