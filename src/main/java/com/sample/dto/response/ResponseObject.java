package com.sample.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.google.gson.Gson;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class ResponseObject<T> {

    // 실제 리턴될 데이터 Single Object : a single model object, a single model identifier object, or null
    // 실제 리턴될 데이터 Array Object : an array of model objects, an array of model identifier objects, or an empty array
    // 해당 데이터는 NULL인 경우가 아니면 생략하지 않음
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private T data;

    // 응답에 포함될 비정형 데이터 : a meta object that contains non-standard meta-information.
    // 데이터가 NULL 또는 EMPTY 인경우는 생략처리됨
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Object meta;

    // 정보요청을 위한 링크정보 : a string containing the link’s URL.
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private ResponseLink links = null;

    // 페이징 존재시 해당 정보의 기록용 사용 : choose to limit the number of resources returned in a response to a subset (“page”) of the whole set available.
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private ResponsePagination pagination = null;

    // 에러관련 객체배열 : Error objects provide additional information about problems encountered while performing an operation
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<ResponseError> errors = null;

    public <U> U getMeta(Class<U> responseType) {
        return new Gson().fromJson(new Gson().toJson(this.meta), responseType);
    }

    public void addError(ResponseError error) {
        if (this.errors == null) {
            this.errors = new ArrayList<>();
        }
        this.errors.add(error);
    }

    public boolean hasError() {
        return this.errors != null && this.errors.size() != 0;
    }
}
