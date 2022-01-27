package com.sample.dto.exception.handler;

import com.sample.dto.exception.CommonDataInternalServerErrorException;
import com.sample.dto.exception.IllegalUserAgentTypeException;
import com.sample.dto.exception.ResourceClientException;
import com.sample.dto.exception.WmpObjectFilterException;
import com.sample.dto.response.ResponseError;
import com.sample.dto.response.ResponseErrorSource;
import com.sample.dto.response.ResponseObject;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.servlet.NoHandlerFoundException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.nio.charset.Charset;

@Slf4j
@ControllerAdvice
public class ExceptionControllerAdvice {

    private HttpHeaders getDefaultHttpHeaders(){
        HttpHeaders httpHeaders = new HttpHeaders();
        MediaType mediaType = new MediaType(MediaType.APPLICATION_JSON_UTF8, Charset.forName("UTF-8"));
        httpHeaders.setContentType(mediaType);
        return httpHeaders;
    }

    /**
     * Throwable로 발생되는 예외를 처리하는 메소드로 명시적이지 않는 모든 예외를 처리한다.<p> <p/> 응답 내용은 에러내용을 담은 {@link
     * ResponseObject} 와 {@link HttpStatus} 를 전달한다.<p> <p/> 추가로 Client 내부에서 발생된 모든 에러(404, 세션, 롤 권한
     * ...)엔 ResponseObject의 하위 요소인<br> {@link ResponseError#meta} 내에 API 정보를 추가하여 전달한다.
     *
     * @param req HttpServletRequest
     * @param ex  Exception
     * @return json타입으로 return
     * @see ResponseObject
     * @see ResponseError
     */
    @ExceptionHandler(Throwable.class)
    public Object handleServerError(HttpServletRequest req, Exception ex) {

        //응답할 ResponseObject 설정
        ResponseObject responseObject = setResponseObjectForException(req, ex, HttpStatus.INTERNAL_SERVER_ERROR, true);
        log.error("Throwable Error!!! uri: {}, trace: {}", req.getRequestURI(), ExceptionUtils.getStackTrace(ex));

        return new ResponseEntity<>(responseObject, getDefaultHttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Resttemplate 사용 시 예외를 처리하는 핸들러<p> <p/> 전달되는
     * Exception의 type에 따라 리턴되는 값이 변경된다. 세부내용은 하단의 내용을 참조한다. <p/>
     * <pre>
     * 1. RestClientResponseException 이 발생 할 경우
     *  - 리턴 : status, ResponseBody 그대로 전달
     *
     * 2. 기타 그외의 exception
     *  - 리턴 : status만 변경(500), ResponseObject를 전달
     *   * unknownHostException, IOException 등의 기타 Exception 처리
     *   * 에러 내용을 ResponseObject로 담아 전달
     * </pre>
     *
     * @param req HttpServletRequest
     * @param ex  ResourceClientException
     * @return responseEntity
     * @see RestClientResponseException
     * @see ResourceClientException
     * @see ResourceClient
     * @see ResponseObject
     * @see ResponseError
     */
    @ExceptionHandler(ResourceClientException.class)
    public HttpEntity<Object> handleResourceClientException(HttpServletRequest req, HttpServletResponse res, ResourceClientException ex) {

        Throwable cause = ex.getCause();
        /*
         * 1. RestClientResponseException이 발생 할 경우
         * 리턴 : status, ResponseBody 그대로 전달
         */
        if (cause instanceof RestClientResponseException) {
            res.setStatus(ex.getHttpStatus());

            log.error("ResourceClientException Error!!! uri:{}, resourceUrl:{}, httpStatus:{}, getResponseBody:{}", req.getRequestURI(),
                    ex.getResourceUrl(), ex.getHttpStatus(), ((RestClientResponseException) cause).getResponseBodyAsString());
        /*
         * 2. 기타 그외의 exception
         * 리턴 : status 지정(500), 에러 내용은 ResponseObject로 담아 전달
         */
        } else {
            res.setStatus(500);
            ResponseObject responseObject = setResponseObjectForException(req, ex, HttpStatus.INTERNAL_SERVER_ERROR, false);

            log.error("ResourceClientException Error!!! uri:{}, resourceUrl:{}, httpStatus:{}, getResponseObject:{}, trace:{}", req.getRequestURI(),
                    ex.getResourceUrl(), ex.getHttpStatus(), responseObject, ExceptionUtils.getStackTrace(ex));

            return new HttpEntity<>(responseObject, getDefaultHttpHeaders());
        }

        //추후 해당부분 세부분석 필요
        return new HttpEntity<>(ex.getResponseBody(), getDefaultHttpHeaders());
    }


    /**
     * 404 error not found 예외처리<p>
     *
     * @param req HttpServletRequest
     * @return json타입으로 return
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Object noHandlerFoundException(HttpServletRequest req, Exception ex) {

        ResponseObject responseObject = setResponseObjectForException(req, ex, HttpStatus.NOT_FOUND, true);
        log.warn("404 Not Found Error!!! <uri:{}>, <RequestMethod:{}>, <HttpStatus:{}>", req.getRequestURI(), req.getMethod(), HttpStatus.NOT_FOUND.value());
        return new ResponseEntity<>(responseObject, getDefaultHttpHeaders(), HttpStatus.NOT_FOUND);
    }

    /**
     * IllegalArgumentException 예외를 처리하는 핸들러
     *
     * @param req HttpServletRequest
     * @param ex  IllegalArgumentException
     * @return json타입으로 return
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public Object illegalArgumentExceptionHandler(HttpServletRequest req, IllegalArgumentException ex) {

        //응답할 ResponseObject 설정
        ResponseObject responseObject = setResponseObjectForException(req, ex, HttpStatus.UNPROCESSABLE_ENTITY, true);
        log.error("Invalid Argument!!! RequestUri:{}, trace: {}", req.getRequestURI(), ExceptionUtils.getStackTrace(ex));

        return new ResponseEntity<>(responseObject, getDefaultHttpHeaders(), HttpStatus.UNPROCESSABLE_ENTITY);

    }

    @ExceptionHandler(IllegalUserAgentTypeException.class)
    public Object illegalUserAgentTypeExceptionHandler(HttpServletRequest req, IllegalUserAgentTypeException ex) {

        //응답할 ResponseObject 설정
        ResponseObject responseObject = setResponseObjectForException(req, ex, HttpStatus.INTERNAL_SERVER_ERROR, true);

        return new ResponseEntity<>(responseObject, getDefaultHttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);

    }

    @ExceptionHandler(CommonDataInternalServerErrorException.class)
    public Object commonDataInternalServerErrorExceptionHandler(HttpServletRequest req, CommonDataInternalServerErrorException ex) {

        //응답할 ResponseObject 설정
        ResponseObject responseObject = setResponseObjectForException(req, ex, HttpStatus.INTERNAL_SERVER_ERROR, true);
        log.error("CommonDataInternalServerErrorException. <{}>", ExceptionUtils.getStackTrace(ex));

        return new ResponseEntity<>(responseObject, getDefaultHttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(WmpObjectFilterException.class)
    public Object handleWmpObjectFilterException(WmpObjectFilterException e) {
        ResponseObject responseObject = setResponseObjectForException(null, e, HttpStatus.INTERNAL_SERVER_ERROR, true);
        return new ResponseEntity<>(responseObject, getDefaultHttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * 에러 발생 시 리턴 할 ResponseObject를 spec에 맞춰 생성해주는 메소드<br> useMeta의 경우 게이트웨이 내부에서 발생한 에러구분 플래그로
     * true일 경우 meta정보를 입력한다. <p/> {@code}
     * <pre>
     * ex) ResponseObject responseObject =
     *         setResponseObjectForException(req, ex, httpStatus, false);
     * </pre>
     * <p/> 이는 Client 내부 발생 에러인지, API에서 발생한 에러인지 구분을 위한 용도로 useMeta를 true로 하게 되면,<br>
     * ResponseObject의 하위 요소인 {@link ResponseError#meta} 내에 메타 정보를 입력하여 구분할 수 있도록 하게 한다.
     *
     * @param request    HttpServletRequest
     * @param ex         Exception
     * @param httpStatus ResponseObject 내에 입력할 HttpStatus
     * @param useMeta    Client 내부에서 발생한 에러구분 플래그. true일 경우 meta정보를 입력한다
     * @return ResponseObject
     */
    private ResponseObject setResponseObjectForException(HttpServletRequest request, Exception ex, HttpStatus httpStatus, boolean useMeta) {
        //ResponseError 설정
        ResponseError responseError = new ResponseError();
        responseError.setStatus(httpStatus.toString());

        ResponseErrorSource responseErrorSource = new ResponseErrorSource();
        responseErrorSource.setPointer(request.getRequestURI());

        responseError.setSource(responseErrorSource);
        responseError.setTitle(ExceptionUtils.getMessage(ex));
        responseError.setDetail(ExceptionUtils.getStackTrace(ex));

        //게이트웨이 내부에서 발생한 에러 구분을 위해 meta정보를 입력
        if (useMeta) {
            responseError.setMeta("sample");
        }

        //ResponseObject 설정
        ResponseObject responseObject = new ResponseObject();
        responseObject.addError(responseError);

        return responseObject;
    }

}
