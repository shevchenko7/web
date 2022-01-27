package com.sample.util;

import com.sample.dto.response.ResponseObject;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;

import java.io.IOException;
import java.net.URI;

public interface ResourceClientOperations {

    ResponseObject getForResponseObject(String apiId, String uri, ParameterizedTypeReference typeReference);

    ResponseObject getForResponseObject(String apiId, String uri);

    ResponseObject getForResponseObject(String apiId, String uri, HttpHeaders httpHeaders);

    ResponseObject getForResponseObject(String apiId, String uri, HttpHeaders httpHeaders, ParameterizedTypeReference typeReference);

    <T> ResponseEntity<T> getForResponseEntity(String apiId, String uri, Class<T> tClass);

    ResponseEntity getForResponseEntity(String apiId, String uri, ParameterizedTypeReference typeReference);

    <T> ResponseEntity<T> getForResponseEntity(String apiId, String uri, HttpHeaders httpHeaders, Class<T> tClass);

    ResponseEntity getForResponseEntity(String apiId, String uri, HttpHeaders httpHeaders, ParameterizedTypeReference typeReference);

    <T> ResponseEntity<T> getForResponseEntity(String uri, Class<T> tClass);

    ResponseEntity getForResponseEntity(String uri, ParameterizedTypeReference typeReference);

    <T> ResponseEntity<T> getForResponseEntity(String uri, HttpHeaders httpHeaders, Class<T> tClass);

    ResponseEntity getForResponseEntity(String uri, HttpHeaders httpHeaders, ParameterizedTypeReference typeReference);

    ResponseObject postForResponseObject(String apiId, Object postObject, String uri);

    ResponseObject postForResponseObject(String apiId, Object postObject, String uri, ParameterizedTypeReference typeReference);

    ResponseObject postForResponseObject(String apiId, Object postObject, String uri, HttpHeaders httpHeaders);

    ResponseObject postForResponseObject(String apiId, Object postObject, String uri, HttpHeaders httpHeaders, ParameterizedTypeReference typeReference);

    <T> ResponseEntity<T> postForResponseEntity(String apiId, Object postObject, String uri, Class<T> tClass);

    <T> ResponseEntity<T> postForResponseEntity(String apiId, Object postObject, String uri, HttpHeaders httpHeaders, Class<T> tClass);

    ResponseEntity postForResponseEntity(String apiId, Object postObject, String uri, ParameterizedTypeReference typeReference);

    ResponseEntity postForResponseEntity(String apiId, Object postObject, String uri, HttpHeaders httpHeaders, ParameterizedTypeReference typeReference);

    <T> ResponseEntity<T> postForResponseEntity(String uri, Object postObject, Class<T> tClass);

    <T> ResponseEntity<T> postForResponseEntity(String uri, Object postObject, HttpHeaders httpHeaders, Class<T> tClass);

    ResponseEntity postForResponseEntity(String uri, Object postObject, ParameterizedTypeReference typeReference);

    ResponseEntity postForResponseEntity(String uri, Object postObject, HttpHeaders httpHeaders, ParameterizedTypeReference typeReference);

    ResponseObject postForFileUploadResponseObject(String apiId, MultiValueMap<String, Object> multiValueMap, String uri, ParameterizedTypeReference typeReference) throws IOException;

    <T> ResponseEntity<T> postForFileUploadResponseEntity(String apiId, MultiValueMap<String, Object> multiValueMap, String uri, Class<T> tClass) throws IOException;

    ResponseEntity postForFileUploadResponseEntity(String apiId, MultiValueMap<String, Object> multiValueMap, String uri, ParameterizedTypeReference typeReference) throws IOException;

    <T> ResponseEntity<T> postForFileUploadResponseEntity(String uri, MultiValueMap<String, Object> multiValueMap, Class<T> tClass) throws IOException;

    ResponseEntity postForFileUploadResponseEntity(String uri, MultiValueMap<String, Object> multiValueMap, ParameterizedTypeReference typeReference) throws IOException;

    ResponseObject delete(String apiId, String uri);

    ResponseObject delete(String apiId, String uri, ParameterizedTypeReference typeReference);

    ResponseObject put(String apiId, Object putObject, String uri);

    ResponseObject put(String apiId, Object putObject, String uri, ParameterizedTypeReference typeReference);

    ResponseEntity exchange(String resourceUrl, HttpMethod httpMethod, HttpEntity httpEntity, ParameterizedTypeReference responseType);

    ResponseEntity exchange(URI uri, HttpMethod httpMethod, HttpEntity httpEntity, ParameterizedTypeReference responseType);

    <T> ResponseEntity<T> exchange(String resourceUrl, HttpMethod httpMethod, HttpEntity httpEntity, Class<T> tClass);

    <T> ResponseEntity<T> exchange(URI uri, HttpMethod httpMethod, HttpEntity httpEntity, Class<T> tClass);

    ResponseEntity exchange(String apiId, String uri, HttpMethod httpMethod, HttpEntity httpEntity, ParameterizedTypeReference responseType);

    <T> ResponseEntity<T> exchange(String apiId, String uri, HttpMethod httpMethod, HttpEntity httpEntity, Class<T> tClass);

    String getResourceUrl(String apiId, String uri);
}
