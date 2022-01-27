package com.sample.dto.exception;

public class WmpObjectFilterException extends RuntimeException {
    private Object obj;

    public WmpObjectFilterException(Throwable cause) {
        super(cause);
    }

    public WmpObjectFilterException(Exception e, Object obj) {
        super(e);
        this.obj = obj;
    }

    public Object getObj() {
        return obj;
    }
}