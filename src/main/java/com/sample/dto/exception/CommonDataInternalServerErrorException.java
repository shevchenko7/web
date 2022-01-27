package com.sample.dto.exception;

/**
 * Created by deuxign on 2017. 8. 1..
 */
public class CommonDataInternalServerErrorException extends RuntimeException {

    public CommonDataInternalServerErrorException() {
        super();
    }

    public CommonDataInternalServerErrorException(String message) {
        super(message);
    }

    public CommonDataInternalServerErrorException(String message, Exception e) {
        super(message, e);
    }


}
