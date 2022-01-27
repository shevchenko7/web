package com.sample.config;

import com.sample.util.ResourceClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestTemplate;

/**
 * green-web ResourceClient 를 사용하기 위한 설정.
 *
 * application.yml 에 아래와 같이 추가 필요.
 *
 * green.resource-routes:
 * deal:
 * url: http://10.102.1.114:8080
 *
 * deal 이 ID가 되어서 호출 시 apiId 가 되며,
 * url 은 ResourceRoute 의 인자로 mapping 되어 사용한다.
 */
@Configuration
public class ClientConfig {

    @Bean
    @Primary
    public RestTemplate getRestTemplate(){
        return new RestTemplate();
    }

    @Bean
    @Primary
    public ResourceRouteConfig getResourceRouteConfigure() {
        return new ResourceRouteConfig();
    }

    @Bean
    @Primary
    public ResourceClient getResourceClient() {
        return new ResourceClient(getRestTemplate(), getResourceRouteConfigure());
    }
}
