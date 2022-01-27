package com.sample.dto.exception;

/**
 * Created by deuxign on 2017. 8. 1..
 */
public class IllegalUserAgentTypeException extends RuntimeException {

    public IllegalUserAgentTypeException() {
        super();
    }

    public IllegalUserAgentTypeException(String message) {
        super(message);
    }
}
