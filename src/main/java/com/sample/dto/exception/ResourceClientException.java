package com.sample.dto.exception;

import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClientResponseException;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

/**
 * ResourceClient 사용시 발생하는 예외 클래스.
 *
 * @author kanghw@wemakeprice.com
 */
public class ResourceClientException extends RuntimeException {

    /**
     * Exception 발생 시 사용한 url
     */
    private String resourceUrl;

    /**
     * api에서 응답한 HttpStatus 정보
     */
    private int HttpStatus;

    /**
     * api에서 응답한 Body 내용을 raw data(byte type)를 전달한다.
     */
    private byte[] responseBody;

    /**
     * api에서 응답한 Header 정보
     */
    private HttpHeaders responseHeaders;

    /**
     * Exception 발생 시 사용한 url을 반환한다.
     *
     * @return resourceUrl
     */
    public String getResourceUrl() {

        return resourceUrl;
    }

    /**
     * httpStatus를 반환한다.
     *
     * @return HttpStatus
     */
    public int getHttpStatus() {

        return HttpStatus;
    }

    /**
     * ResponseBody를 반한환다.
     * null 일 경우 빈 배열을 만들어서 반환.
     *
     * @return ResponseBody
     */
    public byte[] getResponseBody() {
        if (this.responseBody == null) {
            this.responseBody = new byte[0];
        }
        return this.responseBody;
    }

    /**
     * ResponseBody를 String 으로 변환하여 반환한다.
     * responseBody 가 null 일 경우에는 "" 값 반환.
     * default Charset UTF-8 을 사용.
     *
     * @return ResponseBody String value
     */
    public String getResponseBodyString() {
        return this.getResponseBodyString(StandardCharsets.UTF_8);
    }

    /**
     * ResponseBody를 String 으로 변환하여 반환한다.
     * responseBody 가 null 일 경우에는 "" 값 반환.
     * default Charset 인 UTF-8 이 아닌 특정 Charset 으로 받아야 할 경우 사용.
     *
     * @return ResponseBody String value
     */
    public String getResponseBodyString(Charset charset) {
        return new String(this.getResponseBody(), charset);
    }

    /**
     * ResponseHeaders를 반한환다.
     *
     * @return ResponseHeaders
     */
    public HttpHeaders getResponseHeaders() {
        return responseHeaders;
    }

    public ResourceClientException(String resourceUrl, RestClientResponseException e) {
        super(e);
        this.resourceUrl = resourceUrl;
        this.responseBody = e.getResponseBodyAsByteArray();
        this.HttpStatus = e.getRawStatusCode();
        this.responseHeaders = e.getResponseHeaders();
    }

    public ResourceClientException(String resourceUrl, Exception e) {
        super(e);
        this.resourceUrl = resourceUrl;
    }
}
