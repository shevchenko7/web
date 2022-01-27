/**
 * role 관리화면 관련 JS
 *
 * @author Jeonyeochul
 */

var roleManage = {
    // grid
    roleGrid: null,
    allApis: null,
    inMappedApiGrid: null,
    inUnMappedApiGrid: null,
    //init
    init: function () {
        roleManage.grid.roleInit();
        roleManage.grid.apiInit();

        roleManage.search.init();
        roleManage.button.init();
    },

    /**
     * 버튼 관련
     */
    button: {
        init: function () {
            // 초기화 버튼 클릭
            $("#roleManage #roleReset").click(function () {
                roleManage.button.clear();
            });

            // 등록/수정 버튼 클릭
            $("#roleManage #roleSave").click(function () {
                roleManage.role.save();
            });
        },
        clear: function () {

            $("#roleManage #roleCode").text('');
            $("#roleManage #roleName").val('');
            $("#roleManage #roleTitle").val('');
            $("#roleManage #roleDesc").val('');
            $("#roleManage #isPersonal").val('n');
            $("#roleManage #isExcel").val('n');

            $("#roleManage #isUsed").val('y');

            //그리드 초기화
            roleManage.inMappedApiGrid.clearAll();
            roleManage.inUnMappedApiGrid.clearAll();

            roleManage.role.setApiList(roleManage.allApis);
        }
    },

    /**
     * 그리드 관련
     */
    grid: {

        // 기능 그리드 초기화
        roleInit: function () {
            // 사용여부 : index 5는 사용여부
            // 등록자, 등록일 : index 6,7는 기능등록일, index 8,9는 매핑등록일
            // 설정 : index 10 제거버튼, index 11 추가버튼
            // workable role
            roleManage.roleGrid = new dhtmlXGridObject('roleGrid');
            roleManage.roleGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
            roleManage.roleGrid.setHeader("시스템명,고유번호,기능키,기능명,기능설명,개인정보 포함,엑셀다운 가능,사용여부,등록자,등록일,개인정보,엑셀다운,사용여부코드,등록자사번");
            //roleManage.roleGrid.attachHeader("&nbsp;,#text_filter,#text_filter,&nbsp;");
            roleManage.roleGrid.setInitWidths("100,75,150,150,400,100,100,100,80,140,0,0,0,0");
            roleManage.roleGrid.setColAlign("center,center,center,center,left,center,center,center,center,center,center,center,center,center");
            roleManage.roleGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
            roleManage.roleGrid.setStyle("text-align:center;", "", "");
            roleManage.roleGrid.attachEvent("onRowSelect", function (id, ind) {
                roleManage.role.setRoleDetail(id);
            });

            roleManage.roleGrid.enableSmartRendering(true);
            roleManage.roleGrid.setColumnHidden(10, true);
            roleManage.roleGrid.setColumnHidden(11, true);
            roleManage.roleGrid.setColumnHidden(12, true);
            roleManage.roleGrid.setColumnHidden(13, true);
            roleManage.roleGrid.init();
            roleManage.roleGrid.enableColSpan(true);
            roleManage.roleGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
            roleManage.roleGrid.setColspan(0, 0, 13);

        },
        //api 그리드 초기화
        apiInit: function () {
            //롤과 맵핑된 api 그리드
            roleManage.inMappedApiGrid = new dhtmlXGridObject("inMappedApiGrid");
            roleManage.inMappedApiGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
            roleManage.inMappedApiGrid.setHeader("Api 고유번호,서버정보,Api 명,Api 설명,Api 메소드,Api URI,등록자,등록일,설정,맵핑고유번호");
            roleManage.inMappedApiGrid.setInitWidths("80,120,280,300,80,400,80,150,80,0");

            roleManage.inMappedApiGrid.setColAlign("center,center,left,left,center,left,center,center,center,center");
            roleManage.inMappedApiGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
            roleManage.inMappedApiGrid.setStyle("text-align:center;", "", "");
            roleManage.inMappedApiGrid.enableSmartRendering(true);
            roleManage.inMappedApiGrid.setColumnHidden(9, true);
            roleManage.inMappedApiGrid.init();
            roleManage.inMappedApiGrid.enableColSpan(true);
            roleManage.inMappedApiGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
            roleManage.inMappedApiGrid.setColspan(0, 0, 9);

            //맵핑되지 않은 api 그리드
            roleManage.inUnMappedApiGrid = new dhtmlXGridObject("inUnMappedApiGrid");
            roleManage.inUnMappedApiGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
            roleManage.inUnMappedApiGrid.setHeader("Api 고유번호,서버정보,Api 명,Api 설명,Api 메소드,Api URI,등록자,등록일,설정,맵핑고유번호");
            roleManage.inUnMappedApiGrid.setInitWidths("80,120,280,300,80,400,80,150,80,0");
            roleManage.inUnMappedApiGrid.attachHeader("&nbsp;,#text_filter,#text_filter,&nbsp;");
            roleManage.inUnMappedApiGrid.setColAlign("center,center,left,left,center,left,center,center,center,center");
            roleManage.inUnMappedApiGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
            roleManage.inUnMappedApiGrid.setStyle("text-align:center;", "", "");
            roleManage.inUnMappedApiGrid.enableSmartRendering(true);
            roleManage.inUnMappedApiGrid.setColumnHidden(9, true);
            roleManage.inUnMappedApiGrid.init();
            roleManage.inUnMappedApiGrid.enableColSpan(true);
            roleManage.inUnMappedApiGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
            roleManage.inUnMappedApiGrid.setColspan(0, 0, 9);


        },
        //롤과 맵핑된 api 삭제
        deleteApi: function (id) {
            //버튼 변경
            GridSetValueByRowId(roleManage.inMappedApiGrid, '설정', id, '<button class="ui button font-malgun small deleteRole" onclick="javascript:roleManage.grid.addApi(' + id + ');">추가</button>');
            //이동
            roleManage.inMappedApiGrid.moveRow(id, "row_sibling", null, roleManage.inUnMappedApiGrid);
        },
        //롤과 맵핑할 api 등록
        addApi: function (id) {
            //버튼변경
            GridSetValueByRowId(roleManage.inUnMappedApiGrid, '설정', id, '<button class="ui button font-malgun small deleteRole" onclick="javascript:roleManage.grid.deleteApi(' + id + ');">제거</button>');
            //이동
            roleManage.inUnMappedApiGrid.moveRow(id, "row_sibling", null, roleManage.inMappedApiGrid);
        }
    },

    /**
     * 검색 관련
     */
    search: {
        init: function () {
            // 검색버튼 클릭
            $("#roleManage #searchBtn").click(function () {
                //서버 선택여부 유효성 체크
                if ($('#roleManage select[name="systemSeq"]').val() == '0') {
                    alert("시스템을 선택해주세요.");
                    return false;
                } else {
                    roleManage.button.clear();
                    roleManage.callAjax.search();
                }
            });
        }
    },
     /**
     * 기능 관련
     */
    role: {
        // 기능 리스트 조회목록 세팅
        setRoleList: function (data) {
            roleManage.roleGrid.clearAll();

            // roleManage.roleGrid.getFilterElement(1).value = '';
            // roleManage.roleGrid.getFilterElement(2).value = '';
            var rid = roleManage.roleGrid.uid();

            //롤 조회 그리드
            if (data != undefined && data.length > 0) {
                $.each(data, function (i, role) {
                    roleManage.roleGrid.addRow(rid,
                                               [role.systemName, role.roleSeq, role.roleName, role.roleTitle, role.roleDescription,
                                                role.isPersonal == 'y' ? '포함' : '미포함',
                                                role.isExcel == 'y' ? '포함' : '미포함',
                                                role.isUsed == 'y' ? '사용' : '미사용',
                                                role.registeUserName, role.registeDate,
                                                role.isPersonal, role.isExcel, role.isUsed,
                                                role.registeUserCd], i);
                    rid++;
                });
            }




        },
         //api목록 그리드
        setApiList: function (data) {
            roleManage.inUnMappedApiGrid.clearAll();

            var rid = roleManage.inUnMappedApiGrid.uid();
            //맵핑되지 않은 api
            if (data != undefined && data.length > 0) {
                $.each(data, function (i, apis) {
                    roleManage.inUnMappedApiGrid.addRow(rid,
                                                        [apis.apiSeq, apis.systemName, apis.apiName,
                                                         apis.apiDescription, apis.apiMethod,
                                                         apis.apiUri, apis.registeUserName, apis.registeDate,
                                                         '<button class="ui button font-malgun small deleteRole"'
                                                         + ' onclick="javascript:roleManage.grid.addApi(' + rid + ');">추가</button>',
                                                         apis.roleApiMapSeq], i);
                    rid++;
                });
            }
        },
        // 기능 상세내용 세팅
        setRoleDetail: function(id){
            //선택한 row 정보 가져오기
            var roleSeq = GridGetValueByRowId(roleManage.roleGrid, '고유번호', id);
            var roleName = GridGetValueByRowId(roleManage.roleGrid, '기능키', id);
            var roleTitle = GridGetValueByRowId(roleManage.roleGrid, '기능명', id);
            var roleDescription = GridGetValueByRowId(roleManage.roleGrid, '기능설명', id);
            var isPersonal = GridGetValueByRowId(roleManage.roleGrid, '개인정보', id);
            var isExcel = GridGetValueByRowId(roleManage.roleGrid, '엑셀다운', id);
            var isUsed = GridGetValueByRowId(roleManage.roleGrid, '사용여부코드', id);

            // 값 세팅
            $('#roleCode').text(roleSeq);
            $('#roleName').val(roleName);
            $('#roleTitle').val(roleTitle);
            $('#roleDesc').val(roleDescription);
            $('#isPersonal').val(isEmpty(isPersonal) ? 'n' : isPersonal);
            $('#isExcel').val(isEmpty(isExcel) ? 'n' : isExcel);
            $('#isUsed').val(isUsed);

            //롤과 맵핑된 api 조회
            var systemSeq = $('#roleManage select[name="systemSeq"]').val()
            roleManage.callAjax.mappedApis(systemSeq, roleSeq);
        },
         // 기능 리스트 조회목록 세팅
         setMappedApiList: function (data) {
             //그리드 초기화
             roleManage.inMappedApiGrid.clearAll();
             roleManage.inUnMappedApiGrid.clearAll();
             roleManage.inUnMappedApiGrid.getFilterElement(1).value = '';
             roleManage.inUnMappedApiGrid.getFilterElement(2).value = '';
             var rid = roleManage.inMappedApiGrid.uid();

             //맵핑된 api
             if (data.mappedApis != undefined && data.mappedApis.length > 0) {
                 $.each(data.mappedApis, function (i, apis) {
                     roleManage.inMappedApiGrid.addRow(rid,
                                                       [apis.apiSeq, apis.systemName, apis.apiName,
                                                 apis.apiDescription, apis.apiMethod,
                                                 apis.apiUri, apis.registeUserName, apis.registeDate,
                                                 '<button class="ui button font-malgun small deleteRole"'
                                                 + ' onclick="javascript:roleManage.grid.deleteApi(' + rid + ');">제거</button>',
                                                 apis.roleApiMapSeq], i);
                     rid++;
                 });
             }

             rid = roleManage.inUnMappedApiGrid.uid();
             //맵핑되지 않은 api
             if (data.unMappedApis != undefined && data.unMappedApis.length > 0) {
                 $.each(data.unMappedApis, function (i, apis) {
                     roleManage.inUnMappedApiGrid.addRow(rid,
                                                       [apis.apiSeq, apis.systemName, apis.apiName,
                                                 apis.apiDescription, apis.apiMethod,
                                                 apis.apiUri, apis.registeUserName, apis.registeDate,
                                                 '<button class="ui button font-malgun small deleteRole"'
                                                 + ' onclick="javascript:roleManage.grid.addApi(' + rid + ');">추가</button>',
                                                 apis.roleApiMapSeq], i);
                     rid++;
                 });
             }


         },
        // 기능 저장
        save: function () {
            //유효성 체크
            if(roleManage.role.validation()) {

                //data set
                var data = {
                    "systemSeq": $('#roleManage select[name="systemSeq"]').val(),
                    "roleSeq": $('#roleCode').text(),
                    "roleName": $('#roleName').val(),
                    "roleTitle": $('#roleTitle').val(),
                    "roleDescription": $('#roleDesc').val(),
                    "isPersonal": $('#isPersonal').val(),
                    "isExcel": $('#isExcel').val(),
                    "isUsed": $('#roleManage select[name="isUsed"]').val(),
                    "inMappedApis":[]
                };

                roleManage.inMappedApiGrid.forEachRow(function (id) {
                    data.inMappedApis.push({apiSeq: roleManage.inMappedApiGrid.cells(id, 0).getValue()});
                });

                //ajax 호출
                roleManage.callAjax.saveRole(JSON.stringify(data));
            }
        },
        //유효성 체크
         validation: function () {
             if ($("#roleManage select[name='systemSeq']").val() == '0') {
                 alert('시스템명은 반드시 선택하셔야 합니다.');
                 return false;
             } else if ($('#roleName').val() == '') {
                 alert("기능키를 입력해주세요.");
                 return false;
             } else if ($('#roleTitle').val() == '') {
                 alert("기능명을 입력해주세요.");
                 return false;
             } else if ($('#roleDesc').val() == '') {
                 alert("기능설명을 입력해주세요.");
                 return false;
             }
             return true;
         }
    },

    /**
     * 서버 호출 관련
     */
    callAjax: {
        // 기능 조회
        search: function () {
            $.ajax({
                type: 'GET',
                url: '/v2.0/roles.json',
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
                },
                data: {
                    "systemSeq": $('#roleManage select[name="systemSeq"]').val(),
                    "searchIsUsed": $('#roleManage select[name="searchIsUsed"]').val()
                },
                dataType: 'json',
                success: function (data, status, xhr) {
                    if (xhr.status == 200) {
                        roleManage.role.setRoleList(data.roleList);
                        roleManage.role.setApiList(data.apiList);
                        roleManage.allApis = data.apiList;
                    }
                    else if (xhr.status == 204) {
                        roleManage.roleGrid.clearAll();
                        roleManage.roleGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
                        roleManage.roleGrid.setColspan(0, 0, 11);
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
        // 롤과 맵핑 된 api목록 조회
        mappedApis: function (systemSeq, roleSeq) {
            $.ajax({
                       type: 'GET',
                       url: '/v2.0/roles/mapping/apis.json',
                       cache: false,
                       beforeSend: function (xhr) {
                           xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
                       },
                       data: {
                           systemSeq: systemSeq,
                           roleSeq: roleSeq
                       },
                       dataType: 'json',
                       success: function (data, status, xhr) {
                           if (xhr.status == 200) {
                               roleManage.role.setMappedApiList(data);
                           }
                           else if (xhr.status == 204) {
                               roleManage.inMappedApiGrid.clearAll();
                               roleManage.inMappedApiGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
                               roleManage.inMappedApiGrid.setColspan(0, 0, 10);
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

        // 기능 저장
        saveRole: function (jsonData) {
            $.ajax({
                type: 'POST',
                url: '/v2.0/save/roles.json',
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
                        roleManage.callAjax.search();
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
        }
    }
};

/**
 * dhtmlx 그리드 관련 function
 */
function GridGetValueByRowId(_gridObj, _colName, _rowID) {

    var colNum = GridGetColNumByColName(_gridObj, _colName);
    return _gridObj.cells(_rowID, colNum).getValue();
}

function GridGetColNumByColName(_gridObj, _colName) {

    var _gridColNum = _gridObj.getColumnsNum();

    for (var _col = 0; _col < _gridColNum; _col++) {
        if (_colName == _gridObj.getColLabel(_col)) {
            return _col;
        }
    }
    return -1;// 못찾은 경우
}

function GridSetValueByRowId( _gridObj, _colName, _rowID, _value ) {

    var colNum = GridGetColNumByColName( _gridObj, _colName);
    //var rowID= _gridObj.getRowId(_rowNum);

    return _gridObj.cells(_rowID, colNum).setValue(_value);
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
    roleManage.init();
});
