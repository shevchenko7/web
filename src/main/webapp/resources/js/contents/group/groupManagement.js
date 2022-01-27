/**
 * 그룹관리 - 그룹권한등록/조회 페이지 스크립트
 */

var groupManage = {
    // grid
    groupGrid: null,
    onesDeptGrid: null,
    authorityGrid: null,
    // search
    systemSeq: 0,
    systemName: '',
    searchGroupName: '',
    searchIsUsed: '',
    search1depthSeq: 0,
    search2depthSeq: 0,
    search3depthSeq: 0,
    search4depthSeq: 0,
    // role
    allAuth: null,

    init: function () {
        groupManage.mainButton.init();
        groupManage.grid.groupInit();
        groupManage.grid.onesDeptInit();
        groupManage.grid.authorityInit();
        groupManage.search.init();

        groupManage.authority.init();

        groupManage.popup.init();
        groupManage.group.init();
    },

    mainButton: {
        init: function() {
            // 초기화 버튼 클릭
            $("#groupManage #groupReset").click(function () {
                groupManage.mainButton.clear();
            });

            // 등록/수정 버튼 클릭
            $("#groupManage #groupSave").click(function () {
                groupManage.group.save();
            });
        },

        clear: function () {
            $("#groupManage #groupCode").text('');
            $("#groupManage #groupName").val('');
            $("#groupManage #isUsed").val('y');

            groupManage.groupGrid.clearSelection();
            groupManage.onesDeptGrid.clearAll();
            groupManage.authorityGrid.clearAll();
            groupManage.authority.setAuthority(groupManage.allAuth);
            $("#groupManage #chkAuthority").attr('checked', false);
            $('#groupManage #chkAuthAll').attr('checked', false);
        }
    },

    /**
     * 그리드 관련
     */
    grid: {
        // 그룹 그리드 초기화
        groupInit: function () {
            groupManage.groupGrid = new dhtmlXGridObject('groupGrid');
            groupManage.groupGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
            groupManage.groupGrid.setHeader("시스템명,그룹코드,그룹명,사용여부,등록자,등록일,수정자,수정일");
            // groupManage.groupGrid.setInitWidthsP("10,10,22,10,10,14,10,14");
            groupManage.groupGrid.setInitWidths("100,100,250,100,100,150,100,150");
            groupManage.groupGrid.setColAlign("center,center,center,center,center,center,center,center");
            groupManage.groupGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro");
            groupManage.groupGrid.setStyle("text-align:center;","","");
            groupManage.groupGrid.attachEvent("onRowSelect", function(id, ind) {
                $("#onesDeptPopup #popupGroupName").text(groupManage.groupGrid.cells(id, 2).getValue());
                groupManage.callAjax.groupInformation(groupManage.groupGrid.cells(id, 1).getValue());
            });
            groupManage.groupGrid.init();
            groupManage.groupGrid.enableColSpan(true);
            groupManage.groupGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
            groupManage.groupGrid.setColspan(0, 0, 8);
        },

        onesDeptInit: function () {
            groupManage.onesDeptGrid = new dhtmlXGridObject('onesDeptGrid');
            groupManage.onesDeptGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
            // 2레벨, 3레벨, 4레벨, 5레벨, 6레벨, 부서코드, 부서레벨
            groupManage.onesDeptGrid.setHeader("레벨1,레벨2,레벨3,레벨4,레벨5,레벨6,,");
            groupManage.onesDeptGrid.setInitWidths("150,150,150,150,150,150,0,0");
            groupManage.onesDeptGrid.setColAlign("center,center,center,center,center,center,center,center");
            groupManage.onesDeptGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro");
            groupManage.onesDeptGrid.setStyle("text-align:center;","","");
            groupManage.onesDeptGrid.setColumnHidden(6, true);
            groupManage.onesDeptGrid.setColumnHidden(7, true);
            groupManage.onesDeptGrid.init();
        },

        authorityInit: function () {
            groupManage.authorityGrid = new dhtmlXGridObject('authorityGrid');
            groupManage.authorityGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
            // 메뉴명, 메뉴seq, 기능seq, 기능키, 기능설명, 개인정보, 엑셀, 체크박스영향y/n, 권한쳌박스
            groupManage.authorityGrid.setHeader("메뉴명,,,기능키,기능명,기능설명,개인정보 포함,엑셀 다운 기능,,권한부여<br/><input type='checkbox' id='chkAuthAll'/>전체");
            // groupManage.authorityGrid.setInitWidthsP("34,0,0,15,30,8,8,0,5");
            groupManage.authorityGrid.setInitWidths("310,0,0,200,200,300,150,150,0,100");
            groupManage.authorityGrid.setColAlign("left,center,center,center,center,center,center,center,center,center");
            groupManage.authorityGrid.setColTypes("tree,ro,ro,ro,ro,ro,ro,ro,ro,ch");
            groupManage.authorityGrid.setStyle("text-align:center;","","");
            groupManage.authorityGrid.setColumnHidden(8, true);
            groupManage.authorityGrid.enableTreeCellEdit(false);
            groupManage.authorityGrid.init();

            // 권한부여 전체 체크박스
            $('#groupManage #chkAuthAll').change(function() {
                if($(this).is(":checked")) {
                    groupManage.authorityGrid.forEachRow(function (id) {
                        if( groupManage.authorityGrid.cells(id, 0).getValue() == '' ) {
                            groupManage.authorityGrid.cells(id, 9).setChecked(true);
                        }
                    });
                }
                else {
                    groupManage.authorityGrid.forEachRow(function (id) {
                        if( groupManage.authorityGrid.cells(id, 0).getValue() == '' ) {
                            groupManage.authorityGrid.cells(id, 9).setChecked(false);
                        }
                    });
                }
            });
        },
    },

    /**
     * 검색 관련
     */
    search: {
        init: function () {
            // 검색버튼 클릭
            $("#groupManage #searchBtn").click(function () {
                groupManage.search.submit();
            });

            // 엔터
            $("#groupManage input[name='groupName']").live('keypress', function(e) {
                if (e.which == 13) {
                    groupManage.search.submit();
                }
            });

            // 초기화 버튼 클릭
            $("#groupManage #searchClearBtn").click(function () {
                groupManage.search.clear();
            });

            // 시스템명 셀렉트박스 변경 - 1뎁스 메뉴조회
            $("#groupManage select[name='systemSeq']").change(function () {
                var seq = $(this).val();

                if( seq == 0 ) {
                    groupManage.search.clearDepth();
                }
                else {
                    groupManage.callAjax.menuBySystem(seq, 1);
                }
            });

            // 메뉴/기능 셀렉트박스 변경 - 하위뎁스 메뉴조회
            $("#groupManage .searchMenu").change(function () {
                var seq = $(this).val();
                if( seq && $(this).attr('depth') != 4 ) {
                    groupManage.callAjax.subMenu(parseInt($(this).attr('depth')) + 1, seq);
                }
            });
        },

        submit: function () {
            if ( groupManage.search.validation() ) {
                // todo: 이거 필요없을수도있음
                groupManage.systemSeq = $("#groupManage select[name='systemSeq']").val();
                groupManage.systemName = $("#groupManage select[name='systemSeq'] option:selected").text();
                groupManage.searchGroupName = $("#groupManage input[name='groupName']").val();
                groupManage.searchIsUsed = $("#groupManage select[name='isUsed']").val();
                groupManage.search1depthSeq = $("#groupManage select[name='depth1']").val();
                groupManage.search2depthSeq = $("#groupManage select[name='depth2']").val();
                groupManage.search3depthSeq = $("#groupManage select[name='depth3']").val();
                groupManage.search4depthSeq = $("#groupManage select[name='depth4']").val();
                groupManage.callAjax.search();
            }
        },

        clear: function () {
            $("#groupManage input[name='groupName']").val('');
            $("#groupManage select[name='isUsed']").val('');
            $("#groupManage select[name='systemSeq']").val('');
            $("#groupManage select[name='systemSeq']").change();
        },

        validation: function () {
            if($("#groupManage select[name='systemSeq']").val() == '0') {
                alert('시스템명은 반드시 선택하셔야 합니다.');
                return false;
            }
            if( $("#groupManage input[name='groupName']").val() != '' && $("#groupManage input[name='groupName']").val().length < 2 ) {
                alert('두자리 이상 입력하세요.');
                return false;
            }
            return true;
        },

        clearDepth: function (depth) {
            if( depth == 'undefined' || depth == undefined || depth <= 4 ) {
                $("#groupManage select[name='depth4']").find('option').remove().end().append("<option value=''>선택</option>").val('0');
            }
            if( depth == 'undefined' || depth == undefined || depth <= 3 ) {
                $("#groupManage select[name='depth3']").find('option').remove().end().append("<option value=''>선택</option>").val('0');
            }
            if( depth == 'undefined' || depth == undefined || depth <= 2 ) {
                $("#groupManage select[name='depth2']").find('option').remove().end().append("<option value=''>선택</option>").val('0');
            }
            if( depth == 'undefined' || depth == undefined || depth == 1 ) {
                $("#groupManage select[name='depth1']").find('option').remove().end().append("<option value=''>선택</option>").val('0');
            }
        },

        setMenuName: function (depth, data) {
            groupManage.search.clearDepth(depth);

            if( data != null && data != '' && data != 'undefined' ) {
                $.each(data, function(i, value) {
                    if(depth == 4) {
                        $("#groupManage select[name='depth4']").append("<option value='" + value.roleSeq + "'>" + value.roleName +"(" +value.roleTitle + ")"+ "</option>");
                    }
                    else {
                        $("#groupManage select[name='depth" + depth + "']").append("<option value='" + value.menuSeq + "'>" + value.menuName + "</option>");
                    }
                });
            }
        }
    },

    /**
     * 그룹 관련
     */
    group: {
        limit_length: 40,

        init: function () {
            $("#groupManage #isUsed").change(function () {
                if( $(this).val() == 'n' && groupManage.onesDeptGrid.getAllRowIds() != '' ) {
                    $(this).val('y');
                    alert("그룹에 소속된 부서가 있는 경우, '미사용' 상태로 변경할 수 없습니다");
                }
            });

            // 그룹명 길이체크 이벤트
            $("#groupManage #groupName").keyup(function (e) {
                if ($("#groupManage #groupName").val().bytes() > groupManage.group.limit_length) {
                    $("#groupManage #groupName").val($("#groupManage #groupName").val().cut(groupManage.group.limit_length));
                    alert('그룹명은 최대 40byte까지 입력 가능합니다.');
                    return false;
                }
            });
        },

        // 그룹 리스트 출력
        setList : function (data) {
            groupManage.groupGrid.clearAll();
            var rid = groupManage.groupGrid.uid();
            var index = 0;

            if(data == null || data.length <= 0) {
                groupManage.groupGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
                groupManage.groupGrid.setColspan(0, 0, 8);
            }
            else {
                $.each(data, function(i, info){
                    groupManage.groupGrid.addRow(rid++, [groupManage.systemName, info.groupSeq, info.groupName, info.isUsed == 'y' ? '사용' : '미사용', info.registeUserName, info.registeDate, info.modifyUserName, info.modifyDate], ++index);
                });
            }
        },

        // 그룹 정보 셋팅
        setInformation: function (data) {
            var groupInfo = data.groupNode;

            // group information
            $("#groupManage #groupCode").text(groupInfo.groupSeq);
            $("#groupManage #groupName").val(groupInfo.groupName);
            $("#groupManage #isUsed").val(groupInfo.isUsed);

            // 소속부서
            groupManage.group.setDepartment(data.departmentList);
            groupManage.authority.setAuthority(data.authorityMenuRoleList);
        },

        setDepartment: function (data) {
            groupManage.onesDeptGrid.clearAll();

            var rid = groupManage.onesDeptGrid.uid();
            $.each(data, function(i, dept){
                var arrData = [dept.departmentName];

                if( !$.isEmptyObject(dept.childDepartment) ) arrData.push(dept.childDepartment.departmentName);
                else arrData.push('');

                if( !$.isEmptyObject(dept.childDepartment.childDepartment) ) {
                    arrData.push(dept.childDepartment.childDepartment.departmentName);

                    if( !$.isEmptyObject(dept.childDepartment.childDepartment.childDepartment) ) {
                        arrData.push(dept.childDepartment.childDepartment.childDepartment.departmentName);
                        if( !$.isEmptyObject(dept.childDepartment.childDepartment.childDepartment.childDepartment) ) {
                            arrData.push(dept.childDepartment.childDepartment.childDepartment.childDepartment.departmentName);

                            if( !$.isEmptyObject(dept.childDepartment.childDepartment.childDepartment.childDepartment.childDepartment) ) {
                                arrData.push(dept.childDepartment.childDepartment.childDepartment.childDepartment.childDepartment.departmentName);
                                arrData.push(dept.childDepartment.childDepartment.childDepartment.childDepartment.childDepartment.departmentCd);
                                arrData.push(dept.childDepartment.childDepartment.childDepartment.childDepartment.childDepartment.departmentLevel);
                            }
                            else {
                                arrData.push('');
                                arrData.push(dept.childDepartment.childDepartment.childDepartment.childDepartment.departmentCd);
                                arrData.push(dept.childDepartment.childDepartment.childDepartment.childDepartment.departmentLevel);
                            }
                        }
                        else {
                            arrData.push('','');
                            arrData.push(dept.childDepartment.childDepartment.childDepartment.departmentCd);
                            arrData.push(dept.childDepartment.childDepartment.childDepartment.departmentLevel);
                        }
                    }
                    else {
                        arrData.push('', '', '');
                        arrData.push(dept.childDepartment.childDepartment.departmentCd);
                        arrData.push(dept.childDepartment.childDepartment.departmentLevel);
                    }
                }
                else {
                    arrData.push('', '','','');
                    arrData.push(dept.childDepartment.departmentCd);
                    arrData.push(dept.childDepartment.departmentLevel);
                }

                groupManage.onesDeptGrid.addRow(rid++, arrData, i);
            });
        },

        save: function () {
            if ( groupManage.group.validation() ) {
                var data = {
                    "groupSeq" : $("#groupManage #groupCode").text(),
                    "systemSeq" : groupManage.systemSeq,
                    "groupName" : $("#groupManage #groupName").val(),
                    "isUsed" : $("#groupManage #isUsed").val(),
                    "departmentList" : [],
                    "authorityList" : []
                };
                var deptName = '';
                groupManage.onesDeptGrid.forEachRow(function (id) {
                    if(groupManage.onesDeptGrid.cells(id, 5).getValue() != '') deptName = groupManage.onesDeptGrid.cells(id, 5).getValue();
                    else if(groupManage.onesDeptGrid.cells(id, 4).getValue() != '') deptName = groupManage.onesDeptGrid.cells(id, 4).getValue();
                    else if(groupManage.onesDeptGrid.cells(id, 3).getValue() != '') deptName = groupManage.onesDeptGrid.cells(id, 3).getValue();
                    else if(groupManage.onesDeptGrid.cells(id, 2).getValue() != '') deptName = groupManage.onesDeptGrid.cells(id, 2).getValue();
                    else if(groupManage.onesDeptGrid.cells(id, 1).getValue() != '') deptName = groupManage.onesDeptGrid.cells(id, 1).getValue();
                    else deptName = groupManage.onesDeptGrid.cells(id, 0).getValue();

                    data.departmentList.push({departmentCd: groupManage.onesDeptGrid.cells(id, 6).getValue(), departmentName: deptName, departmentLevel: groupManage.onesDeptGrid.cells(id, 7).getValue() });
                });
                groupManage.authorityGrid.forEachRow(function (id) {
                    if(groupManage.authorityGrid.cells(id, 9).getValue() == true) {
                        data.authorityList.push({menuSeq: groupManage.authorityGrid.cells(id, 1).getValue(), roleSeq: groupManage.authorityGrid.cells(id, 2).getValue()});
                    }
                });
                groupManage.callAjax.saveGroup(data);
            }
        },

        validation : function () {
            if($("#groupManage #systemName").text() == '') {
                alert('시스템이 선택되지 않았습니다.');
                return false;
            }
            else if($("#groupManage #groupName").val() == '') {
                alert('그룹명을 입력해주세요.');
                return false;
            }

            // 그룹명 중복 체크
            var hasGroupName = false;
            groupManage.groupGrid.forEachRow(function (id) {
                if(groupManage.groupGrid.cells(id, 3).getValue() == '사용') {
                    if( groupManage.groupGrid.cells(id, 2).getValue() == $("#groupManage #groupName").val() && groupManage.groupGrid.cells(id, 1).getValue() != $("#groupManage #groupCode").text() ) {
                        hasGroupName = true;
                        return;
                    }
                }
            });
            if(hasGroupName == true) {
                alert("이미 등록된 그룹명입니다.");
                return false;
            }

            return true;
        }
    },

    /**
     * 권한 관련
     */
    authority: {
        init: function () {
            // 권한 부여된 메뉴만 보기 체크박스
            $('#groupManage #chkAuthority').change(function() {
                if($(this).is(":checked")) {
                    groupManage.authority.showOnlyGrant();
                }
                else {
                    groupManage.authority.showAll();
                }
            });
        },

        showOnlyGrant: function () {
            var parentId;
            groupManage.authorityGrid.forEachRow(function(id) {

                if( groupManage.authorityGrid.getSubItems(id) == '' && groupManage.authorityGrid.cells(id, 3).getValue() != '' ) {
                    // 기능일 경우만
                    if(groupManage.authorityGrid.cells(id, 9).getValue() == true) {
                        groupManage.authorityGrid.cells(id, 8).setValue('y');
                        // 3depth
                        parentId = groupManage.authorityGrid.getParentId(id);
                        groupManage.authorityGrid.cells(parentId, 8).setValue('y');
                        // 2depth
                        parentId = groupManage.authorityGrid.getParentId(parentId);
                        groupManage.authorityGrid.cells(parentId, 8).setValue('y');
                        // 1depth
                        parentId = groupManage.authorityGrid.getParentId(parentId);
                        groupManage.authorityGrid.cells(parentId, 8).setValue('y');
                    }
                    else {
                        groupManage.authorityGrid.cells(id, 8).setValue('n');
                        // 3depth
                        parentId = groupManage.authorityGrid.getParentId(id);
                        groupManage.authorityGrid.cells(parentId, 8).setValue('n');
                        // 2depth
                        parentId = groupManage.authorityGrid.getParentId(parentId);
                        groupManage.authorityGrid.cells(parentId, 8).setValue('n');
                        // 1depth
                        parentId = groupManage.authorityGrid.getParentId(parentId);
                        groupManage.authorityGrid.cells(parentId, 8).setValue('n');
                    }
                }
            });

            groupManage.authorityGrid.forEachRow(function(id) {
                if( groupManage.authorityGrid.cells(id, 8).getValue() == 'n') {
                    groupManage.authorityGrid.setRowHidden(id, true);
                }
            });
        },

        showAll: function () {
            groupManage.authorityGrid.forEachRow(function(id) {
                groupManage.authorityGrid.cells(id, 8).setValue('');
                groupManage.authorityGrid.setRowHidden(id, false);
            });
        },

        // 권한 전체 출력
        setAuthority: function (data) {
            if($.isEmptyObject(data)) return false;

            groupManage.authorityGrid.clearAll();
            var rid = groupManage.authorityGrid.uid();

            // 1depth 메뉴 출력
            $.each(data, function(i, menu1) {
                groupManage.authorityGrid.addRow(rid, [menu1.menuName, menu1.menuSeq, "", "", "", "", '-', '-','n'], i, 0, "blank.gif");

                // 2depth 메뉴 있을경우
                if ( !$.isEmptyObject(menu1.subMenus) ) {
                    var _1depthId = rid;

                    // 2depth 메뉴 출력
                    $.each(menu1.subMenus, function(j, menu2){
                        groupManage.authorityGrid.addRow(++rid, [menu2.menuName, menu2.menuSeq, "", "", "", "",'-', '-','n'], j, _1depthId, "blank.gif");

                        // 3depth 메뉴 있을경우
                        if ( !$.isEmptyObject(menu2.subMenus) ) {
                            var _2depthId = rid;

                            // 3depth 메뉴 출력
                            $.each(menu2.subMenus, function(k, menu3){
                                groupManage.authorityGrid.addRow(++rid, [menu3.menuName, menu3.menuSeq, "", "", "", "", menu3.isPersonal == 'y' ? '포함' : '미포함', menu3.isExcel == 'y' ? '포함' : '미포함','n'], k, _2depthId, "blank.gif");

                                // 메뉴기능 있을경우
                                if ( !$.isEmptyObject(menu3.subRoles) ) {
                                    var _3depthId = rid;

                                    // 메뉴기능 출력
                                    $.each(menu3.subRoles, function(v, role){
                                        groupManage.authorityGrid.addRow(++rid, ["", role.menuSeq, role.roleSeq, role.roleName, role.roleTitle, role.roleDescription, role.isPersonal == 'y' ? '포함' : '미포함', role.isExcel == 'y' ? '포함' : '미포함', role.isAuthority, role.isAuthority == 'y' ? true : false], v, _3depthId, "blank.gif");
                                    });
                                }
                            });
                        }
                    });
                }
                rid++;
            });
            // 트리 확장해서 보여줌
            groupManage.authorityGrid.expandAll();

            if($('#groupManage #chkAuthority').is(":checked")) {
                groupManage.authority.showOnlyGrant();
            }
        },
    },

    /**
     * 팝업 관련
     */
    popup: {
        leftGrid: null,
        rightGrid: null,
        rightGridLastId: null,
        init: function () {
            $('#popupRightCh').attr('checked', false);
        },

        selfSelectRow: false,
        possibleEvent: true,
        openPopup: function () {
            if($("#groupManage #systemName").text() == '') {
               alert("검색을 해주세요.");
                return false;
            }

            $("#onesDeptPopup #popupSystemName").text(groupManage.systemName);
            $("#dimmed").append($("#onesDeptPopupWrap").show().html());

            groupManage.popup.leftGrid = new dhtmlXGridObject('leftGrid');
            groupManage.popup.leftGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
            // 메뉴명, 부서코드, 부서나열텍스트, 레벨
            groupManage.popup.leftGrid.setHeader("메뉴명,,,");
            groupManage.popup.leftGrid.setInitWidthsP("99,0,0,0");
            groupManage.popup.leftGrid.setNoHeader(true);
            groupManage.popup.leftGrid.setColAlign("left,left,left,left");
            groupManage.popup.leftGrid.setColTypes("tree,ro,ro,ro");
            groupManage.popup.leftGrid.setColumnHidden(1, true);
            groupManage.popup.leftGrid.setColumnHidden(2, true);
            groupManage.popup.leftGrid.setColumnHidden(3, true);
            groupManage.popup.leftGrid.enableMultiselect(true);
            groupManage.popup.leftGrid.setEditable(false);
            groupManage.popup.leftGrid.init();

            groupManage.popup.rightGrid = new dhtmlXGridObject('rightGrid');
            groupManage.popup.rightGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
            // 체크박스, 부서나열텍스트, 부서코드, 레벨
            groupManage.popup.rightGrid.setHeader("<input type='checkbox' id='popupRightCh'/>,선택한 부서,,");
            groupManage.popup.rightGrid.setInitWidthsP("10,89,0,0");
            groupManage.popup.rightGrid.setColAlign("center,left,left,left");
            groupManage.popup.rightGrid.setColTypes("ch,ro,ro,ro");
            groupManage.popup.rightGrid.setStyle("text-align:center;","","");
            groupManage.popup.rightGrid.setColumnHidden(2, true);
            groupManage.popup.rightGrid.setColumnHidden(3, true);
            groupManage.popup.rightGrid.init();

            // 추가 버튼
            $("#onesDeptPopup #popupAdd").click(function () {
                groupManage.popup.moveRight();
            });
            // 제거 버튼
            $("#onesDeptPopup #popupDel").click(function () {
                groupManage.popup.moveLeft();
            });
            // 저장버튼
            $("#onesDeptPopup #popupOk").click(function () {
                var deptCodeList = groupManage.popup.rightGrid.collectValues(2);
                if(deptCodeList.length > 0) {
                    groupManage.callAjax.duplicateDept(deptCodeList);
                }
                else {
                    // $("#dimmed #onesDeptPopup").hide();
                    closeLayer("onesDeptPopupWrap");
                    $("#dimmed").empty();
                    groupManage.onesDeptGrid.clearAll();
                }
            });
            // 취소버튼
            $("#onesDeptPopup #popupCancel").click(function () {

                // $("#dimmed #onesDeptPopup").hide();
                closeLayer("onesDeptPopupWrap");
                $("#dimmed").empty();
            });

            // 선택한부서 전체 체크박스
            $('#popupRightCh').change(function() {
                if($(this).is(":checked")) {
                    groupManage.popup.rightGrid.checkAll(true);
                }
                else {
                    groupManage.popup.rightGrid.checkAll(false);
                }
            });

            // 메인화면의 소속부서 가져오기
            var txt = '';
            var rid = groupManage.popup.rightGrid.uid();
            var index = 0;
            groupManage.onesDeptGrid.forEachRow(function (id) {
                txt = groupManage.onesDeptGrid.cells(id, 0).getValue() + ' | ' + groupManage.onesDeptGrid.cells(id, 1).getValue();
                if(groupManage.onesDeptGrid.cells(id, 2).getValue() != '') txt += ' | ' + groupManage.onesDeptGrid.cells(id, 2).getValue();
                if(groupManage.onesDeptGrid.cells(id, 3).getValue() != '') txt += ' | ' + groupManage.onesDeptGrid.cells(id, 3).getValue();
                if(groupManage.onesDeptGrid.cells(id, 4).getValue() != '') txt += ' | ' + groupManage.onesDeptGrid.cells(id, 4).getValue();
                if(groupManage.onesDeptGrid.cells(id, 5).getValue() != '') txt += ' | ' + groupManage.onesDeptGrid.cells(id, 5).getValue();
                groupManage.popup.rightGrid.addRow(rid++, [false, txt, groupManage.onesDeptGrid.cells(id, 6).getValue(), groupManage.onesDeptGrid.cells(id, 7).getValue()], index++);
            });

            //rid 마지막 값을 저장 함(소속부서 그리드로 추가시 사용)
            groupManage.popup.rightGrid.rightGridLastId = rid;
            groupManage.callAjax.deptartmentList();
            openLayer('onesDeptPopupWrap');
        },

        setDeptList: function (deptList) {
            var txt = '';
            var rid = groupManage.popup.leftGrid.uid();

            $.each(deptList, function(i, dept1) {
                txt = dept1.departmentName;
                groupManage.popup.leftGrid.addRow(rid, [dept1.departmentName, dept1.departmentCd, txt, dept1.departmentLevel], i, 0, "blank.gif");

                // 2depth 있을경우
                if ( !$.isEmptyObject(dept1.childDepartmentGroup) ) {
                    var _1depthId = rid;

                    // 2depth  출력
                    $.each(dept1.childDepartmentGroup, function(j, dept2) {
                        txt = dept1.departmentName + ' | ' + dept2.departmentName;
                        groupManage.popup.leftGrid.addRow(++rid, [dept2.departmentName, dept2.departmentCd, txt, dept2.departmentLevel], j, _1depthId, "blank.gif");

                        // 3depth 있을경우
                        if ( !$.isEmptyObject(dept2.childDepartmentGroup) ) {
                            var _2depthId = rid;

                            // 3depth 출력
                            $.each(dept2.childDepartmentGroup, function(k, dept3) {
                                txt = dept1.departmentName + ' | ' + dept2.departmentName + ' | ' + dept3.departmentName;
                                groupManage.popup.leftGrid.addRow(++rid, [dept3.departmentName, dept3.departmentCd, txt, dept3.departmentLevel], k, _2depthId, "blank.gif");

                                // 4depth 있을경우
                                if ( !$.isEmptyObject(dept3.childDepartmentGroup) ) {
                                    var _3depthId = rid;

                                    // 4depth 출력
                                    $.each(dept3.childDepartmentGroup, function(v, dept4) {
                                        txt = dept1.departmentName + ' | ' + dept2.departmentName + ' | ' + dept3.departmentName + ' | ' + dept4.departmentName;
                                        groupManage.popup.leftGrid.addRow(++rid, [dept4.departmentName, dept4.departmentCd, txt, dept4.departmentLevel], v, _3depthId, "blank.gif");

                                        // 5depth 있을경우
                                        if ( !$.isEmptyObject(dept4.childDepartmentGroup) ) {
                                            var _4depthId = rid;

                                            // 4depth 출력
                                            $.each(dept4.childDepartmentGroup, function(v, dept5) {
                                                txt = dept1.departmentName + ' | ' + dept2.departmentName + ' | ' + dept3.departmentName + ' | ' + dept4.departmentName + ' | ' + dept5.departmentName;
                                                groupManage.popup.leftGrid.addRow(++rid, [dept5.departmentName, dept5.departmentCd, txt, dept5.departmentLevel], v, _4depthId, "blank.gif");

                                                // 6depth 있을경우
                                                if ( !$.isEmptyObject(dept5.childDepartmentGroup) ) {
                                                    var _5depthId = rid;

                                                    // 5depth 출력
                                                    $.each(dept5.childDepartmentGroup, function(v, dept6) {
                                                        txt = dept1.departmentName + ' | ' + dept2.departmentName + ' | ' + dept3.departmentName + ' | ' + dept4.departmentName + ' | ' + dept5.departmentName + ' | ' + dept6.departmentName;
                                                        groupManage.popup.leftGrid.addRow(++rid, [dept6.departmentName, dept6.departmentCd, txt, dept6.departmentLevel], v, _5depthId, "blank.gif");
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                rid++;
            });
        },

        moveRight: function () {
            $('#popupRightCh').attr('checked', false);

            var ids = groupManage.popup.leftGrid.getSelectedRowId();
            if(ids == null) {
                alert('부서 추가는 최하위 레벨의 부서만 가능합니다.');
                return;
            }

            var arrayIds = ids.split(',');
            var index = groupManage.popup.rightGrid.getRowsNum();
            var isDup;
            var onesAlert = true;

            $.each(arrayIds, function(i, id) {
                isDup = false;

                if(groupManage.popup.leftGrid.getSubItems(id) == '') {
                    groupManage.popup.rightGrid.forEachRow(function (rightId) {
                        if( groupManage.popup.rightGrid.cells(rightId, 2).getValue() == groupManage.popup.leftGrid.cells(id, 1).getValue() ) {
                            isDup = true;
                            return;
                        }
                    });

                    if(isDup == false) {
                        groupManage.popup.rightGrid.addRow(id, [false, groupManage.popup.leftGrid.cells(id, 2).getValue(), groupManage.popup.leftGrid.cells(id, 1).getValue(), groupManage.popup.leftGrid.cells(id, 3).getValue()], index++);
                    }
                }
                else if(onesAlert == true) {
                    alert('부서 추가는 최하위 레벨의 부서만 가능합니다.');
                    onesAlert = false;
                }
            });
        },
        
        moveLeft: function () {
            $('#popupRightCh').attr('checked', false);

            var ids = groupManage.popup.rightGrid.getCheckedRows(0).split(',');
            $.each(ids, function(i, id) {
                groupManage.popup.rightGrid.deleteRow(id);
            });
        }
    },

    /**
     * 서버 호출 관련
     */
    callAjax: {
        // 검색
        search: function () {
            groupManage.mainButton.clear();
            $("#groupManage #systemName").text(groupManage.systemName);

            var data = {
                systemSeq: groupManage.systemSeq,
                groupName: groupManage.searchGroupName,
                isUsed: groupManage.searchIsUsed,
                menuDepth1Seq: groupManage.search1depthSeq,
                menuDepth2Seq: groupManage.search2depthSeq,
                menuDepth3Seq: groupManage.search3depthSeq,
                menuDepth4Seq: groupManage.search4depthSeq
            };

            $.ajax({
                type: 'GET',
                url: '/v2.0/search/groups',
                cache: false,
                beforeSend : function(xhr){
                    xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
                },
                data: {
                    data: JSON.stringify(data)
                },
                dataType: 'json',
                success: function (data, status, xhr) {

                    if ( xhr.status == 200 ) {
                        if(data.length <= 0) {
                            alert("다시 시도해주세요.");
                        }

                        groupManage.group.setList(data.groupNodeList);
                        groupManage.authority.setAuthority(data.menuRoleList);
                        groupManage.allAuth = data.menuRoleList;
                    }
                    else if ( xhr.status == 204 ) {
                        groupManage.groupGrid.clearAll();
                        groupManage.groupGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
                        groupManage.groupGrid.setColspan(0, 0, 8);
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
                        groupManage.search.setMenuName(reqData.depth, data);
                    }
                    else if ( xhr.status == 204 ) {
                        groupManage.search.clearDepth();
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
                        groupManage.search.setMenuName(depth, data);
                    }
                    else if( xhr.status == 204 ) {
                        groupManage.search.setMenuName(depth);
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

        // 그룹 정보 조회
        groupInformation: function (groupSeq) {
            $.ajax({
                type: 'GET',
                url: '/v2.0/groups/informations',
                cache: false,
                beforeSend : function(xhr){
                    xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
                },
                data: {
                    systemSeq: groupManage.systemSeq,
                    groupSeq: groupSeq
                },
                dataType: 'json',
                success: function (data, status, xhr) {

                    if ( xhr.status == 200 ) {
                        if(data.length <= 0) {
                            alert("다시 시도해주세요.");
                        }

                        groupManage.group.setInformation(data);
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

        saveGroup: function (req) {
            var jsonData = JSON.stringify(req);

            $.ajax({
                type: 'POST',
                url: '/v2.0/save/groups',
                cache: false,
                beforeSend : function(xhr){
                    xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
                },
                contentType: 'application/json',
                data: jsonData,
                dataType: 'json',
                success: function (data, status, xhr) {

                    if ( xhr.status == 200 && data == true ) {
                        alert("저장하였습니다.");
                        groupManage.callAjax.search();
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

        deptartmentList: function () {
            $.ajax({
                type: 'GET',
                url: '/v2.0/departments',
                cache: false,
                beforeSend : function(xhr){
                    xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
                },
                contentType: 'application/json',
                dataType: 'json',
                success: function (data, status, xhr) {

                    if ( xhr.status == 200 ) {
                        groupManage.popup.setDeptList(data);
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

        duplicateDept: function (deptCd) {
            $.ajax({
                type: 'GET',
                url: '/v2.0/duplicate/departments',
                cache: false,
                beforeSend : function(xhr){
                    xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
                },
                data: {
                    groupSeq: $("#groupManage #groupCode").text(),
                    departmentCd: deptCd.toString(),
                    systemSeq: groupManage.systemSeq
                },
                contentType: 'application/json',
                dataType: 'json',
                success: function (data, status, xhr) {
                    // if ( xhr.status == 200 || xhr.status == 204 ) {
                        // if( data[0] == null || data[0] == "") {

                        if(xhr.status == 204) {
                            // onesdept그리드 업데이트
                            var rid = groupManage.onesDeptGrid.uid();
                            var deptList;
                            var i = 0;
                            groupManage.onesDeptGrid.clearAll();
                            groupManage.popup.rightGrid.forEachRow(function (id) {
                                deptList = groupManage.popup.rightGrid.cells(id, 1).getValue().split(' | ');

                                groupManage.onesDeptGrid.addRow(rid++, [defaultEmptyString(deptList[0]), defaultEmptyString(deptList[1]), defaultEmptyString(deptList[2]),
                                                                        defaultEmptyString(deptList[3]), defaultEmptyString(deptList[4]), defaultEmptyString(deptList[5]), groupManage.popup.rightGrid.cells(id, 2).getValue(), groupManage.popup.rightGrid.cells(id, 3).getValue()], i++);
                            });

                            closeLayer("onesDeptPopupWrap");
                            $("#dimmed").empty();
                        }
                        else if(xhr.status == 200) {
                            var msg = '';
                            $.each(data, function(i, v) {
                                msg += v.departmentName + "은 " + v.groupName + "에 이미 소속되어 있어 중복 등록할 수 없습니다.\n";
                            });
                            alert(msg);
                        }
                    // }
                    else {
                        alert("다시 시도해주세요.");
                    }
                },
                error: function (e) {
                    console.log(e);
                    errorMsg(e.status);
                }
            });
        }
    }

};

/**
 * Util: 입력 값이 null일 경우 빈 문자열("")을 리턴하고, 아닐경우 입력 값을 리턴합니다.
 *
 * @param value
 * @return "" 또는 value를 리턴합니다.
 */
var defaultEmptyString = function (value) {
    if (value == "" || value == null || value == undefined ||
        ( value != null && typeof value == "object" && !Object.keys(value).length )) {
        return "";
    } else {
        return value;
    }
};

$(document).ready(function () {
    groupManage.init();
});