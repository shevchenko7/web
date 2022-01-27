package com.sample.dto.exception;

public class JsonParserException extends RuntimeException {
    private static final long serialVersionUID = 1583510073013388142L;

    public JsonParserException(String message, Throwable cause) {
        super(message, cause);
    }
}
