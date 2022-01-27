package com.sample.dto.exception;

public class ResourceTimeoutException extends RuntimeException {
    public ResourceTimeoutException(Throwable cause) {
        super(cause);
    }
}