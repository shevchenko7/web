package com.sample.util;

import com.sample.config.ResourceClientConfig;
import com.sample.config.ResourceRouteConfig;
import com.sample.dto.exception.ResourceClientException;
import com.sample.dto.exception.ResourceTimeoutException;
import com.sample.dto.response.ResponseObject;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.http.conn.ConnectTimeoutException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.util.Assert;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StopWatch;
import org.springframework.web.client.*;

import java.io.IOException;
import java.net.SocketTimeoutException;
import java.net.URI;
import java.util.Map;
import java.util.Optional;


/**
 * model api 호출하기 위한 RestTemplate wrapper 클래스.
 *
 * @author kanghw@wemakeprice.com
 */
public class ResourceClient implements ResourceClientOperations {

    Logger log = LoggerFactory.getLogger(ResourceClient.class);

    private RestTemplate restTemplate;

    private ResourceRouteConfig resourceRouteConfigure;

    private SimpleClientHttpRequestFactory factory;

    private static final int DEFAULT_CONNECT_TIMEOUT = 5 * 1000;
    private static final int DEFAULT_READ_TIMEOUT = 60 * 1000;

    /**
     * Default constructor - no arguments<br>
     * 기본 ResourceClient 를 생성하며, timeout 관련 설정도 기본값으로 제공된다.<br>
     * getUrl 의 기능을 사용할 수 없음.<br>
     * sleuth 등의 빈에 등록된 내용을 검색하여 처리하는 부분은 정상적으로 기능하지 않을 수 있다.
     *
     * @see RestTemplate
     * @see ResourceClientConfig
     */
    public ResourceClient() {
        this.restTemplate = new RestTemplate();
        ResourceClientConfig resourceClientConfig = defaultResourceClientConfig();

        initConfigureResourceClient(resourceClientConfig);
    }

    /**
     * application.yml 에 작성한 green-framework 설정값을 반영한다.
     * (application.yml 에 설정되지 않은 항목은 default 값을 사용한다)
     *
     * @param restTemplate RestTemplate
     * @param resourceRouteConfigure ResourceRouteConfigure
     */
    public ResourceClient(RestTemplate restTemplate, ResourceRouteConfig resourceRouteConfigure) {
        this.restTemplate = restTemplate;
        this.resourceRouteConfigure = resourceRouteConfigure;
        ResourceClientConfig resourceClientConfig = defaultResourceClientConfig();

        initConfigureResourceClient(resourceClientConfig);
    }

    public ResourceClient(RestTemplate restTemplate, ResourceRouteConfig resourceRouteConfigure, ResourceClientConfig resourceClientConfig) {
        this.restTemplate = restTemplate;
        this.resourceRouteConfigure = resourceRouteConfigure;

        initConfigureResourceClient(resourceClientConfig);
    }

    private ResourceClientConfig defaultResourceClientConfig() {
        ResourceClientConfig resourceClientConfig = new ResourceClientConfig();
        resourceClientConfig.setConnectTimeout(DEFAULT_CONNECT_TIMEOUT);
        resourceClientConfig.setReadTimeout(DEFAULT_READ_TIMEOUT);
        return resourceClientConfig;
    }

    /**
     * ResourceClientConfig 의 설정을 ResourceClient 에 적용한다.
     */
    public void modifyResourceClient(ResourceClientConfig resourceClientConfig) {
        Assert.notNull(resourceClientConfig, "resourceClientConfig must not be null");

        configureClientHttpRequestFactory(resourceClientConfig);
    }

    /**
     * init 과정에서 ResourceClientConfig 의 설정을 ResourceClient 에 적용한다.
     *
     * @param resourceClientConfig ResourceClientConfig
     */
    private void initConfigureResourceClient(ResourceClientConfig resourceClientConfig) {
        Assert.notNull(resourceClientConfig, "resourceClientConfig must not be null");

        factory = new SimpleClientHttpRequestFactory();
        this.restTemplate.setRequestFactory(factory);

        configureClientHttpRequestFactory(resourceClientConfig);
    }

    /**
     * ClientHttpRequestFactory 에 관련된 설정을 적용한다.
     * @param resourceClientConfig ResourceClientConfig
     */
    private void configureClientHttpRequestFactory(ResourceClientConfig resourceClientConfig) {
        Integer connectTimeout = Optional.ofNullable(resourceClientConfig).map(ResourceClientConfig::getConnectTimeout).orElse(DEFAULT_CONNECT_TIMEOUT);
        Integer readTimeout = Optional.ofNullable(resourceClientConfig).map(ResourceClientConfig::getReadTimeout).orElse(DEFAULT_READ_TIMEOUT);

        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);

        log.info("configureClientHttpRequestFactory success. <connectTimeout:{}> <readTimeout:{}>", connectTimeout, readTimeout);
    }

    @Override
    public ResponseObject getForResponseObject(String apiId, String uri) {
        ResponseEntity<ResponseObject> responseEntity = getForResponseEntity(apiId, uri, new ParameterizedTypeReference<ResponseObject>() {
        });
        return responseEntity.getBody();
    }

    @Override
    public ResponseObject getForResponseObject(String apiId, String uri, ParameterizedTypeReference typeReference) {
        ResponseEntity<ResponseObject> responseEntity = getForResponseEntity(apiId, uri, typeReference);
        return responseEntity.getBody();
    }

    @Override
    public ResponseObject getForResponseObject(String apiId, String uri, HttpHeaders httpHeaders) {
        ResponseEntity<ResponseObject> responseEntity = getForResponseEntity(apiId, uri, httpHeaders, new ParameterizedTypeReference<ResponseObject>() {
        });
        return responseEntity.getBody();
    }

    @Override
    public ResponseObject getForResponseObject(String apiId, String uri, HttpHeaders httpHeaders, ParameterizedTypeReference typeReference) {
        ResponseEntity<ResponseObject> responseEntity = getForResponseEntity(apiId, uri, httpHeaders, typeReference);
        return responseEntity.getBody();
    }

    @Override
    public ResponseEntity getForResponseEntity(String apiId, String uri, ParameterizedTypeReference typeReference) {
        HttpHeaders httpHeaders = createHttpHeaders();
        HttpEntity httpEntity = new HttpEntity(httpHeaders);

        ResponseEntity responseEntity = exchange(apiId, uri, HttpMethod.GET, httpEntity, typeReference);
        return responseEntity;
    }

    @Override
    public <T> ResponseEntity<T> getForResponseEntity(String apiId, String uri, Class<T> tClass) {
        HttpHeaders httpHeaders = createHttpHeaders();
        HttpEntity httpEntity = new HttpEntity(httpHeaders);

        ResponseEntity<T> responseEntity = exchange(apiId, uri, HttpMethod.GET, httpEntity, tClass);
        return responseEntity;
    }

    @Override
    public ResponseEntity getForResponseEntity(String apiId, String uri, HttpHeaders httpHeaders, ParameterizedTypeReference typeReference) {
        HttpEntity httpEntity = new HttpEntity(httpHeaders);

        ResponseEntity responseEntity = exchange(apiId, uri, HttpMethod.GET, httpEntity, typeReference);
        return responseEntity;
    }

    @Override
    public <T> ResponseEntity<T> getForResponseEntity(String uri, Class<T> tClass) {
        HttpHeaders httpHeaders = createHttpHeaders();
        HttpEntity httpEntity = new HttpEntity(httpHeaders);

        ResponseEntity responseEntity = exchange(uri, HttpMethod.GET, httpEntity, tClass);
        return responseEntity;
    }

    @Override
    public ResponseEntity getForResponseEntity(String uri, ParameterizedTypeReference typeReference) {
        HttpHeaders httpHeaders = createHttpHeaders();
        HttpEntity httpEntity = new HttpEntity(httpHeaders);

        ResponseEntity responseEntity = exchange(uri, HttpMethod.GET, httpEntity, typeReference);
        return responseEntity;
    }

    @Override
    public <T> ResponseEntity<T> getForResponseEntity(String uri, HttpHeaders httpHeaders, Class<T> tClass) {
        HttpEntity httpEntity = new HttpEntity(httpHeaders);

        ResponseEntity responseEntity = exchange(uri, HttpMethod.GET, httpEntity, tClass);
        return responseEntity;
    }

    @Override
    public ResponseEntity getForResponseEntity(String uri, HttpHeaders httpHeaders, ParameterizedTypeReference typeReference) {
        HttpEntity httpEntity = new HttpEntity(httpHeaders);

        ResponseEntity responseEntity = exchange(uri, HttpMethod.GET, httpEntity, typeReference);
        return responseEntity;
    }

    @Override
    public <T> ResponseEntity<T> getForResponseEntity(String apiId, String uri, HttpHeaders httpHeaders, Class<T> tClass) {
        HttpEntity httpEntity = new HttpEntity(httpHeaders);

        ResponseEntity<T> responseEntity = exchange(apiId, uri, HttpMethod.GET, httpEntity, tClass);
        return responseEntity;
    }

    @Override
    public ResponseObject postForResponseObject(String apiId, Object postObject, String uri) {
        return (ResponseObject) postForResponseEntity(apiId, postObject, uri, new ParameterizedTypeReference<ResponseObject>() {
        }).getBody();
    }

    @Override
    public ResponseObject postForResponseObject(String apiId, Object postObject, String uri, ParameterizedTypeReference typeReference) {
        return (ResponseObject) postForResponseEntity(apiId, postObject, uri, typeReference).getBody();
    }

    @Override
    public ResponseObject postForResponseObject(String apiId, Object postObject, String uri, HttpHeaders httpHeaders) {
        return (ResponseObject) postForResponseEntity(apiId, postObject, uri, httpHeaders, new ParameterizedTypeReference<ResponseObject>() {
        }).getBody();
    }

    @Override
    public ResponseObject postForResponseObject(String apiId, Object postObject, String uri, HttpHeaders httpHeaders, ParameterizedTypeReference typeReference) {
        return (ResponseObject) postForResponseEntity(apiId, postObject, uri, httpHeaders, typeReference).getBody();
    }

    @Override
    public ResponseEntity postForResponseEntity(String apiId, Object postObject, String uri, ParameterizedTypeReference typeReference) {
        HttpHeaders httpHeaders = createHttpHeaders();
        HttpEntity httpEntity = new HttpEntity(postObject, httpHeaders);

        ResponseEntity responseEntity = exchange(apiId, uri, HttpMethod.POST, httpEntity, typeReference);
        return responseEntity;
    }

    @Override
    public <T> ResponseEntity<T> postForResponseEntity(String apiId, Object postObject, String uri, Class<T> tClass) {
        HttpHeaders httpHeaders = createHttpHeaders();
        HttpEntity<T> httpEntity = new HttpEntity(postObject, httpHeaders);

        ResponseEntity<T> responseEntity = exchange(apiId, uri, HttpMethod.POST, httpEntity, tClass);
        return responseEntity;
    }

    @Override
    public ResponseEntity postForResponseEntity(String apiId, Object postObject, String uri, HttpHeaders httpHeaders, ParameterizedTypeReference typeReference) {
        HttpEntity httpEntity = new HttpEntity(postObject, httpHeaders);

        ResponseEntity responseEntity = exchange(apiId, uri, HttpMethod.POST, httpEntity, typeReference);
        return responseEntity;
    }

    @Override
    public <T> ResponseEntity<T> postForResponseEntity(String uri, Object postObject, Class<T> tClass) {
        HttpHeaders httpHeaders = createHttpHeaders();
        HttpEntity<T> httpEntity = new HttpEntity(postObject, httpHeaders);

        ResponseEntity<T> responseEntity = exchange(uri, HttpMethod.POST, httpEntity, tClass);
        return responseEntity;
    }

    @Override
    public <T> ResponseEntity<T> postForResponseEntity(String uri, Object postObject, HttpHeaders httpHeaders, Class<T> tClass) {
        HttpEntity<T> httpEntity = new HttpEntity(postObject, httpHeaders);

        ResponseEntity<T> responseEntity = exchange(uri, HttpMethod.POST, httpEntity, tClass);
        return responseEntity;
    }

    @Override
    public ResponseEntity postForResponseEntity(String uri, Object postObject, ParameterizedTypeReference typeReference) {
        HttpHeaders httpHeaders = createHttpHeaders();
        HttpEntity httpEntity = new HttpEntity(postObject, httpHeaders);

        ResponseEntity responseEntity = exchange(uri, HttpMethod.POST, httpEntity, typeReference);
        return responseEntity;
    }

    @Override
    public ResponseEntity postForResponseEntity(String uri, Object postObject, HttpHeaders httpHeaders, ParameterizedTypeReference typeReference) {
        HttpEntity httpEntity = new HttpEntity(postObject, httpHeaders);

        ResponseEntity responseEntity = exchange(uri, HttpMethod.POST, httpEntity, typeReference);
        return responseEntity;
    }

    @Override
    public <T> ResponseEntity<T> postForResponseEntity(String apiId, Object postObject, String uri, HttpHeaders httpHeaders, Class<T> tClass) {
        HttpEntity<T> httpEntity = new HttpEntity(postObject, httpHeaders);

        ResponseEntity<T> responseEntity = exchange(apiId, uri, HttpMethod.POST, httpEntity, tClass);
        return responseEntity;
    }

    @Override
    public ResponseObject postForFileUploadResponseObject(String apiId, MultiValueMap<String, Object> multiValueMap, String uri,
                                                                                                 ParameterizedTypeReference typeReference) throws IOException {
        return (ResponseObject) postForFileUploadResponseEntity(apiId, multiValueMap, uri, typeReference).getBody();
    }

    @Override
    public ResponseEntity postForFileUploadResponseEntity(String apiId, MultiValueMap<String, Object> multiValueMap, String uri,
                                                          ParameterizedTypeReference typeReference) throws IOException {
        HttpEntity<MultiValueMap<String, Object>> httpEntity = getMultiValueMapHttpEntity(multiValueMap);
        ResponseEntity responseEntity = exchange(apiId, uri, HttpMethod.POST, httpEntity, typeReference);

        return responseEntity;
    }

    @Override
    public <T> ResponseEntity<T> postForFileUploadResponseEntity(String uri, MultiValueMap<String, Object> multiValueMap, Class<T> tClass) throws IOException {
        HttpEntity<MultiValueMap<String, Object>> httpEntity = getMultiValueMapHttpEntity(multiValueMap);
        ResponseEntity responseEntity = exchange(uri, HttpMethod.POST, httpEntity, tClass);

        return responseEntity;
    }

    @Override
    public ResponseEntity postForFileUploadResponseEntity(String uri, MultiValueMap<String, Object> multiValueMap, ParameterizedTypeReference typeReference) throws IOException {
        HttpEntity<MultiValueMap<String, Object>> httpEntity = getMultiValueMapHttpEntity(multiValueMap);
        ResponseEntity responseEntity = exchange(uri, HttpMethod.POST, httpEntity, typeReference);

        return responseEntity;
    }

    private HttpEntity<MultiValueMap<String, Object>> getMultiValueMapHttpEntity(MultiValueMap<String, Object> multiValueMap) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        return new HttpEntity<>(multiValueMap, headers);
    }

    @Override
    public <T> ResponseEntity<T> postForFileUploadResponseEntity(String apiId, MultiValueMap<String, Object> multiValueMap, String uri,
                                                                 Class<T> tClass) throws IOException {
        HttpEntity<MultiValueMap<String, Object>> httpEntity = getMultiValueMapHttpEntity(multiValueMap);

        ResponseEntity<T> responseEntity = exchange(apiId, uri, HttpMethod.POST, httpEntity, tClass);

        return responseEntity;
    }

    @Override
    public ResponseObject delete(String apiId, String uri) {

        HttpHeaders httpHeaders = createHttpHeaders();
        HttpEntity httpEntity = new HttpEntity(httpHeaders);

        ResponseEntity<ResponseObject> responseEntity = exchange(apiId, uri, HttpMethod.DELETE, httpEntity, new ParameterizedTypeReference<ResponseObject>() {
        });
        return responseEntity.getBody();
    }

    @Override
    public ResponseObject delete(String apiId, String uri, ParameterizedTypeReference typeReference) {

        HttpHeaders httpHeaders = createHttpHeaders();
        HttpEntity httpEntity = new HttpEntity(httpHeaders);

        ResponseEntity<ResponseObject> responseEntity = exchange(apiId, uri, HttpMethod.DELETE, httpEntity, typeReference);
        return responseEntity.getBody();
    }

    @Override
    public ResponseObject put(String apiId, Object putObject, String uri) {

        HttpHeaders httpHeaders = createHttpHeaders();
        HttpEntity httpEntity = new HttpEntity(putObject, httpHeaders);

        ResponseEntity<ResponseObject> responseEntity = exchange(apiId, uri, HttpMethod.PUT, httpEntity, new ParameterizedTypeReference<ResponseObject>() {
        });
        return responseEntity.getBody();
    }

    @Override
    public ResponseObject put(String apiId, Object putObject, String uri, ParameterizedTypeReference typeReference) {

        HttpHeaders httpHeaders = createHttpHeaders();
        HttpEntity httpEntity = new HttpEntity(putObject, httpHeaders);

        ResponseEntity<ResponseObject> responseEntity = exchange(apiId, uri, HttpMethod.PUT, httpEntity, typeReference);
        return responseEntity.getBody();
    }

    @Override
    public String getResourceUrl(String apiId, String uri) {
        return this.getUrl(apiId, uri);
    }

    /**
     * RestTemplate의 exchange()를 공통으로 처리하는 메소드<p>
     *
     * @param resourceUrl   요청한 api url
     * @param httpMethod    요청한 HttpMethod(GET, POST, PUT, DELETE...)
     * @param httpEntity    요청한 httpEntity(httpHeaders 설정)
     * @param typeReference responseType
     * @return ResponseEntity
     */
    @Override
    public ResponseEntity exchange(String resourceUrl, HttpMethod httpMethod, HttpEntity httpEntity, ParameterizedTypeReference typeReference) {
        return exchange(resourceUrl, httpMethod, httpEntity, typeReference, null);
    }

    @Override
    public ResponseEntity exchange(URI uri, HttpMethod httpMethod, HttpEntity httpEntity, ParameterizedTypeReference responseType) {
        return exchange(uri, httpMethod, httpEntity, responseType, null);
    }

    @Override
    public <T> ResponseEntity<T> exchange(String resourceUrl, HttpMethod httpMethod, HttpEntity httpEntity, Class<T> tClass) {
        return exchange(resourceUrl, httpMethod, httpEntity, null, tClass);
    }

    @Override
    public <T> ResponseEntity<T> exchange(URI uri, HttpMethod httpMethod, HttpEntity httpEntity, Class<T> tClass) {
        return exchange(uri, httpMethod, httpEntity, null, tClass);
    }

    /**
     * RestTemplate의 exchange() 를 공통으로 처리하는 메소드 <p>
     *
     * @param apiId         api id
     * @param uri           api uri
     * @param httpMethod    요청한 HttpMethod(GET, POST, PUT, DELETE...)
     * @param httpEntity    요청한 httpEntity(httpHeaders 설정)
     * @param typeReference responseType
     * @return ResponseEntity
     */
    @Override
    public ResponseEntity exchange(String apiId, String uri, HttpMethod httpMethod, HttpEntity httpEntity, ParameterizedTypeReference typeReference) {

        String url = getUrl(apiId, uri);
        ResponseEntity responseEntity = exchange(url, httpMethod, httpEntity, typeReference);

        return responseEntity;
    }

    @Override
    public <T> ResponseEntity<T> exchange(String apiId, String uri, HttpMethod httpMethod, HttpEntity httpEntity, Class<T> tClass) {
        String url = getUrl(apiId, uri);
        ResponseEntity<T> responseEntity = exchange(url, httpMethod, httpEntity, tClass);

        return responseEntity;
    }

    /**
     * API 아이디에 따라 설정된 호스트명을 반환.
     *
     * @param apiId API Id(key)
     * @param uri   API end-point url
     * @return API host 와 URI 를 조합한 {@link String} 타입 full-uri 를 반환.
     */
    private String getUrl(String apiId, String uri) {
        Assert.notNull(resourceRouteConfigure, "resourceRouteConfigure must not be null");
        String connectUrl = resourceRouteConfigure.getUrl(apiId);
        connectUrl += uri;
        return connectUrl;
    }

    /**
     * HTTP HEADER 객체 반환.
     *
     * @return {@link HttpHeaders}
     */
    private HttpHeaders createHttpHeaders() {
        HttpHeaders httpHeaders = new HttpHeaders();
        return httpHeaders;
    }

    private <T> ResponseEntity exchange(String resourceUrl, HttpMethod httpMethod, HttpEntity httpEntity, ParameterizedTypeReference typeReference, Class<T> tClass) {
        return execute(null, resourceUrl, httpMethod, httpEntity, typeReference, tClass);
    }

    private <T> ResponseEntity exchange(URI uri, HttpMethod httpMethod, HttpEntity httpEntity, ParameterizedTypeReference typeReference, Class<T> tClass) {
        return execute(uri, null, httpMethod, httpEntity, typeReference, tClass);
    }

    private <T> ResponseEntity execute(URI uri, String resourceUrl, HttpMethod httpMethod, HttpEntity httpEntity, ParameterizedTypeReference typeReference, Class<T> tClass) {
        if (typeReference == null && tClass == null) {
            return null;
        }

        String requestUrl = uri == null ? resourceUrl : uri.toString();

        // 로깅 시에 예외 처리된 결과인지를 남기기 위한 플래그.
        boolean isException = true;
        // resourceUrl 콜 후에 얼마나 시간이 소요되었는지 로그를 남기기 위한 stopWatch.
        StopWatch stopWatch = new StopWatch();
        try {
            ResponseEntity responseEntity;
            stopWatch.start();
            if (typeReference != null) {
                if (uri != null) {
                    responseEntity = restTemplate.exchange(uri, httpMethod, httpEntity, typeReference);
                } else {
                    responseEntity = restTemplate.exchange(resourceUrl, httpMethod, httpEntity, typeReference);
                }
            } else {
                if (uri != null) {
                    responseEntity = restTemplate.exchange(uri, httpMethod, httpEntity, tClass);
                } else {
                    responseEntity = restTemplate.exchange(resourceUrl, httpMethod, httpEntity, tClass);
                }
            }
            stopWatch.stop();
            // 정상 반환을 했을 경우에는 예외가 아님.
            isException = false;
            return responseEntity;
        } catch (HttpClientErrorException | HttpServerErrorException | UnknownHttpStatusCodeException ex) {
            // httpsStatus가 4xx, 5xx series 이거나 스프링에서 정의되지 않은 httpStatus 일 경우
            throw new ResourceClientException(requestUrl, ex);
        } catch (ResourceAccessException ex) {
            // Request 관련 timeout 예외가 발생한 경우.
            if (ex.getCause() instanceof SocketTimeoutException
                    || ex.getCause() instanceof ConnectTimeoutException) {
                // timeout Exception
                throw new ResourceTimeoutException(ex);
            }
            throw new ResourceClientException(requestUrl, ex);
        } catch (Exception ex) {
            // 그 외 기타 Exception 일 경우
            throw new ResourceClientException(requestUrl, ex);
        } finally {
            if (stopWatch != null && stopWatch.isRunning()) {
                stopWatch.stop();
            }
            afterLogging(requestUrl, httpMethod, httpEntity, stopWatch, isException);
        }
    }

    private void afterLogging(String resourceUrl, HttpMethod httpMethod, HttpEntity httpEntity, StopWatch stopWatch, boolean isException) {
        try {
//            HttpHeaders headers = Optional.ofNullable(httpEntity).map(HttpEntity::getHeaders).orElse(null);
//            String agentType = (headers == null) ? null : Optional.ofNullable(headers.get(HeaderKey.USER_AGENT_TYPE)).map(list -> list.get(0)).orElse(null);
//            String ip = (headers == null) ? null : Optional.ofNullable(headers.get(HeaderKey.CLIENT_IP)).map(list -> list.get(0)).orElse(null);
//            String mid = (headers == null) ? null : Optional.ofNullable(headers.get(HeaderKey.MID)).map(list -> list.get(0)).orElse(null);
//            String nonUserMid = (headers == null) ? null : Optional.ofNullable(headers.get(HeaderKey.NON_USER_MID)).map(list -> list.get(0)).orElse(null);
//            if (isException) {
//                log.warn("REQUEST FAIL! resourceUrl:{}, method:{}, wmp-user-agent-type:{}, wmp-client-ip:{}, wmp-mid:{}, wmp-non-user-mid:{}, timeSpent:{}"
//                        , resourceUrl, httpMethod, agentType, ip, mid, nonUserMid, stopWatch.getLastTaskTimeMillis());
//            } else {
//                log.info("request success. resourceUrl:{}, method:{}, wmp-user-agent-type:{}, wmp-client-ip:{}, wmp-mid:{}, wmp-non-user-mid:{}, timeSpent:{}"
//                        , resourceUrl, httpMethod, agentType, ip, mid, nonUserMid, stopWatch.getLastTaskTimeMillis());
//            }
        } catch (Exception ex) {
            log.warn("afterLogging Exception!!!! <stackTrace:{}>", ExceptionUtils.getStackTrace(ex));
        }
    }

    /**
     * 사용 중인 RestTemplate 을 반환.
     * restTemplate 에 의존적인 기능을 커스텀하기 위함
     *
     * @return RestTemplate
     */
    public RestTemplate getRestTemplate() {
        return restTemplate;
    }

    public Map<String, Object> getForResponseObjectMap(String apiId, String uri, ParameterizedTypeReference typeReference) {
        ResponseEntity<Map<String, Object>> responseEntity = getForResponseEntityMap(apiId, uri, typeReference);
        return responseEntity.getBody();
    }

    public ResponseEntity getForResponseEntityMap(String apiId, String uri, ParameterizedTypeReference typeReference) {

        HttpHeaders httpHeaders = createHttpHeaders();
        HttpEntity httpEntity = new HttpEntity(httpHeaders);

        ResponseEntity responseEntity = exchange(apiId, uri, HttpMethod.GET, httpEntity, typeReference);
        return responseEntity;
    }
}
