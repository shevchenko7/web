/**
 * Created by ran on 2016. 10. 18..
 */

// Http status code에 따른 에러 메세지 출력
function errorMsg(status) {
    if(status == 416) {
        alert('권한이 없습니다. 관리자에게 문의해주시기 바랍니다.');
    }
    else if(status == 409) {
        alert('처리 도중 에러가 발생하였습니다. 관리자에게 문의해주시기 바랍니다.');
    }
    else if(status == 500) {
        alert('처리 도중 에러가 발생하였습니다. 관리자에게 문의해주시기 바랍니다.');
    }
}
