/**
 * Created by ran on 2016. 10. 18..
 */

var menuManage = {
    // grid
    menuGrid: null,
    inUseRoleGrid: null,
    workableRoleGrid: null,
    // search
    systemSeq: 0,
    systemName: '',
    searchIsUsed: '',
    depth1:'',
    depth2:'',
    // role
    allRoles: null,

    init: function () {
        menuManage.grid.menuInit();
        menuManage.grid.roleInit();

        menuManage.search.init();
        menuManage.menu.init();
        menuManage.button.init();
    },

    button: {
        init: function () {
            // 초기화 버튼 클릭
            $("#menuManage #menuReset").click(function () {
                menuManage.button.clear();
            });

            // 등록/수정 버튼 클릭
            $("#menuManage #menuSave").click(function () {
                menuManage.menu.save();
            });
        },

        clear: function () {
            $("#menuManage #menuCode").text('');
            $("#menuManage #menuName").val('');
            $("#menuManage #menuOrder").val('');
            $("#menuManage #parentsMenu option").remove();
            $("#menuManage #parentsMenu").append("<option value=''>선택</option>");
            $("#menuManage #menuUrl").val('');
            $("#menuManage #isPersonal").text('');
            $("#menuManage #isExcel").text('');
            $("#menuManage #isUsed").val('y');
            $("#menuManage #parentsMenu").attr('disabled', true);
            $("#menuManage #menuurl").attr('disabled', true);
            $("#menuManage .menuName").text('');
            menuManage.menu.depthSelectbox();

            menuManage.menuGrid.clearSelection();
            menuManage.inUseRoleGrid.clearAll();
            menuManage.workableRoleGrid.clearAll();

            menuManage.role.setWorkableList(menuManage.allRoles);
        }
    },

    /**
     * 그리드 관련
     */
    grid: {
        // 메뉴 그리드 초기화
        menuInit: function () {
            menuManage.menuGrid = new dhtmlXGridObject('menuGrid');
            menuManage.menuGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
            // 시스템명, 메뉴코드, 1depth메뉴명, 2depth메뉴명, 3depth메뉴명, depth, 순위, URL, 개인정보, 엑셀다운기능, 사용여부, 등록자, 등록일, 수정자, 수정일, 상위메뉴seq, depth1seq, dept2seq
            menuManage.menuGrid.setHeader("시스템명,메뉴코드,1depth<br/>메뉴명,2depth<br/>메뉴명,3depth<br/>메뉴명,depth,순위,URL,개인정보,엑셀다운<br/>기능,사용여부,등록자,등록일,수정자,수정일,,,");
            // menuManage.menuGrid.setInitWidthsP("5,4,7,7,10,3,3,20,4,4,4,4,10,4,10,0");
            menuManage.menuGrid.setInitWidths("75,60,100,100,110,50,50,240,70,70,70,70,140,70,140,0,0,0");
            menuManage.menuGrid.setColAlign("center,center,center,center,center,center,center,left,center,center,center,center,center,center,center,center,center,center");
            menuManage.menuGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
            menuManage.menuGrid.setStyle("text-align:center;", "", "");
            menuManage.menuGrid.attachEvent("onRowSelect", function (id, ind) {
                menuManage.callAjax.menuInformation(menuManage.menuGrid.cells(id, 1).getValue());
            });
            menuManage.menuGrid.setColumnHidden(15, true);
            menuManage.menuGrid.setColumnHidden(16, true);
            menuManage.menuGrid.setColumnHidden(17, true);
            menuManage.menuGrid.init();
            menuManage.menuGrid.enableColSpan(true);
            menuManage.menuGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
            menuManage.menuGrid.setColspan(0, 0, 18);
        },

        // 기능 그리드 초기화
        roleInit: function () {
            // 사용여부 : index 5는 사용여부
            // 등록자, 등록일 : index 6,7는 기능등록일, index 8,9는 매핑등록일
            // 설정 : index 10 제거버튼, index 11 추가버튼
            // in use role
            menuManage.inUseRoleGrid = new dhtmlXGridObject('inUseRoleGrid');
            menuManage.inUseRoleGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
            menuManage.inUseRoleGrid.setHeader("고유번호,기능키,기능명,기능설명,개인정보 포함,엑셀다운 가능,,,,등록자,등록일,설정,");
            // menuManage.inUseRoleGrid.setInitWidthsP("5,10,43,8,8,0,0,0,5,10,10,0");
            menuManage.inUseRoleGrid.setInitWidths("75,150,150,400,100,100,0,0,0,80,140,100,0");
            menuManage.inUseRoleGrid.setColAlign("center,center,center,left,center,center,center,center,center,center,center,center,center");
            menuManage.inUseRoleGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
            menuManage.inUseRoleGrid.setStyle("text-align:center;", "", "");
            menuManage.inUseRoleGrid.setColumnHidden(6, true);
            menuManage.inUseRoleGrid.setColumnHidden(7, true);
            menuManage.inUseRoleGrid.setColumnHidden(8, true);
            menuManage.inUseRoleGrid.setColumnHidden(12, true);
            menuManage.inUseRoleGrid.init();

            // workable role
            menuManage.workableRoleGrid = new dhtmlXGridObject('workableRoleGrid');
            menuManage.workableRoleGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
            menuManage.workableRoleGrid.setHeader("고유번호,기능키,기능명,기능설명,개인정보 포함,엑셀다운 가능,사용여부,등록자,등록일,,,,설정");
            menuManage.workableRoleGrid.attachHeader("&nbsp;,#text_filter,#text_filter,&nbsp;");
            // menuManage.workableRoleGrid.setInitWidthsP("5,10,35,8,8,8,5,10,0,0,0,10");
            menuManage.workableRoleGrid.setInitWidths("75,150,150,400,100,100,100,80,140,0,0,0,100");
            menuManage.workableRoleGrid.setColAlign("center,center,center,left,center,center,center,center,center,center,center,center,center");
            menuManage.workableRoleGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
            menuManage.workableRoleGrid.setStyle("text-align:center;", "", "");
            menuManage.workableRoleGrid.enableSmartRendering(true);
            menuManage.workableRoleGrid.setColumnHidden(9, true);
            menuManage.workableRoleGrid.setColumnHidden(10, true);
            menuManage.workableRoleGrid.setColumnHidden(11, true);
            menuManage.workableRoleGrid.init();
        },

        // 기능 '제거' 버튼 event
        deleteRole: function (id) {
            // inUseRoleGrid -> workableRoleGrid
            menuManage.inUseRoleGrid.moveRow(id, "row_sibling", null, menuManage.workableRoleGrid);
        },

        // 기능 '추가' 버튼 event
        addRole: function (id) {
            if ($("#menuManage #menuDepth").val() != 3) {
                alert("기능(Role) 추가는 3뎁스에서만 가능합니다.");
                return false;
            }

            // workableRoleGrid-> inUseRoleGrid
            menuManage.workableRoleGrid.moveRow(id, "row_sibling", null, menuManage.inUseRoleGrid);
        }
    },

    /**
     * 검색 관련
     */
    search: {
        init: function () {
            // 검색버튼 클릭
            $("#menuManage #searchBtn").click(function () {
                if (menuManage.search.validation()) {
                    menuManage.systemSeq = $("#menuManage select[name='systemSeq']").val();
                    menuManage.systemName = $("#menuManage select[name='systemSeq'] option:selected").text();
                    menuManage.searchIsUsed = $("#menuManage select[name='isUsed']").val();
                    menuManage.depth1 = $("#menuManage select[name='depth1']").val();
                    menuManage.depth2 = $("#menuManage select[name='depth2']").val();
                    menuManage.callAjax.search();
                }
            });

            // 시스템명 셀렉트박스 변경 - 1뎁스 메뉴조회
            $("#menuManage select[name='systemSeq']").change(function () {
                var seq = $(this).val();

                if( seq == 0 ) {
                    menuManage.search.clearDepth();
                }
                else {
                    menuManage.callAjax.menuBySystem(seq, 1);
                }
            });

            // 메뉴/기능 셀렉트박스 변경 - 하위뎁스 메뉴조회
            $("#menuManage .searchMenu").change(function () {
                var seq = $(this).val();
                menuManage.callAjax.subMenu(parseInt($(this).attr('depth')) + 1, seq);
            });
        },

        validation: function () {
            if ($("#menuManage select[name='systemSeq']").val() == '0') {
                alert('시스템명은 반드시 선택하셔야 합니다.');
                return false;
            }
            return true;
        },

        clearDepth: function (depth) {
            if( depth == 'undefined' || depth == undefined || depth <= 2 ) {
                $("#menuManage select[name='depth2']").find('option').remove().end().append("<option value=''>선택</option>").val('0');
            }
            if( depth == 'undefined' || depth == undefined || depth == 1 ) {
                $("#menuManage select[name='depth1']").find('option').remove().end().append("<option value=''>선택</option>").val('0');
            }
        },

        setMenuName: function (depth, data) {
            menuManage.search.clearDepth(depth);

            if( data != null && data != '' && data != 'undefined' ) {
                $.each(data, function(i, value) {
                    $("#menuManage select[name='depth" + depth + "']").append("<option value='" + value.menuSeq + "'>" + value.menuName + "</option>");
                });
            }
        }

    },

    /**
     * 메뉴 관련
     */
    menu: {
        limit_length: 28,

        init: function () {
            $('#menuManage #menuInformation select').attr('disabled', true);

            // 메뉴명 길이체크 이벤트
            $("#menuManage #menuName").keyup(function (e) {
                if ($("#menuManage #menuName").val().bytes() > menuManage.menu.limit_length) {
                    $("#menuManage #menuName").val($("#menuManage #menuName").val().cut(menuManage.menu.limit_length));
                    alert('메뉴명은 최대 28byte까지 입력 가능합니다.');
                    return false;
                }
            });

            // 메뉴 뎁스 셀렉트박스 변경
            // todo: 기능 추가를 이미 한 상태에서 뎁스 변경하면 어떻게 해야하나??
            $("#menuManage #menuDepth").change(function () {
                var depth = $(this).val();

                if (depth == '' || depth == 1) {
                    menuManage.menu.setUpperMenu(true);

                    if ($("#menuManage #menuUrl").val() != '')   $("#menuManage #menuUrlHidden").val($("#menuManage #menuUrl").val());
                    $("#menuManage #menuUrl").val('');
                    $("#menuManage #menuUrl").attr('disabled', true);
                    $("#menuManage #inUseRoleGrid .objbox").hide();
                    $("#menuManage #workableRoleGrid .objbox").hide();
                }
                else {
                    // 이미 가져온 상위 메뉴가 있으면 호출 안함.
                    if (depth == 2) {
                        if ($("#menuManage #menuUrl").val() != '')   $("#menuManage #menuUrlHidden").val($("#menuManage #menuUrl").val());
                        $("#menuManage #menuUrl").val('');
                        $("#menuManage #menuUrl").attr('disabled', true);
                        $("#menuManage #inUseRoleGrid .objbox").hide();
                        $("#menuManage #workableRoleGrid .objbox").hide();
                    }
                    else if (depth == 3) {
                        $("#menuManage #menuUrl").attr('disabled', false);
                        $("#menuManage #menuUrl").val($("#menuManage #menuUrlHidden").val());
                        $("#menuManage #inUseRoleGrid .objbox").show();
                        $("#menuManage #workableRoleGrid .objbox").show();
                    }

                    menuManage.callAjax.upperMenu(depth);
                }
            });
        },

        // 상위 메뉴 셀렉트박스 셋팅
        setUpperMenu: function (isDisabled, data) {
            $("#menuManage #parentsMenu option").remove();
            $("#menuManage #parentsMenu").append("<option value=''>선택</option>");

            if (isDisabled) {
                $("#menuManage #parentsMenu").attr('disabled', true);
            }
            else {
                $("#menuManage #parentsMenu").attr('disabled', false);

                if (data != null) {
                    $.each(data, function (i, pMenu) {
                        $("#menuManage #parentsMenu").append("<option value='" + pMenu.menuSeq + "'>" + pMenu.menuName + "</option>");
                    });
                }

                var rowId = menuManage.menuGrid.getSelectedRowId();
                if (rowId != null) {
                    $("#menuManage #parentsMenu").val(menuManage.menuGrid.cells(rowId, 15).getValue());
                }
            }
        },

        // 메뉴 리스트 출력
        setList: function (data) {
            menuManage.menuGrid.clearAll();
            var rid = menuManage.menuGrid.uid();
            var index = 0;

            if (data == null || data.length <= 0) {
                menuManage.menuGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
                menuManage.menuGrid.setColspan(0, 0, 18);
            }
            else {
                $.each(data, function (i, depth1) {
                    // 1depth
                    menuManage.menuGrid.addRow(rid++, [menuManage.systemName, depth1.menuSeq, depth1.menuName, '', '', depth1.menuDepth, depth1.menuOrder, '', '-', '-', depth1.isUsed == 'y' ? '사용' : '미사용', depth1.registeUserName, depth1.registeDate, depth1.modifyUserName, depth1.modifyDate, '', depth1.menuSeq, ''], ++index);

                    if (depth1.subMenus != undefined && depth1.subMenus.length > 0) {
                        $.each(depth1.subMenus, function (j, depth2) {
                            // 2depth
                            menuManage.menuGrid.addRow(rid++, [menuManage.systemName, depth2.menuSeq, depth1.menuName, depth2.menuName, '', depth2.menuDepth, depth2.menuOrder, '', '-', '-', depth2.isUsed == 'y' ? '사용' : '미사용', depth2.registeUserName, depth2.registeDate, depth2.modifyUserName, depth2.modifyDate, depth2.parentsMenuSeq, depth1.menuSeq, depth2.menuSeq], ++index);

                            if (depth2.subMenus != undefined && depth2.subMenus.length > 0) {
                                $.each(depth2.subMenus, function (z, depth3) {
                                    // 3depth
                                    menuManage.menuGrid.addRow(rid++, [menuManage.systemName, depth3.menuSeq, depth1.menuName, depth2.menuName, depth3.menuName, depth3.menuDepth, depth3.menuOrder, depth3.menuUrl, depth3.isPersonal == 'y' ? '포함' : '미포함', depth3.isExcel == 'y' ? '포함' : '미포함', depth3.isUsed == 'y' ? '사용' : '미사용', depth3.registeUserName, depth3.registeDate, depth3.modifyUserName, depth3.modifyDate, depth3.parentsMenuSeq, depth1.menuSeq, depth2.menuSeq], ++index);
                                });
                            }
                        });
                    }
                });
            }
        },

        // 메뉴 정보 셋팅
        setInformation: function (data) {
            var menuInfo = data.menuDetails;

            // menu information
            $("#menuManage #menuCode").text(menuInfo.menuSeq);
            $("#menuManage #menuName").val(menuInfo.menuName);
            $("#menuManage #menuOrder").val(menuInfo.menuOrder);
            $("#menuManage #isPersonal").text(menuManage.menuGrid.cells(menuManage.menuGrid.getSelectedRowId(), 8).getValue());
            $("#menuManage #isExcel").text(menuManage.menuGrid.cells(menuManage.menuGrid.getSelectedRowId(), 9).getValue());
            $("#menuManage #isUsed").val(menuInfo.isUsed);
            $("#menuManage .menuName").text(menuInfo.menuName);
            menuManage.menu.depthSelectbox(menuInfo.menuDepth);

            if (menuInfo.menuDepth == 1) {
                $("#menuManage #menuUrl").val('');
                $("#menuManage #menuUrl").attr('disabled', true);
                menuManage.menu.setUpperMenu(true);
            }
            else {
                if (menuInfo.menuDepth == 2) {
                    $("#menuManage #menuUrl").val('');
                    $("#menuManage #menuUrl").attr('disabled', true);
                }
                else if (menuInfo.menuDepth == 3) {
                    $("#menuManage #menuUrl").attr('disabled', false);
                    $("#menuManage #menuUrl").val(menuInfo.menuUrl);
                }

                menuManage.menu.setUpperMenu(false, menuInfo.upperMenus);
            }

            // todo: menuManage.role 쪽으로 뺄수 있지않을까.
            menuManage.inUseRoleGrid.clearAll();
            menuManage.workableRoleGrid.clearAll();
            var rid = menuManage.inUseRoleGrid.uid();

            // in use role
            if (data.mapRoles != undefined && data.mapRoles.length > 0) {
                $.each(data.mapRoles, function (i, role) {
                    if (role.isUsed == 'y') {
                        menuManage.inUseRoleGrid.addRow(rid, [role.roleSeq, role.roleName, role.roleTitle, role.roleDescription, role.isPersonal == 'y' ? '포함' : '미포함', role.isExcel == 'y' ? '포함' : '미포함', '사용', role.roleRegisteUserName, role.roleRegisteDate, role.mapRegisteUserName, role.mapRegisteDate, '<button class="ui button font-malgun small deleteRole" onclick="javascript:menuManage.grid.deleteRole(' + rid + ');">제거</button>', '<button class="ui button font-malgun small addRole" onclick="javascript:menuManage.grid.addRole(' + rid + ');">추가</button>'], i);
                    }
                    else {
                        menuManage.inUseRoleGrid.addRow(rid, [role.roleSeq, role.roleName, role.roleTitle, role.roleDescription, role.isPersonal == 'y' ? '포함' : '미포함', role.isExcel == 'y' ? '포함' : '미포함', '미사용', role.roleRegisteUserName, role.roleRegisteDate, role.mapRegisteUserName, role.mapRegisteDate, '<button class="ui button font-malgun small deleteRole" onclick="javascript:menuManage.grid.deleteRole(' + rid + ');">제거</button>', '<button class="ui button font-malgun small addRole" onclick="javascript:menuManage.grid.addRole(' + rid + ');" disabled>추가</button>'], i);
                    }
                    rid++;
                });
            }

            rid = menuManage.workableRoleGrid.uid();
            // workable role
            if (data.unMapRoles != undefined && data.unMapRoles.length > 0) {
                $.each(data.unMapRoles, function (i, role) {
                    if (role.isUsed == 'y') {
                        menuManage.workableRoleGrid.addRow(rid, [role.roleSeq, role.roleName, role.roleTitle, role.roleDescription, role.isPersonal == 'y' ? '포함' : '미포함', role.isExcel == 'y' ? '포함' : '미포함', '사용', role.roleRegisteUserName, role.roleRegisteDate, '', '', '<button class="ui button font-malgun small deleteRole" onclick="javascript:menuManage.grid.deleteRole(' + rid + ');">제거</button>', '<button class="ui button font-malgun small addRole" onclick="javascript:menuManage.grid.addRole(' + rid + ');">추가</button>'], i);
                    }
                    else {
                        menuManage.workableRoleGrid.addRow(rid, [role.roleSeq, role.roleName, role.roleTitle, role.roleDescription, role.isPersonal == 'y' ? '포함' : '미포함', role.isExcel == 'y' ? '포함' : '미포함', '미사용', role.roleRegisteUserName, role.roleRegisteDate, '', '', '<button class="ui button font-malgun small deleteRole" onclick="javascript:menuManage.grid.deleteRole(' + rid + ');">제거</button>', '<button class="ui button font-malgun small addRole" onclick="javascript:menuManage.grid.addRole(' + rid + ');" disabled>추가</button>'], i);
                    }
                    rid++;
                });
            }
        },

        save: function () {
            if (menuManage.menu.validation()) {
                var data = {
                    "menuSeq": $("#menuManage #menuCode").text(),
                    "systemSeq": menuManage.systemSeq,
                    "menuName": $("#menuManage #menuName").val(),
                    "menuDepth": $("#menuManage #menuDepth").val(),
                    "parentsMenuSeq": $("#menuManage #parentsMenu").val(),
                    "menuUrl": $("#menuManage #menuUrl").val().replace(/ /g, ''),
                    "menuOrder": $("#menuManage #menuOrder").val(),
                    "isUsed": $("#menuManage #isUsed").val(),
                    "authorityList": []
                };
                menuManage.inUseRoleGrid.forEachRow(function (id) {
                    data.authorityList.push({roleSeq: menuManage.inUseRoleGrid.cells(id, 0).getValue()});
                });

                menuManage.callAjax.saveMenu(JSON.stringify(data));
            }
        },

        validation: function () {

            if ($("#menuManage #systemName").text() == '') {
                alert('시스템이 선택되지 않았습니다.');
                return false;
            }
            else if ($("#menuManage #menuName").val() == '') {
                alert('메뉴명을 입력해주세요.');
                return false;
            }
            else if ($("#menuManage #menuDepth").val() == '') {
                alert('메뉴뎁스를 선택해주세요.');
                return false;
            }
            else if ($("#menuManage #menuDepth").val() != 1 && $("#menuManage #parentsMenu").val() == '') {
                alert('상위메뉴를 선택해주세요.');
                return false;
            }
            else if ($("#menuManage #menuUrl").is(':enabled') && $("#menuManage #menuUrl").val() == '') {
                alert('메뉴URL를 입력해주세요.');
                return false;
            }
            else if ($("#menuManage #menuOrder").val() == '') {
                alert('메뉴 순위를 선택해주세요.');
                return false;
            }

            // 메뉴명, URL 중복 체크
            var hasMenuName = false;
            var hasMenuUrl = false;
            var depth = $("#menuManage #menuDepth").val();
            var isNotMe;
            menuManage.menuGrid.forEachRow(function (id) {
                isNotMe = menuManage.menuGrid.cells(id, 1).getValue() != $("#menuManage #menuCode").text();
                if ($("#menuManage #menuUrl").is(':enabled') && menuManage.menuGrid.cells(id, 7).getValue() == $("#menuManage #menuUrl").val() && isNotMe) {
                    hasMenuUrl = true;
                    return;
                }

                if (menuManage.menuGrid.cells(id, 10).getValue() == '사용') {
                    if (depth == 1 && menuManage.menuGrid.cells(id, 2).getValue() == $("#menuManage #menuName").val() && menuManage.menuGrid.cells(id, 16).getValue() != $("#menuManage #menuCode").text()) {
                        hasMenuName = true;
                        return;
                    }
                    else if (depth == 2 && menuManage.menuGrid.cells(id, 3).getValue() == $("#menuManage #menuName").val() && menuManage.menuGrid.cells(id, 17).getValue() != $("#menuManage #menuCode").text()) {
                        if (menuManage.menuGrid.cells(id, 2).getValue() == $("#menuManage #parentsMenu option:selected").text()) {
                            hasMenuName = true;
                            return;
                        }
                    }
                    else if (depth == 3 && menuManage.menuGrid.cells(id, 4).getValue() == $("#menuManage #menuName").val() && isNotMe) {
                        if (menuManage.menuGrid.cells(id, 3).getValue() == $("#menuManage #parentsMenu option:selected").text()) {
                            hasMenuName = true;
                            return;
                        }
                    }
                }
            });
            if (hasMenuName == true) {
                alert("이미 등록된 메뉴명입니다.");
                return false;
            }
            else if (hasMenuUrl == true) {
                alert("이미 등록된 URL입니다.");
                return false;
            }

            return true;
        },

        // 메뉴 depth 셀렉트박스 옵션 변경
        depthSelectbox: function (depth) {
            $("#menuManage #menuDepth option").remove();

            if (depth == '' || depth == undefined) {
                $("#menuManage #menuDepth").append("<option value='' selected='selected'>선택</option>");
                $("#menuManage #menuDepth").append("<option value='1'>1</option>");
                $("#menuManage #menuDepth").append("<option value='2'>2</option>");
                $("#menuManage #menuDepth").append("<option value='3'>3</option>");
            }
            else {
                $("#menuManage #menuDepth").append("<option value='" + depth + "'>" + depth + "</option>");
            }
        }
    },

    /**
     * 기능 관련
     */
    role: {
        // 등록 가능한 기능 리스트 셋팅
        setWorkableList: function (data) {
            menuManage.workableRoleGrid.clearAll();
            menuManage.workableRoleGrid.getFilterElement(1).value = '';
            menuManage.workableRoleGrid.getFilterElement(2).value = '';
            var rid = menuManage.workableRoleGrid.uid();

            // workable role
            if (data != undefined && data.length > 0) {
                $.each(data, function (i, role) {
                    if (role.isUsed == 'y') {
                        menuManage.workableRoleGrid.addRow(rid, [role.roleSeq, role.roleName, role.roleTitle, role.roleDescription, role.isPersonal == 'y' ? '포함' : '미포함', role.isExcel == 'y' ? '포함' : '미포함', '사용', role.roleRegisteUserName, role.roleRegisteDate, '', '', '<button class="ui button font-malgun small deleteRole" onclick="javascript:menuManage.grid.deleteRole(' + rid + ');">제거</button>', '<button class="ui button font-malgun small addRole" onclick="javascript:menuManage.grid.addRole(' + rid + ');">추가</button>'], i);
                    }
                    else {
                        menuManage.workableRoleGrid.addRow(rid, [role.roleSeq, role.roleName, role.roleTitle, role.roleDescription, role.isPersonal == 'y' ? '포함' : '미포함', role.isExcel == 'y' ? '포함' : '미포함', '미사용', role.roleRegisteUserName, role.roleRegisteDate, '', '', '<button class="ui button font-malgun small deleteRole" onclick="javascript:menuManage.grid.deleteRole(' + rid + ');">제거</button>', '<button class="ui button font-malgun small addRole" onclick="javascript:menuManage.grid.addRole(' + rid + ');" disabled>추가</button>'], i);
                    }
                    rid++;
                });
            }
        }
    },

    /**
     * 서버 호출 관련
     */
    callAjax: {
        search: function () {
            menuManage.button.clear();
            $("#menuManage #systemName").text(menuManage.systemName);

            $.ajax({
                type: 'GET',
                url: '/v2.0/search/menus.json',
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
                },
                data: {
                    systemSeq: menuManage.systemSeq,
                    isUsed: menuManage.searchIsUsed,
                    depth1: menuManage.depth1,
                    depth2: menuManage.depth2
                },
                dataType: 'json',
                success: function (data, status, xhr) {
                    if (xhr.status == 200) {
                        $('#menuManage #menuInformation select').attr('disabled', false);
                        $('#menuManage #parentsMenu').attr('disabled', true);
                        $('#menuManage #menuUrl').attr('disabled', true);

                        menuManage.menu.setList(data.menuList);
                        menuManage.role.setWorkableList(data.roleList);
                        menuManage.allRoles = data.roleList;
                    }
                    else if (xhr.status == 204) {
                        menuManage.menuGrid.clearAll();
                        menuManage.menuGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
                        menuManage.menuGrid.setColspan(0, 0, 15);
                    }
                    else {
                        alert("다시 시도해주세요.");
                    }
                },
                error: function (e) {
                    console.log(e);
                    errorMsg(e.status);
                }
            });
        },

        upperMenu: function (depth) {
            $.ajax({
                type: 'GET',
                url: '/v2.0/upper/menus',
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
                },
                data: {
                    systemSeq: menuManage.systemSeq,
                    depth: depth
                },
                dataType: 'json',
                success: function (data, status, xhr) {

                    if (xhr.status == 200) {
                        menuManage.menu.setUpperMenu(false, data);
                    }
                    else if (xhr.status == 204) {
                        return null;
                    }
                    else {
                        alert("다시 시도해주세요.");
                    }
                },
                error: function (e) {
                    console.log(e);
                    errorMsg(e.status);
                }
            });
        },

        menuInformation: function (menuSeq) {
            $.ajax({
                type: 'GET',
                url: '/v2.0/menus/informations',
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
                },
                data: {
                    menuSeq: menuSeq
                },
                dataType: 'json',
                success: function (data, status, xhr) {

                    if (xhr.status == 200) {
                        menuManage.menu.setInformation(data);
                    }
                    else {
                        alert("다시 시도해주세요.");
                    }
                },
                error: function (e) {
                    console.log(e);
                    errorMsg(e.status);
                }
            });
        },

        saveMenu: function (jsonData) {
            $.ajax({
                type: 'POST',
                url: '/v2.0/save/menus',
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
                },
                contentType: 'application/json',
                data: jsonData,
                dataType: 'json',
                success: function (data, status, xhr) {

                    if (xhr.status == 200 && data == true) {
                        alert("저장하였습니다.");
                        menuManage.callAjax.search();
                    }
                    else {
                        alert("다시 시도해주세요.");
                    }
                },
                error: function (e) {
                    console.log(e);
                    errorMsg(e.status);
                }
            });
        },

        // 시스템으로 메뉴명 조회
        menuBySystem: function (systemSeq, depth) {
            var reqData = {
                systemSeq: systemSeq,
                depth: depth
            };

            $.ajax({
                       type: 'GET',
                       url: '/v2.0/systems/menus.json',
                       cache: false,
                       beforeSend : function(xhr){
                           xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
                       },
                       data: reqData,
                       dataType: 'json',
                       success: function (data, status, xhr) {

                           if ( xhr.status == 200 ) {
                               menuManage.search.setMenuName(reqData.depth, data);
                           }
                           else if ( xhr.status == 204 ) {
                               menuManage.search.clearDepth();
                           }
                           else {
                               alert("다시 시도해주세요.");
                           }
                       },
                       error: function (e) {
                           console.log(e);
                           errorMsg(e.status);
                       }
                   });
        },

        // 하위 메뉴명 조회
        subMenu: function (depth, menuSeq) {
            $.ajax({
                       type: 'GET',
                       url: '/v2.0/sub/menus',
                       cache: false,
                       beforeSend : function(xhr){
                           xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
                       },
                       data: {
                           menuSeq: menuSeq,
                           menuDepth: depth
                       },
                       dataType: 'json',
                       success: function (data, status, xhr) {

                           if ( xhr.status == 200 ) {
                               menuManage.search.setMenuName(depth, data);
                           }
                           else if( xhr.status == 204 ) {
                               menuManage.search.setMenuName(depth);
                           }
                           else {
                               alert("다시 시도해주세요.");
                           }
                       },
                       error: function (e) {
                           console.log(e);
                           errorMsg(e.status);
                       }
                   });
        },
    }
};


$(document).ready(function () {
    menuManage.init();
});
