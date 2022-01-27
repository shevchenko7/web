/**
 * 개인 권한복사 팝업 이벤트 JS
 */
var __api_authTargetSearch = "/v2.0/users/authCopy/informations.json"; //사원검색
var __api_hasAuthUserList = "/v2.0/users/authCopy/hasAuthUserList.json";
var __api_copy = "/v2.0/users/authCopy/copy.json";

/**
 * 그리드 영역 이벤트
 */
var gridArea = null;

var gridList = {
    init : function () {
        gridList.setGridArea();
    },
    setGridArea : function () {
        gridArea = new dhtmlXGridObject('gridArea');
        gridArea.setSkin("dhx_web");
        gridArea.setImagePath("/resources/dhtmlx/skins/web/imgs/dhxgrid_web/");
        gridArea.setInitWidths("45,150,150,150,0");
        gridArea.setHeader("#master_checkbox,사번,부서,이름,부서코드");
        gridArea.setColumnIds("checkRow,userCd,departmentName,userName,departmentCd");
        gridArea.setStyle("text-align:center;","","","");
        gridArea.setColAlign("center,center,center,center,center");
        gridArea.setColTypes("ch,ro,ro,ro,ro");
        gridArea.setColumnHidden(4, true);
        gridArea.setColSorting("na,str,str,str,str");

        gridArea.enableColSpan(true);
        gridArea.setEditable(false);

        gridArea.attachEvent("onRowSelect", function (id, ind) {
            var isSelected = gridArea.cells(id, 0).getValue();

            if (isSelected == 0) {
                gridArea.cells(id, 0).setChecked(1);
            } else {
                gridArea.cells(id, 0).setChecked(0);
            }
        });


        gridArea.init();
    }
}

/**
 * 버튼 이벤트
 */
var buttonEvent = {
    //검색버튼 클릭 이벤트
    userSearchAjax: function () {
        var searchType = $("#searchType").val();
        var searchText = $("#searchText").val();

        var _url = __api_authTargetSearch;

        if (!searchText) {
            alert('검색조건을 입력해주세요');
            $('#searchText').focus();
            return false;
        }

        //1. 부서(명) 검색을 할 경우
        if (searchType == "department") {
            if (!isAllowInput(searchText, ['NUM', 'KOR', 'ENG'])) {
                alert("부서 검색 시, 한글/영문/숫자만 입력 가능합니다.");
                $("#searchText").focus();

                return false;
            }
            _url += '?searchType=department&keyword=' + searchText;

        //2. 사번으로 검색을 할 경우
        } else if(searchType == "userCd"){
            if (!isAllowInput(searchText, ['NUM'])) {
                alert("사번 검색 시, 숫자만 입력 가능합니다.");
                $("#searchText").focus();

                return false;
            }
            _url += '?searchType=userCd&keyword=' + searchText;

        //3. 이름 검색을 할 경우
        } else {
            if (!isAllowInput(searchText, ['KOR'])) {
                alert("이름 검색 시, 한글만 입력 가능합니다.");
                $("#searchText").focus();

                return false;
            }
            _url += '?searchType=userName&keyword=' + searchText;
        }

        //그리드영역 클리어
        gridArea.clearAll();

        $.ajax({
                   type: 'GET',
                   url: _url,
                   cache: false,
                   dataType: 'json',
                   success: function (resData, xhr) {
                       gridArea.clearAll();

                       var dataList = new Array();

                       $.each(resData, function (i, row) {
                           var data = new Object();
                           data.userCd = row.userCd;
                           data.userName = row.userName;
                           data.departmentCd = row.departmentCd;
                           data.departmentName = row.departmentName;

                           dataList.push(data);
                       });
                       gridArea.parse(JSON.stringify(dataList), 'js');

                       //검색결과 없을 경우 추가
                       if (gridArea.getRowsNum() == 0) {
                           gridArea.addRow(0, []);
                           $(gridArea.cells(0, 0).cell).attr('colspan', gridArea.getColumnsNum())
                               .html('검색 결과가 없습니다.').css("text-align", "center").addClass('n_emptyList');
                       }
                   },
                   error: function (e) {
                       console.log(e);
                       errorMsg(e.status);
                   },
                   fail: function (e) {
                       console.log(e);
                       alert('요청에 실패하였습니다. 재시도 해주십시오.');
                   }
               });
    },

    //복사버튼 클릭 이벤트
    authCopy: function () {

        //체크직원 확인
        var checkedRows = gridArea.getCheckedRows(0);

        if (isEmpty(checkedRows)) {
            alert("개인 권한을 부여할 직원을 선택해주세요");
            return false;
        }

        //data set
        var data = {
            "systemSeq": $("#systemSeq").val(),
            "userCd": $("#targetUserCd").val(),
            "authCopyUserParamList" : []
        }

        //선택된 사원만 set
        var rowArr = checkedRows.split(',');

        for (var i in rowArr) {
            var rowData = new Object();
            rowData.userCd = GridGetValueByRowId(gridArea, "사번", rowArr[i]);
            rowData.userName = GridGetValueByRowId(gridArea, "이름", rowArr[i]);
            rowData.departmentCd = GridGetValueByRowId(gridArea, "부서코드", rowArr[i]);
            rowData.departmentName = GridGetValueByRowId(gridArea, "부서", rowArr[i]);
            rowData.userSeq = 0;

            data.authCopyUserParamList.push(rowData);
        }

        //이미 등록된 권한이 있는지 조회
        buttonEvent.hasAuthUserListAjax(data);
    },
    // 이미 등록된 권한이 있는지 조회
    hasAuthUserListAjax: function (data) {
        $.ajax({
                   type: 'POST',
                   url: __api_hasAuthUserList,
                   data: JSON.stringify(data),
                   cache: false,
                   dataType: 'json',
                   contentType: 'application/json',
                   success: function (resData, xhr) {
                       // 이미 등록된 권한이 없는 경우
                       if (isEmpty(resData)) {
                           //권한 복사
                           buttonEvent.authCopyAjax(data);
                       // 권한이 있는 경우 문구 노출
                       } else {
                           var dataList = new Array();
                           for (var i in resData) {
                                dataList.push(resData[i].userName);
                           }

                           var conf = confirm(dataList.join(", ") + "님은 개인권한이 존재합니다.\n기존 개인권한을 삭제하고 덮어쓰시겠습니까?");
                           if (conf == true) {
                               //권한 복사
                               buttonEvent.authCopyAjax(data);
                           } else {
                               return false;
                           }
                       }
                   },
                   error: function (e) {
                       console.log(e);
                       errorMsg(e.status);
                   },
                   fail: function (e) {
                       console.log(e);
                       alert('요청에 실패하였습니다. 재시도 해주십시오.');
                   }
               });
    },
    //권한 복사
    authCopyAjax: function (data) {
        $.ajax({
                   type: 'POST',
                   url: __api_copy,
                   cache: false,
                   data: JSON.stringify(data),
                   dataType: 'json',
                   contentType: 'application/json',
                   success: function (resData, xhr) {
                       gridArea.clearAll();
                       alert("개인권한을 복사 및 부여 하였습니다")
                   },
                   error: function (e) {
                       //callback message가 존재할 경우
                       if (e.responseText != null) {
                           var obj = JSON.parse(e.responseText);

                           if (obj.errors[0].detail != null) {
                               // api 에러메세지
                               alert(obj.errors[0].detail);
                           }
                           else {
                               // df 에러메세지
                               console.log(e);
                               errorMsg(e.status);
                           }
                       }
                   },
                   fail: function (e) {
                       console.log(e);
                       alert('요청에 실패하였습니다. 재시도 해주십시오.');
                   }
               });
    },

    //취소버튼 클릭이벤트(창닫기)
    authCopyClose: function () {
        buttonEvent.closeAuthCopy();
    },
    //초기화이벤트
    searchInputReset: function () {
        $("#searchText").val('');
        gridArea.clearAll(); //gridArea : 그리드영역 ID
        $('#searchText').focus();
    },
    //창 닫기
    closeAuthCopy: function () {
        window.close();
    }
};

/**
 * function()
 */
$(function () {
    $("#authCopySearch").click(function () {
        buttonEvent.userSearchAjax();
    });

    $('#searchText').keypress(function (e) {
        if (e.keyCode === 13) {
            buttonEvent.userSearchAjax();
        }
    });
    //닫기버튼 이벤트
    $("#authCopyClose").click(function () {
        buttonEvent.authCopyClose();
    });

    //복사버튼 이벤트
    $("#authCopy").click(function () {
        buttonEvent.authCopy();
    });

    //초기화 버튼 이벤트
    $("#initEventBtn").click(function () {
        buttonEvent.searchInputReset();
    });
});

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

function isAllowInput(val, types) {
    if(isEmpty(val)) {
        return false;
    }
    var space = '\\s';
    var regx = '';
    for(var i =0; i < types.length; i++) {
        switch (types[i].toUpperCase()) {
            case 'NUM':
                regx += '0-9'; break;
            case 'ENG':
                regx += 'a-zA-Z'; break;
            case 'KOR':
                regx += 'ㄱ-ㅎㅏ-ㅣ가-힣'; break;
            case 'SPC_1':
                regx += '\/\&\''; break;
            case 'SPC_2':
                regx += '-_/!~&%^,·\\.\\?\\(\\)\\[\\]\\+\\*'; break;
            case 'SPC_3':
                regx += '~!@#%&\\"`\'=:;\\-_※☆★○●◎△▲▽▼→←↑↓↔◁◀▷▶♡♥,·\\.\\\\\+\\*\\?\\^\\$\\[\\]\\{\\}\\(\\)\\|\\/'; break;
            case 'NOT_SPACE':
                space = ''; break;
            default:
                return false; break;
        }
    }
    regx = new RegExp('^[' + regx + space + ']+$');
    return regx.test(val);
}

/**
 * document ready
 */
$(document).ready(function () {
    //init grid
    gridList.init();

    //focus input
    $('#searchText').focus();
});

