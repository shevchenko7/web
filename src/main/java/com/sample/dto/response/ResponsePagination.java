package com.sample.dto.response;

import lombok.Getter;

@Getter
public class ResponsePagination {

    // offset style
    // 시작카운트
    private Long offset;
    // 한페이지의 수량 카운트
    private Long limit;
    // 전체 카운트 건수
    private Long totalCount;


    // page style
    // 요청 페이지
    private Integer page;
    // 페이지당 수량
    private Integer perPage;
    // 전체 페이지 건수
    private Integer totalPage;

    public void setOffsetStyle(long offset, long limit, long totalCount) {
        this.offset = offset;
        this.limit = limit;
        this.totalCount = totalCount;

        this.page = null;
        this.perPage = null;
        this.totalPage = null;
    }

    public void setPageStyle(int page, int perPage, int totalPage) {
        this.page = page;
        this.perPage = perPage;
        this.totalPage = totalPage;

        this.offset = null;
        this.limit = null;
        this.totalCount = null;
    }
}

