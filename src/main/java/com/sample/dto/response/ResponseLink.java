package com.sample.dto.response;

import lombok.Getter;

/**
 * gateway link spec.
 *
 * @author jwlee
 */
@Getter
public class ResponseLink {

    // 요청한 정보의 현재 페이지 링크 ( NULL or EMPTY : 출력시 포함하지 않음 ) : the current page of data
    private String self;

    // 첫번째 페이지로 이동하기 위한 링크 ( NULL or EMPTY : 출력시 포함하지 않음 ) : the first page of data
    private String first;

    // 이전 페이지로 이동하기 위한 링크 ( NULL or EMPTY : 출력시 포함하지 않음 ) : the previous page of data
    private String prev;

    // 다음 페이지로 이동하기 위한 링크 ( NULL or EMPTY : 출력시 포함하지 않음 ) : the next page of data
    private String next;

    // 마지막 페이지로 이동하기 위한 링크 ( NULL or EMPTY : 출력시 포함하지 않음 ) : the last page of data
    private String last;

    // 현재의 데이터 호출 페이지 링크
    public void setCurrentLink(String linkUrl) {
        this.self = linkUrl;
    }

    // 처음과 마지막의 호출 페이지 링크
    public void setFirstLast(String first, String last) {
        this.first = first;
        this.last = last;
    }

    // 이전과 다음페이지의 호출 페이지 링크
    public void setPrevNext(String prev, String next) {
        this.prev = prev;
        this.next = next;
    }

    // 이전과 다음페이지의 호출 페이지 링크 ( 현재 페이지 포함 )
    public void setPrevNext(String prev, String self, String next) {
        this.prev = prev;
        this.self = self;
        this.next = next;
    }

}

