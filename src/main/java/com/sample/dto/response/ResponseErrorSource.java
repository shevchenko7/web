package com.sample.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * gateway error source spec.
 *
 * @author jwlee
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class ResponseErrorSource {

    /**
     * 해당 에러가 발생한 위치 또는 URL등의 메타정보 : a JSON Pointer [RFC6901] to the associated entity in the request document
     */
    private String pointer;

    /**
     * 해당 에러가 발생하는 파라미터 데이터 : a string indicating which URI query parameter caused the error.
     */
    private String parameter;

    public ResponseErrorSource() {
    }

    public ResponseErrorSource(String pointer, String parameter) {
        this.pointer = pointer;
        this.parameter = parameter;
    }

    public String getPointer() {
        return pointer;
    }

    public void setPointer(String pointer) {
        this.pointer = pointer;
    }

    public String getParameter() {
        return parameter;
    }

    public void setParameter(String parameter) {
        this.parameter = parameter;
    }
}

