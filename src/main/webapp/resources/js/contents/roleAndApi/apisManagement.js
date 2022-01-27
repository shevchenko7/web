/**
 * api 관리화면 관련 JS
 *
 * @author Jeonyeochul
 */

var apiManage = {
    // grid
    apiGrid: null,
    systemSeq: 0,
    init: function () {
        apiManage.grid.apiInit();

        apiManage.search.init();
        apiManage.button.init();
    },

    /**
     * 버튼 관련
     */
    button: {
        init: function () {
            // 초기화 버튼 클릭
            $("#apiManage #apiReset").click(function () {
                apiManage.button.clear();
            });

            // 등록/수정 버튼 클릭
            $("#apiManage #apiSave").click(function () {
                apiManage.api.save();
            });
        },
        clear: function () {
            $("#apiManage #apiSeq").text('');
            $("#apiManage #apiName").val('');
            $("#apiManage #apiDescription").val('');
            $("#apiManage #apiMethod").val('GET');
            $("#apiManage #apiUri").val('');
            $("#apiManage #isUsed").val('y');

            //apiManage.apiGrid.clearAll();
        }
    },

    /**
     * 그리드 관련
     */
    grid: {

        // api 그리드 초기화
        apiInit: function () {
            apiManage.apiGrid = new dhtmlXGridObject('apiGrid');
            apiManage.apiGrid.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
            apiManage.apiGrid.setHeader("고유번호,서버정보,api 명,api 설명,api 메소드,api URI,사용여부,등록자,등록일,사용여부코드,서버고유번호");
            apiManage.apiGrid.attachHeader("&nbsp;,#text_filter,#text_filter,&nbsp;");
            apiManage.apiGrid.setInitWidths("75,150,300,400,80,400,80,80,140,0,0");
            apiManage.apiGrid.setColAlign("center,center,center,left,center,left,center,center,center,center,center");
            apiManage.apiGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
            apiManage.apiGrid.setStyle("text-align:center;", "", "");
            apiManage.apiGrid.attachEvent("onRowSelect", function (id, ind) {
                apiManage.api.setApiDetail(id);
            });
            apiManage.apiGrid.enableSmartRendering(true);
            apiManage.apiGrid.setColumnHidden(9, true);
            apiManage.apiGrid.setColumnHidden(10, true);
            apiManage.apiGrid.init();
            apiManage.apiGrid.enableColSpan(true);
            apiManage.apiGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
            apiManage.apiGrid.setColspan(0, 0, 11);
        }
    },

    /**
     * 검색 관련
     */
    search: {
        init: function () {
            // 검색버튼 클릭
            $("#apiManage #searchBtn").click(function () {
                //서버 선택여부 유효성 체크
                if ($('#apiManage select[name="systemSeq"]').val() == '0') {
                    alert("시스템을 선택해주세요.");
                    return false;
                }
                apiManage.callAjax.search();
            });
        }
    },
     /**
     * api 관련
     */
    api: {
        // api 리스트 조회목록 세팅
        setApiList: function (data) {
            apiManage.apiGrid.clearAll();
            apiManage.apiGrid.getFilterElement(1).value = '';
            apiManage.apiGrid.getFilterElement(2).value = '';
            var rid = apiManage.apiGrid.uid();

            if (data != undefined && data.length > 0) {
                $.each(data, function (i, apis) {

                    apiManage.apiGrid.addRow(rid,
                                               [apis.apiSeq, apis.systemName, apis.apiName, apis.apiDescription,
                                                apis.apiMethod, apis.apiUri, apis.isUsed == 'y' ? '사용' : '미사용',
                                                apis.registeUserName, apis.registeDate, apis.isUsed, apis.systemSeq ], i);
                    rid++;
                });
            }
        },
        // api 상세내용 세팅
        setApiDetail: function(id){
            //선택한 row 정보 가져오기
            var apiSeq = GridGetValueByRowId(apiManage.apiGrid, '고유번호', id);
            var systemSeq = GridGetValueByRowId(apiManage.apiGrid, '서버고유번호', id);
            var apiName = GridGetValueByRowId(apiManage.apiGrid, 'api 명', id);
            var apiMethod = GridGetValueByRowId(apiManage.apiGrid, 'api 메소드', id);
            var apiUri = GridGetValueByRowId(apiManage.apiGrid, 'api URI', id);
            var isUsed = GridGetValueByRowId(apiManage.apiGrid, '사용여부코드', id);
            var apiDescription = GridGetValueByRowId(apiManage.apiGrid, 'api 설명', id);

            // 값 세팅
            //$('#systemSeq').val(systemSeq);
            $('#apiSeq').text(apiSeq);
            $('#apiName').val(apiName);
            $('#apiMethod').val(apiMethod);
            $('#apiUri').val(apiUri);
            //$('#isUsed').val(isUsed);
            $('#apiManage select[name="isUsed"]').val(isUsed)
            $('#apiDescription').val(apiDescription);
        },
        // api 저장
        save: function () {
            //유효성 체크
            if(apiManage.api.validation()) {

                //data set
                var data = {
                    "systemSeq": $('#apiManage select[name="systemSeq"]').val(),
                    //"systemSeq": $('#systemSeq').val(),
                    "apiSeq": $('#apiSeq').text(),
                    "apiName": $('#apiName').val(),
                    "apiMethod": $('#apiMethod').val(),
                    "apiUri": $('#apiUri').val().replace(/ /g, ''),
                    //"isUsed": $('#isUsed').val(),
                    "isUsed": $('#apiManage select[name="isUsed"]').val(),
                    "apiDescription": $('#apiDescription').val()
                };
                //ajax 호출
                apiManage.callAjax.saveApi(JSON.stringify(data));
            }
        },
        //유효성 체크
         validation: function () {
             if ($('#apiManage select[name="systemSeq"]').val() == '0') {
                 alert("서버를 선택해주세요.");
                 return false;
             } else if ($('#apiName').val() == '') {
                 alert("api 명을 입력해주세요.");
                 return false;
             } else if ($('#apiDescription').val() == '') {
                 alert("api 설명을 입력해주세요.");
                 return false;
             } else if ($('#apiUri').val() == '') {
                 alert("api URI를 입력해주세요.");
                 return false;
             }

             return true;
         }
    },

    /**
     * 서버 호출 관련
     */
    callAjax: {
        // api 조회
        search: function () {

            $.ajax({
                type: 'GET',
                url: '/v2.0/apis.json',
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("RMS_MENU_SEQ", $(".last-menu.selected").attr('seq'));
                },
                //TODO 현재는 전체조회 내용을 필터링 하는 방법을 사용 중이나, 검색조건을 이용한 조회방법으로 수정 필요
                data: {
                    "systemSeq": $('#apiManage select[name="systemSeq"]').val(),
                    "isUsed": $('#apiManage select[name="searchIsUsed"]').val()
                },
                dataType: 'json',
                success: function (data, status, xhr) {
                    if (xhr.status == 200) {
                        apiManage.button.clear();
                        apiManage.api.setApiList(data);
                    }
                    else if (xhr.status == 204) {
                        apiManage.apiGrid.clearAll();
                        apiManage.apiGrid.addRow(0, "검색 결과가 존재하지 않습니다.");
                        apiManage.apiGrid.setColspan(0, 0, 11);
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
        // api 저장
        saveApi: function (jsonData) {
            $.ajax({
                type: 'POST',
                url: '/v2.0/save/apis.json',
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
                        apiManage.callAjax.search();
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


$(document).ready(function () {
    apiManage.init();
});
