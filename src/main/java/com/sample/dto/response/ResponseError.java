package com.sample.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * gateway error spec.
 *
 * @author jwlee
 */
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class ResponseError {

    // HttpStatus 코드의 데이터, 여러에러의 복합이면 가장 일반적인 코드 사용
    // the HTTP status code applicable to this problem, expressed as a string value. ( When a server encounters multiple problems for a single request, the most generally applicable HTTP error code SHOULD be used in the response )
    private String status;

    // 각각의 Application에서 사용할 별도의 코드 : an application-specific error code, expressed as a string value
    private String code;

    // 에러의 제목 : a short, human-readable summary of the problem
    private String title;

    // 에러의 상세내용 : a human-readable explanation specific to this occurrence of the problem. Like title, this field’s value can be localized.
    private String detail;

    // 해당 발생에러에 대한 상세정보 : an object containing references to the source of the error, optionally including any of the following members
    private ResponseErrorSource source;

    // 비정형적인 참조 데이터 : a meta object containing non-standard meta-information about the error.
    private Object meta;

    public String getStatus() {
        return this.status;
    }

    public void setStatus( String status ){
        this.status = status;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public ResponseErrorSource getSource() {
        return source;
    }

    public void setSource(ResponseErrorSource source) {
        this.source = source;
    }

    public Object getMeta() {
        return meta;
    }

    public void setMeta(Object meta) {
        this.meta = meta;
    }
}
