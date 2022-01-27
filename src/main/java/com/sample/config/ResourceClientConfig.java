package com.sample.config;

import lombok.Getter;
import lombok.Setter;

/**
 * ResourceClient 의 타임아웃 설정에 관한 config 입니다.
 *
 * @author kanghw@wemakeprice.com
 * @author Jeonyeochul
 */
@Getter
@Setter
public class ResourceClientConfig {
    /**
     * 기본 UrlConnection 에 대한 소켓 읽기 시간 제한 밀리세컨드 단위 입니다.<br>
     * 0 보다 크거나 같아야 하며 0을 입력할 경우 무제한으로 설정 됩니다.
     */
    private Integer connectTimeout;
    /**
     * 기본 UrlConnection 에 대한 연결 시간 제한 밀리세컨드 단위 입니다.<br>
     * 0 보다 크거나 같아야 하며 0을 입력할 경우 무제한으로 설정 됩니다.
     */
    private Integer readTimeout;
}
